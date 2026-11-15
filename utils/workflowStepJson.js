// JSON editor of the non-approval steps (C22f): which keys the textarea may hold per step type, how its text is turned into a step, and
// the templates. Pure functions, no Nuxt auto-imports (imported by plain Node in the logic tests).
//
// The textarea holds ONLY the type-specific keys. `mergeStepJson` puts exactly those keys back into a copy of the step and touches nothing
// else (`key`, `title`, `type`, `condition` and every other field are not in the text and stay as they are). A key outside the allowed
// set is an error, never silently dropped and never passed through. `JSON.parse` only: no eval.
import { cloneJson } from './workflowDefinition.js'
import { DEADLINE_UNIT_LABELS, OVERDUE_ACTION_LABELS, WAIT_TIMEOUT_LABELS } from './workflowMeta.js'

// Keys the textarea may hold per type (BACK `WorkflowStepValidator`: an ACTION step has no goTo and no deadline, an AUTO step no deadline
// and a goTo only with the GOTO decision, a WAIT step takes a deadline and a goTo)
export const JSON_KEYS_BY_TYPE = {
  ACTION: ['systemAction'],
  WAIT: ['waitEvent', 'deadline', 'goTo'],
  AUTO: ['autoDecision', 'goTo'],
}

// Every other field of a step: named in the error so the user knows where it is edited (or that it does not belong to this type)
const EDITED_ELSEWHERE = ['key', 'title', 'type', 'condition']
const OTHER_TYPE_FIELDS = ['approvers', 'completion', 'starterMayDecide', 'attachments', 'systemAction', 'waitEvent', 'autoDecision', 'goTo', 'deadline']

const AUTO_DECISIONS = ['APPROVE', 'REJECT', 'GOTO']
const PARAM_NAME = /^[A-Za-z][A-Za-z0-9_]*$/

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const isNil = (value) => value === null || value === undefined
const list = (items) => items.map((item) => `«${item}»`).join('، ')

// ---------- shape of each key ----------

// A nested object: only these sub-keys; each value nil or accepted by its check. Returns an error text or ''.
const checkObject = (name, value, shape) => {
  if (!isPlainObject(value)) return `«${name}» باید یک شیء باشد`
  const unknown = Object.keys(value).filter((sub) => !Object.hasOwn(shape, sub))
  if (unknown.length) return `«${name}»: کلید ناشناخته ${list(unknown)}؛ مجاز: ${list(Object.keys(shape))}`
  for (const [sub, check] of Object.entries(shape)) {
    if (isNil(value[sub])) continue
    const error = check(value[sub])
    if (error) return `«${name}.${sub}» ${error}`
  }
  return ''
}

const isText = (value) => (typeof value === 'string' ? '' : 'باید متن باشد')
const isInt = (value) => (Number.isInteger(value) ? '' : 'باید عدد صحیح باشد')
const oneOf = (allowed) => (value) => (allowed.includes(value) ? '' : `باید یکی از این‌ها باشد: ${list(allowed)}`)

const KEY_CHECKS = {
  systemAction: (value) => {
    const error = checkObject('systemAction', value, {
      code: isText,
      params: (params) => {
        if (!isPlainObject(params)) return 'باید یک شیء باشد'
        const bad = Object.keys(params).find((name) => !PARAM_NAME.test(name))
        return bad === undefined ? '' : `نام ورودی «${bad}» معتبر نیست (حرف انگلیسی، رقم و _)`
      },
    })
    return error
  },
  waitEvent: (value) =>
    checkObject('waitEvent', value, { code: isText, onTimeout: oneOf(Object.keys(WAIT_TIMEOUT_LABELS)) }),
  deadline: (value) =>
    checkObject('deadline', value, {
      amount: isInt,
      unit: oneOf(Object.keys(DEADLINE_UNIT_LABELS)),
      onOverdue: oneOf(Object.keys(OVERDUE_ACTION_LABELS)),
      escalateToRoleId: isInt,
      repeatEvery: isInt,
      escalateAgainToRoleId: isInt,
    }),
  autoDecision: (value) => (AUTO_DECISIONS.includes(value) ? '' : `«autoDecision» باید یکی از این‌ها باشد: ${list(AUTO_DECISIONS)}`),
  goTo: (value) => (typeof value === 'string' ? '' : '«goTo» باید متن (کلید یک مرحله) باشد'),
}

// ---------- text <-> step ----------

