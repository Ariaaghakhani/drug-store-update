// Logic of the workflow step editor (C22d/C22e/C22f): validation, type change, key rename and "did anything change". Pure functions, no
// Nuxt auto-imports (the file is imported by plain Node in the logic tests).
//
// The validation mirrors BACK's `WorkflowStepValidator` (checked 2026-11-15) so the modal shows the problem before «اعتبارسنجی» does.
// Two levels: an `error` is something BACK rejects whatever the store holds, and it blocks «تأیید»; a `warning` depends on what the store
// holds (a role or user id that is not in the loaded options, e.g. after an import from another store) and never blocks, because the
// user may only be fixing a title. Rules that need the database (a role with no active member, a custom action's own `validate`) are
// left to «اعتبارسنجی».
import { STEP_KEY_PATTERN, cloneJson, stepTypeOf } from './workflowDefinition.js'
import {
  conditionFieldsFor,
  conditionIssues,
  fieldMapOf,
  renameConditionField,
} from './workflowCondition.js'

export const MAX_STEP_TITLE = 100 // WorkflowStepValidator.MAX_TITLE
export const MAX_APPROVERS = 10 // MAX_APPROVERS
export const MAX_DEADLINE_DAYS = 365 // MAX_DEADLINE_DAYS
export const MAX_REPEAT_DAYS = 30 // MAX_REPEAT_DAYS

const APPROVER_TYPES = ['ROLE', 'USER', 'STARTER', 'PREVIOUS_ACTOR']
const COMPLETIONS = ['ANY', 'ALL', 'EACH']

const fa = (n) => n.toLocaleString('fa-IR')
const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const isSet = (value) => value !== null && value !== undefined
const nonEmptyApprovers = (step) => Array.isArray(step.approvers) && step.approvers.length > 0
const attachmentMode = (step) => step.attachments || 'OPTIONAL'

// ---------- type change ----------

// The keys of a step that BACK forbids for a type, when they hold something (WorkflowStepValidator: attachments only on APPROVAL; ACTION
// and AUTO and WAIT take no approvers; ACTION and AUTO no deadline; ACTION no goTo; AUTO a goTo only with the GOTO decision; WAIT and AUTO
// no systemAction; AUTO no waitEvent). A field the validator does not forbid (e.g. a leftover `waitEvent` on an ACTION step) is kept:
// it is invisible but harmless, and switching back brings it back.
const FORBIDDEN_CHECKS = {
  APPROVAL: {},
  ACTION: {
    approvers: nonEmptyApprovers,
    deadline: (step) => isSet(step.deadline),
    goTo: (step) => isSet(step.goTo),
    attachments: (step) => attachmentMode(step) !== 'OPTIONAL',
  },
  WAIT: {
    approvers: nonEmptyApprovers,
    systemAction: (step) => isSet(step.systemAction),
    attachments: (step) => attachmentMode(step) !== 'OPTIONAL',
  },
  AUTO: {
    approvers: nonEmptyApprovers,
    systemAction: (step) => isSet(step.systemAction),
    waitEvent: (step) => isSet(step.waitEvent),
    deadline: (step) => isSet(step.deadline),
    attachments: (step) => attachmentMode(step) !== 'OPTIONAL',
    goTo: (step) => isSet(step.goTo) && step.autoDecision !== 'GOTO',
  },
}

const FIELD_LABELS = {
  approvers: 'گیرندگان',
  deadline: 'مهلت',
  goTo: 'رفتن به مرحله‌ی دیگر',
  attachments: 'تنظیم پیوست فایل',
  systemAction: 'اقدام سیستمی',
  waitEvent: 'رویداد انتظار',
}

// `[{key, label}]` of the fields of `step` that BACK forbids for `type` and that hold something
export const forbiddenFields = (step, type) => {
  const checks = FORBIDDEN_CHECKS[type] ?? {}
  return Object.keys(checks)
    .filter((key) => checks[key](step))
    .map((key) => ({ key, label: FIELD_LABELS[key] ?? key }))
}

