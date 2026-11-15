// Helpers of the workflow designer (C22, module WORKFLOW_DESIGN): limits copied from BACK's `WorkflowStepValidator` / request classes,
// step helpers and the defensive parser of an imported definition. Pure functions, no Nuxt auto-imports.
//
// The one rule of this file: a step is a plain JSON object that is handed around WHOLE. BACK's `WorkflowStepDTO` has 13 fields and the
// designer only understands some of them, so no helper here rebuilds a step field by field; a step is only cloned, moved, replaced or
// created from scratch.

export const MAX_STEPS = 20 // BACK: `@Size(max = 20)` on `steps`
export const MAX_DEFINITION_TITLE = 200 // BACK: `@Size(max = 200)` on `title`
export const MAX_CODE_LENGTH = 50 // BACK: `@Size(max = 50)` on `subject` and `action`
export const STEP_KEY_PATTERN = /^[a-z][a-z0-9_]{0,29}$/ // WorkflowStepValidator.STEP_KEY
export const IMPORT_MAX_BYTES = 1024 * 1024 // an import file or pasted text above 1 MB is refused before parsing

// Deep copy of JSON data (also of a reactive proxy, which `structuredClone` rejects)
export const cloneJson = (value) => JSON.parse(JSON.stringify(value))

// A step without `type` is an approval step (BACK: `approvalStep()` is `type == null || APPROVAL`)
export const stepTypeOf = (step) => step?.type || 'APPROVAL'

// The step «افزودن مرحله» appends (the plan's shape). The key is `s<n>` with the first n that no step uses yet, so it is unique and
// matches STEP_KEY_PATTERN
export const newStep = (steps) => {
  const used = new Set((steps ?? []).map((step) => step?.key))
  let n = (steps?.length ?? 0) + 1
  while (used.has(`s${n}`)) n += 1
  return { key: `s${n}`, title: 'مرحله‌ی تازه', type: 'APPROVAL', approvers: [], completion: 'ANY' }
}

// The other steps of the list that jump to `key` (`goTo`); used to warn before a step is deleted. No step is touched.
export const stepsJumpingTo = (steps, key) =>
  (steps ?? []).filter((step) => step?.goTo && step.goTo === key && step.key !== key)

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const isText = (value) => typeof value === 'string' && value.trim() !== ''

// Parses an exported definition (a file or pasted text) into BACK's create body `{title, subject, action, steps}`.
// Defensive: `JSON.parse` only (never eval), the shape is checked field by field, and only these four keys are kept (an `id`, `key`,
// `status` or `version` in the file is dropped, BACK would ignore them anyway). The steps are NOT inspected beyond "an object each":
// a draft may be incomplete and BACK validates it on publish. Returns `{ok: true, value}` or `{ok: false, error}` (a Persian message).
export const parseDefinitionImport = (text) => {
  if (typeof text !== 'string' || !text.trim()) return { ok: false, error: 'فایل یا متنی برای ورود وجود ندارد' }
  if (text.length > IMPORT_MAX_BYTES) return { ok: false, error: 'حجم متن بیش از یک مگابایت است' }

  let data
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: 'این متن JSON معتبر نیست' }
  }

  if (!isPlainObject(data)) {
    return { ok: false, error: 'ساختار فایل درست نیست: باید یک شیء با title، subject، action و steps باشد' }
  }
  if (!isText(data.title)) return { ok: false, error: 'فیلد title (عنوان فرایند) خالی است یا متن نیست' }
  if (data.title.trim().length > MAX_DEFINITION_TITLE) {
    return { ok: false, error: `عنوان فرایند بیش از ${MAX_DEFINITION_TITLE.toLocaleString('fa-IR')} نویسه است` }
  }
  if (!isText(data.subject) || data.subject.length > MAX_CODE_LENGTH) {
    return { ok: false, error: 'فیلد subject (کد موجودیت) خالی است یا درست نیست' }
  }
  if (!isText(data.action) || data.action.length > MAX_CODE_LENGTH) {
    return { ok: false, error: 'فیلد action (کد کار) خالی است یا درست نیست' }
  }
  if (!Array.isArray(data.steps)) return { ok: false, error: 'فیلد steps باید فهرستی از مرحله‌ها باشد' }
  if (data.steps.length > MAX_STEPS) {
    return { ok: false, error: `تعداد مرحله‌ها بیش از ${MAX_STEPS.toLocaleString('fa-IR')} است` }
  }
  const badIndex = data.steps.findIndex((step) => !isPlainObject(step))
  if (badIndex !== -1) {
    return { ok: false, error: `مرحله‌ی ${(badIndex + 1).toLocaleString('fa-IR')} یک شیء نیست` }
  }

  return {
    ok: true,
    value: { title: data.title.trim(), subject: data.subject.trim(), action: data.action.trim(), steps: data.steps },
  }
}