// The text the textarea starts with: the allowed keys of `step` that hold something, pretty-printed (`{}` when none)
export const stepJsonText = (step, type) => {
  const picked = {}
  for (const key of JSON_KEYS_BY_TYPE[type] ?? []) {
    if (!isNil(step?.[key])) picked[key] = step[key]
  }
  return JSON.stringify(picked, null, 2)
}

// Text → a copy of `step` with the allowed keys of `type` replaced by what the text says (a key the text leaves out, or sets to null, is
// removed from the step). `{ok: true, step}` or `{ok: false, error, detail?}` (Persian `error`; `detail` is the parser's own message).
// The input step is not changed.
export const mergeStepJson = (step, type, text) => {
  const allowed = JSON_KEYS_BY_TYPE[type]
  if (!allowed) return { ok: false, error: 'این نوع مرحله ویرایشگر JSON ندارد' }

  let parsed
  try {
    parsed = String(text ?? '').trim() === '' ? {} : JSON.parse(text)
  } catch (e) {
    return { ok: false, error: 'این متن JSON معتبر نیست', detail: e instanceof Error ? e.message : '' }
  }
  if (!isPlainObject(parsed)) return { ok: false, error: 'متن باید یک شیء JSON باشد، مثل { "autoDecision": "APPROVE" }' }

  const rejected = Object.keys(parsed).filter((key) => !allowed.includes(key))
  if (rejected.length) {
    const elsewhere = rejected.filter((key) => EDITED_ELSEWHERE.includes(key))
    const otherType = rejected.filter((key) => OTHER_TYPE_FIELDS.includes(key))
    const unknown = rejected.filter((key) => !elsewhere.includes(key) && !otherType.includes(key))
    const parts = []
    if (unknown.length) parts.push(`کلید ناشناخته: ${list(unknown)}`)
    if (elsewhere.length) parts.push(`${list(elsewhere)} را از بخش‌های بالای همین پنجره ویرایش کنید، نه از این‌جا`)
    if (otherType.length) parts.push(`${list(otherType)} برای این نوع مرحله مجاز نیست`)
    return { ok: false, error: `${parts.join('؛ ')}. کلیدهای مجاز: ${list(allowed)}` }
  }

  for (const key of allowed) {
    if (isNil(parsed[key])) continue
    const error = KEY_CHECKS[key](parsed[key])
    if (error) return { ok: false, error }
  }

  const next = cloneJson(step)
  for (const key of allowed) {
    if (isNil(parsed[key])) delete next[key]
    else next[key] = parsed[key]
  }
  return { ok: true, step: next }
}

// ---------- templates ----------

// `[{id, label, text}]` for a type. `goToKey` pre-fills the GOTO template with a valid later step key (empty when there is none).
export const jsonTemplates = (type, goToKey = '') => {
  const text = (value) => JSON.stringify(value, null, 2)
  if (type === 'ACTION') return [{ id: 'action', label: 'اقدام سیستمی', text: text({ systemAction: { code: '', params: {} } }) }]
  if (type === 'WAIT') {
    return [
      {
        id: 'wait',
        label: 'انتظار برای رویداد با مهلت',
        text: text({
          waitEvent: { code: '', onTimeout: 'CONTINUE' },
          deadline: { amount: 1, unit: 'WORKING_DAYS', onOverdue: 'NONE' },
        }),
      },
    ]
  }
  if (type === 'AUTO') {
    return [
      { id: 'approve', label: 'تأیید خودکار', text: text({ autoDecision: 'APPROVE' }) },
      { id: 'reject', label: 'رد خودکار', text: text({ autoDecision: 'REJECT' }) },
      { id: 'goto', label: 'رفتن به مرحله‌ی بعدتر', text: text({ autoDecision: 'GOTO', goTo: goToKey }) },
    ]
  }
  return []
}

// The text of an ACTION template for one registered action (`getApproverOptions().systemActions[i]`): its code and every input with an
// empty value of the right kind, so the user sees the names to fill
export const actionTemplateText = (definition) => {
  const params = {}
  for (const param of definition?.params ?? []) {
    if (param.type === 'BOOLEAN') params[param.key] = false
    else if (param.type === 'TEXT') params[param.key] = ''
    else if (param.type === 'CHOICE') params[param.key] = Object.keys(param.choices ?? {})[0] ?? ''
    else params[param.key] = null
  }
  return JSON.stringify({ systemAction: { code: definition?.code ?? '', params } }, null, 2)
}