// What changing the step to `newType` would clear (empty when nothing non-empty is lost, and for the type the step already has)
export const discardedOnTypeChange = (step, newType) => (stepTypeOf(step) === newType ? [] : forbiddenFields(step, newType))

// A new step object with `type` set and the forbidden fields removed. Nothing else is touched (`key`, `title`, `condition`, and every field
// the new type allows stay as they are), except that a step turned INTO an approval gets the two fields the editor needs to show one
// (`approvers: []` and `completion: ANY`) when it has none. Returns a copy; the input is not changed.
export const applyTypeChange = (step, newType) => {
  const next = cloneJson(step)
  if (stepTypeOf(step) === newType) return next
  for (const { key } of discardedOnTypeChange(step, newType)) delete next[key]
  next.type = newType
  if (newType === 'APPROVAL') {
    if (!Array.isArray(next.approvers)) next.approvers = []
    if (!next.completion) next.completion = 'ANY'
  }
  return next
}

// ---------- "did the user change anything" ----------

// BACK treats a missing key, an explicit null, `attachments: OPTIONAL` and `starterMayDecide: false` the same way, so two steps that differ
// only in those are the same step. Used by the modal to hand the ORIGINAL object back when nothing really changed (the page then stays clean).
const normalizeForCompare = (value) => {
  if (Array.isArray(value)) return value.map(normalizeForCompare)
  if (!isPlainObject(value)) return value
  const out = {}
  for (const [key, item] of Object.entries(value)) {
    if (item === null || item === undefined) continue
    out[key] = normalizeForCompare(item)
  }
  return out
}

export const sameStep = (a, b) => {
  const strip = (step) => {
    const copy = normalizeForCompare(step)
    if (copy.attachments === 'OPTIONAL') delete copy.attachments
    if (copy.starterMayDecide === false) delete copy.starterMayDecide
    return JSON.stringify(copy)
  }
  return strip(a) === strip(b)
}

// ---------- key rename ----------

const renameRefString = (ref, oldKey, newKey) => {
  const prefix = `step.${oldKey}.`
  return ref.startsWith(prefix) ? `step.${newKey}.${ref.slice(prefix.length)}` : ref
}

// An action input: `{ref: "step.<old>.<out>"}` is renamed, and a `{step.<old>.<out>}` placeholder inside any text is too
const renameInParams = (value, oldKey, newKey) => {
  if (typeof value === 'string') return value.split(`{step.${oldKey}.`).join(`{step.${newKey}.`)
  if (Array.isArray(value)) return value.map((item) => renameInParams(item, oldKey, newKey))
  if (isPlainObject(value)) {
    const entries = Object.entries(value)
    if (entries.length === 1 && entries[0][0] === 'ref' && typeof entries[0][1] === 'string') {
      return { ref: renameRefString(entries[0][1], oldKey, newKey) }
    }
    return Object.fromEntries(entries.map(([name, item]) => [name, renameInParams(item, oldKey, newKey)]))
  }
  return value
}

// A step with every reference to `oldKey` renamed to `newKey` (its `goTo`, the `step.<old>.…` fields of its condition, and the refs and
// `{step.<old>.…}` placeholders in its action inputs). The same object when it refers to nothing.
const renameReferencesInStep = (step, oldKey, newKey) => {
  if (!isPlainObject(step)) return step
  let next = step
  if (step.goTo === oldKey) next = { ...next, goTo: newKey }
  if (isSet(step.condition)) {
    const condition = renameConditionField(step.condition, oldKey, newKey)
    if (condition !== step.condition) next = { ...next, condition }
  }
  if (isPlainObject(step.systemAction?.params)) {
    const params = renameInParams(step.systemAction.params, oldKey, newKey)
    if (JSON.stringify(params) !== JSON.stringify(step.systemAction.params)) {
      next = { ...next, systemAction: { ...step.systemAction, params } }
    }
  }
  return next
}

// The step list with `steps[index]` replaced by `newStep`. If `newStep.key` differs from the old key, every OTHER step that referred to
// the old key is updated in the same edit, so a rename never leaves a dangling `goTo` or `step.<old>.…` reference. Returns
// `{steps, updatedSteps}` (`updatedSteps` = how many other steps were touched). The input list and its steps are not changed.
export const replaceStep = (steps, index, newStep) => {
  const oldKey = steps[index]?.key
  const newKey = newStep?.key
  const renamed = typeof oldKey === 'string' && typeof newKey === 'string' && oldKey !== newKey
  let updatedSteps = 0
  const next = steps.map((step, i) => {
    if (i === index) return cloneJson(newStep)
    if (!renamed) return step
    const changed = renameReferencesInStep(step, oldKey, newKey)
    if (changed !== step) updatedSteps += 1
    return changed
  })
  return { steps: next, updatedSteps }
}

// How many other steps a rename of `steps[index]` to `newKey` would update (shown before the user confirms)
export const countRenameReferences = (steps, index, newKey) => {
  const oldKey = steps[index]?.key
  if (typeof oldKey !== 'string' || typeof newKey !== 'string' || oldKey === newKey) return 0
  return steps.filter((step, i) => i !== index && renameReferencesInStep(step, oldKey, newKey) !== step).length
}

// ---------- goTo ----------

// Keys a `goTo` of `steps[index]` may point at, by BACK's rules: not itself, not the NEXT step (that is the normal path), and for an AUTO
// step (decision GOTO) only LATER steps; APPROVAL and WAIT may also point back (to send a rejected request to an earlier step for fixing)
export const goToTargets = (steps, index, type) =>
  steps
    .map((step, i) => ({ step, i }))
    .filter(({ step, i }) => step?.key && i !== index && i !== index + 1 && (type !== 'AUTO' || i > index))
    .map(({ step }) => ({ key: step.key, title: step.title || step.key }))

// ---------- action inputs ----------

const REF_FIXED_TYPES = { '@starter': 'ID', '@instance': 'ID', '@entity': 'TEXT' }

// `{ref: "<…>"}` of an action input (BACK `WorkflowRefs.refOf`: a map with exactly the key `ref` holding a string), or null
export const refOf = (value) =>
  isPlainObject(value) && Object.keys(value).length === 1 && typeof value.ref === 'string' ? value.ref : null

// BACK `acceptsRef`: a ref fits TEXT always, NUMBER when the referenced field is NUMBER or ID, BOOLEAN when it is BOOLEAN; CHOICE, ROLE and
// USER inputs take no ref. The referenced thing is `@starter`, `@instance`, `@entity`, a subject field or an earlier step's output.
const refFits = (param, ref, fieldMap) => {
  const type = REF_FIXED_TYPES[ref] ?? fieldMap.get(ref)?.type
  if (!type) return false
  if (param.type === 'TEXT') return true
  if (param.type === 'NUMBER') return type === 'NUMBER' || type === 'ID'
  if (param.type === 'BOOLEAN') return type === 'BOOLEAN'
  return false
}

// Problems of the inputs of an ACTION step against the action's definition from `getApproverOptions().systemActions`. Returns
// `[{level, message}]`. The role of a ROLE input is checked against `roles` only as a warning (it may belong to another store).
const actionParamIssues = (systemAction, definition, fieldMap, roles) => {
  const issues = []
  const params = isPlainObject(systemAction?.params) ? systemAction.params : {}
  const known = new Set()
  for (const param of definition.params ?? []) {
    known.add(param.key)
    const value = params[param.key]
    const title = param.title || param.key
    const blank = value === null || value === undefined || (typeof value === 'string' && value.trim() === '')
    if (blank) {
      if (param.required) issues.push({ level: 'error', message: `ورودی «${title}» لازم است` })
      continue
    }
    const ref = refOf(value)
    let ok
    if (ref !== null) ok = refFits(param, ref, fieldMap)
    else if (param.type === 'TEXT') ok = typeof value === 'string' && (!param.maxLength || value.length <= param.maxLength)
    else if (param.type === 'CHOICE') ok = typeof value === 'string' && Object.hasOwn(param.choices ?? {}, value)
    else if (param.type === 'ROLE' || param.type === 'USER' || param.type === 'NUMBER') ok = typeof value === 'number'
    else if (param.type === 'BOOLEAN') ok = typeof value === 'boolean'
    else ok = false
    if (!ok) issues.push({ level: 'error', message: `ورودی «${title}» معتبر نیست` })
    else if (param.type === 'ROLE' && ref === null && roles && !roles.some((role) => role.id === value)) {
      issues.push({ level: 'warning', message: `نقش ورودی «${title}» در فهرست نقش‌های این فروشگاه نیست` })
    }
  }
  const unknown = Object.keys(params).find((name) => !known.has(name))
  if (unknown) issues.push({ level: 'error', message: `ورودی ناشناخته: ${unknown}` })
  return issues
}

// ---------- validation ----------

// Areas an issue belongs to, so the modal shows it next to the right field: key, title, approvers, completion, deadline, condition, goto
// (an APPROVAL step's read-only «رفتن به») and `details` (what the JSON editor of an ACTION, WAIT or AUTO step holds).
//
// `ctx`: `{index, steps, subject, roles, systemActions}`
//   steps          the whole current list (the step at `index` is the OLD version; `step` is the draft)
//   subject        the catalog entry `{fields, events}` of the definition's subject, or null when the catalog did not load
//   roles          `getApproverOptions().roles` (`[{id}]`), or null when the options did not load
//   systemActions  `getApproverOptions().systemActions`, or null when the options did not load
export const validateStep = (step, ctx) => {
  const issues = []
  const add = (area, message, level = 'error') => issues.push({ area, level, message })
  const { index = 0, steps = [], subject = null, roles = null, systemActions = null } = ctx ?? {}
  const type = stepTypeOf(step)

  // --- key and title (every type) ---
  if (typeof step.key !== 'string' || !STEP_KEY_PATTERN.test(step.key)) {
    add('key', `کلید باید با حرف کوچک انگلیسی شروع شود و فقط حرف کوچک انگلیسی، رقم و _ داشته باشد (حداکثر ${fa(30)} نویسه)`)
  } else if (steps.some((other, i) => i !== index && other?.key === step.key)) {
    add('key', 'این کلید برای مرحله‌ی دیگری از همین فرایند هم هست')
  }
  if (typeof step.title !== 'string' || !step.title.trim()) add('title', 'عنوان مرحله را وارد کنید')
  else if (step.title.length > MAX_STEP_TITLE) add('title', `عنوان بیش از ${fa(MAX_STEP_TITLE)} نویسه است`)

  // --- fields BACK forbids for this type (a `goTo` is judged by validateGoTo below) ---
  for (const { key, label } of forbiddenFields(step, type)) {
    if (key !== 'goTo') add('details', `«${label}» برای این نوع مرحله مجاز نیست`)
  }

  // --- per type ---
  if (type === 'APPROVAL') {
    validateApproval(step, { index, roles }, add)
  } else if (type === 'ACTION') {
    validateActionStep(step, { subject, roles, systemActions, steps, index }, add)
  } else if (type === 'WAIT') {
    validateWaitStep(step, subject, add)
  } else if (type === 'AUTO') {
    if (!step.autoDecision) add('details', 'تصمیم خودکار (تأیید، رد یا رفتن به مرحله) را انتخاب کنید')
    else if (!['APPROVE', 'REJECT', 'GOTO'].includes(step.autoDecision)) add('details', 'تصمیم خودکار نامعتبر است')
    if (!isSet(step.condition)) add('condition', 'مرحله‌ی تصمیم خودکار شرط لازم دارد')
  }

  // --- condition (every type; BACK skips it when the subject is unknown) ---
  if (isSet(step.condition)) {
    const fields = conditionFieldsFor(subject, steps.slice(0, index), systemActions ?? [])
    for (const message of conditionIssues(step.condition, fieldMapOf(fields), Boolean(subject))) add('condition', message)
  }

  // --- goTo ---
  validateGoTo(step, type, { steps, index }, add)

  return issues
}

function validateApproval(step, { index, roles }, add) {
  if (!COMPLETIONS.includes(step.completion)) add('completion', 'نحوه‌ی تکمیل مرحله را انتخاب کنید')

  const approvers = Array.isArray(step.approvers) ? step.approvers : []
  if (approvers.length === 0) add('approvers', 'دست‌کم یک گیرنده لازم است')
  else if (approvers.length > MAX_APPROVERS) add('approvers', `هر مرحله حداکثر ${fa(MAX_APPROVERS)} گیرنده دارد`)

  const seen = new Set()
  approvers.forEach((approver, i) => {
    const row = `گیرنده‌ی ${fa(i + 1)}`
    if (!isPlainObject(approver) || !APPROVER_TYPES.includes(approver.type)) {
      add('approvers', `${row}: نوع گیرنده را انتخاب کنید`)
      return
    }
    const signature = `${approver.type}:${approver.roleId ?? null}:${approver.userId ?? null}`
    if (seen.has(signature)) add('approvers', `${row}: یک گیرنده دو بار آمده است`)
    seen.add(signature)
    if (approver.type === 'ROLE') {
      if (!isSet(approver.roleId) || isSet(approver.userId)) add('approvers', `${row}: نقش را انتخاب کنید`)
      else if (roles && !roles.some((role) => role.id === approver.roleId)) {
        add('approvers', `${row}: نقش #${fa(approver.roleId)} در فهرست نقش‌های این فروشگاه نیست`, 'warning')
      }
    } else if (approver.type === 'USER') {
      if (!isSet(approver.userId) || isSet(approver.roleId)) add('approvers', `${row}: کارمند را انتخاب کنید`)
    } else {
      if (isSet(approver.roleId) || isSet(approver.userId)) add('approvers', `${row}: «ثبت‌کننده» و «تصمیم‌گیرنده‌ی قبلی» نقش یا کارمند نمی‌گیرند`)
      if (approver.type === 'PREVIOUS_ACTOR' && index === 0) {
        add('approvers', `${row}: مرحله‌ی اول «تصمیم‌گیرنده‌ی قبلی» ندارد`)
      }
    }
  })
  const onlyFixed = approvers.length > 0 && approvers.every((a) => a?.type === 'ROLE' || a?.type === 'USER')
  if (step.completion === 'ALL' && !onlyFixed) {
    add('completion', '«همه باید تأیید کنند» فقط برای نقش یا کارمند مشخص است، نه ثبت‌کننده یا تصمیم‌گیرنده‌ی قبلی')
  }

  validateDeadline(step.deadline, { escalation: true, roles }, add)
}

// A deadline: amount 1..365 and a unit (APPROVAL and WAIT); the overdue action rules only apply to an APPROVAL step
function validateDeadline(deadline, { escalation, roles }, add) {
  if (!isSet(deadline)) return
  const area = escalation ? 'deadline' : 'details'
  if (!Number.isInteger(deadline.amount) || deadline.amount < 1 || deadline.amount > MAX_DEADLINE_DAYS) {
    add(area, `مهلت باید عددی صحیح بین ${fa(1)} تا ${fa(MAX_DEADLINE_DAYS)} باشد`)
  }
  if (!deadline.unit) add(area, 'واحد مهلت (روز تقویمی یا روز کاری) را انتخاب کنید')
  if (!escalation) return

  const escalate = deadline.onOverdue === 'ESCALATE'
  if (escalate) {
    if (!isSet(deadline.escalateToRoleId)) add(area, 'برای ارجاع پس از مهلت، یکی از نقش‌ها را انتخاب کنید')
    else if (roles && !roles.some((role) => role.id === deadline.escalateToRoleId)) {
      add(area, `نقش ارجاع #${fa(deadline.escalateToRoleId)} در فهرست نقش‌های این فروشگاه نیست`, 'warning')
    }
  }
  if (isSet(deadline.repeatEvery) && (!Number.isInteger(deadline.repeatEvery) || deadline.repeatEvery < 1 || deadline.repeatEvery > MAX_REPEAT_DAYS)) {
    add(area, `فاصله‌ی تکرار باید بین ${fa(1)} تا ${fa(MAX_REPEAT_DAYS)} روز باشد`)
  }
  if (isSet(deadline.escalateAgainToRoleId)) {
    if (!escalate || !isSet(deadline.repeatEvery)) {
      add(area, 'ارجاع دوم فقط با «ارجاع به نقش دیگر» و فاصله‌ی تکرار ممکن است')
    } else if (roles && !roles.some((role) => role.id === deadline.escalateAgainToRoleId)) {
      add(area, `نقش ارجاع دوم #${fa(deadline.escalateAgainToRoleId)} در فهرست نقش‌های این فروشگاه نیست`, 'warning')
    }
  }
}

function validateActionStep(step, { subject, roles, systemActions, steps, index }, add) {
  const spec = step.systemAction
  if (!isPlainObject(spec) || typeof spec.code !== 'string' || !spec.code.trim()) {
    add('details', 'اقدام سیستمی این مرحله را انتخاب کنید')
    return
  }
  if (!systemActions) return // the options did not load: the code and inputs are left to «اعتبارسنجی»
  const definition = systemActions.find((action) => action.code === spec.code)
  if (!definition) {
    add('details', `اقدام «${spec.code}» در فهرست اقدام‌های این فروشگاه نیست`)
    return
  }
  const fields = conditionFieldsFor(subject, steps.slice(0, index), systemActions)
  for (const issue of actionParamIssues(spec, definition, fieldMapOf(fields), roles)) add('details', issue.message, issue.level)
}

function validateWaitStep(step, subject, add) {
  const wait = step.waitEvent
  if (!isPlainObject(wait) || typeof wait.code !== 'string' || !wait.code.trim()) {
    add('details', 'رویدادی را که مرحله منتظرش می‌ماند انتخاب کنید')
  } else if (subject && !(subject.events ?? []).some((event) => event.code === wait.code)) {
    add('details', `رویداد «${wait.code}» از رویدادهای این موجودیت نیست`)
  }
  validateDeadline(step.deadline, { escalation: false, roles: null }, add)
}

// BACK `validateGoTo`: only APPROVAL and WAIT (when the step is rejected) and AUTO with the GOTO decision (required there) have a goTo; the
// target is another step of the same definition, not the step itself and not the next one; an AUTO step only goes forward
function validateGoTo(step, type, { steps, index }, add) {
  const autoGoTo = type === 'AUTO' && step.autoDecision === 'GOTO'
  if (!isSet(step.goTo) || step.goTo === '') {
    if (autoGoTo) add('details', 'مرحله‌ی مقصد «رفتن به مرحله» را انتخاب کنید')
    return
  }
  if (type === 'ACTION' || (type === 'AUTO' && !autoGoTo)) {
    add('details', 'این نوع مرحله «رفتن به مرحله» ندارد')
    return
  }
  const area = type === 'APPROVAL' ? 'goto' : 'details'
  const list = steps.map((other, i) => (i === index ? step : other))
  const target = list.findIndex((other) => other?.key === step.goTo)
  if (target < 0 || target === index) add(area, `مرحله‌ی مقصد «${step.goTo}» در این فرایند نیست یا خود همین مرحله است`)
  else if (target === index + 1) add(area, 'مقصد نمی‌تواند مرحله‌ی بعدی باشد؛ آن همان مسیر عادی است')
  else if (autoGoTo && target < index) add(area, 'تصمیم خودکار فقط به مرحله‌های بعدتر می‌رود')
}

