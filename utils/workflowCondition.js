// Condition helpers of the workflow step editor (C22e): pure functions behind `ConditionBuilder.vue` and the step validation.
// Rules copied from BACK's `WorkflowStepValidator.validateCondition` and `WorkflowFieldTypeRules` (checked 2026-11-15):
//   - a node is a GROUP `{join: ALL|ANY, items[1..10]}` (no `field`) or a LEAF `{field, operator, value}`; BACK treats a node as a group
//     when `items` is present, so a leaf must never carry an `items` key;
//   - groups nest at most 3 levels (the root group is level 1); a leaf can sit at any level;
//   - the field is a key of the subject's `fields`, or `step.<stepKey>.<outputKey>` of an EARLIER ACTION step's output;
//   - operators per field type: `operatorsFor`; values: NUMBER a number, ID an integer, TEXT a non-blank string up to 200 characters,
//     BOOLEAN a boolean, IN a non-empty list of 1..50 such values.
// No Nuxt auto-imports: the file is imported by plain Node in the logic tests.
import { operatorsFor } from './workflowMeta.js'
import { toLatinDigits } from './jalali.js'
import { stepTypeOf } from './workflowDefinition.js'

export const MAX_CONDITION_ITEMS = 10
export const MAX_CONDITION_DEPTH = 3
export const MAX_IN_VALUES = 50
export const MAX_TEXT_VALUE = 200

const fa = (n) => n.toLocaleString('fa-IR')

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

// BACK: `grouped()` is `items != null`
export const isGroup = (node) => isPlainObject(node) && Array.isArray(node.items)

export const newLeaf = () => ({ field: '', operator: 'EQ', value: null })
export const newGroup = (items) => ({ join: 'ALL', items: items ?? [newLeaf()] })

// ---------- the fields a condition can use ----------

// `[{key, title, type, source: 'entity' | 'step'}]`: the subject's fields, then the outputs of every earlier ACTION step whose action is
// in `systemActions` (BACK adds a step's outputs only after that step, so a step never sees its own or later outputs)
export const conditionFieldsFor = (subject, earlierSteps, systemActions) => {
  const fields = (subject?.fields ?? []).map((field) => ({
    key: field.key,
    title: field.title || field.key,
    type: field.type,
    source: 'entity',
  }))
  for (const step of earlierSteps ?? []) {
    if (!isPlainObject(step) || stepTypeOf(step) !== 'ACTION') continue
    const action = (systemActions ?? []).find((item) => item.code === step.systemAction?.code)
    for (const output of action?.outputs ?? []) {
      fields.push({
        key: `step.${step.key}.${output.key}`,
        title: `«${step.title || step.key}»: ${output.title || output.key}`,
        type: output.type,
        source: 'step',
      })
    }
  }
  return fields
}

// ---------- typed values ----------

// «۱٬۲۰۰٫۵» → "1200.5": Persian digits, the Persian thousands and decimal marks, spaces. A plain comma is a thousands mark in a single value
// but the separator of an IN list, so the caller says which.
const normalizeNumberText = (raw, { keepComma }) => {
  let text = toLatinDigits(raw).replace(/٫/g, '.').replace(/[٬\s]/g, '')
  if (!keepComma) text = text.replace(/,/g, '')
  return text
}

// One value of `type` from typed text → `{ok: true, value}` or `{ok: false, error}`
const parseSingle = (type, raw, inList) => {
  if (type === 'NUMBER') {
    const text = normalizeNumberText(raw, { keepComma: inList })
    if (!/^-?\d+(\.\d+)?$/.test(text)) return { ok: false, error: 'یک عدد وارد کنید' }
    const value = Number(text)
    return Number.isFinite(value) ? { ok: true, value } : { ok: false, error: 'عدد خیلی بزرگ است' }
  }
  if (type === 'ID') {
    const text = normalizeNumberText(raw, { keepComma: inList })
    if (!/^-?\d+$/.test(text) || !Number.isSafeInteger(Number(text))) return { ok: false, error: 'یک عدد صحیح وارد کنید' }
    return { ok: true, value: Number(text) }
  }
  if (type === 'BOOLEAN') {
    if (raw === true || raw === 'true') return { ok: true, value: true }
    if (raw === false || raw === 'false') return { ok: true, value: false }
    return { ok: false, error: 'بله یا خیر را انتخاب کنید' }
  }
  // TEXT, and a field whose type is not known
  const text = String(raw ?? '').trim()
  if (!text) return { ok: false, error: 'مقدار را وارد کنید' }
  if (text.length > MAX_TEXT_VALUE) return { ok: false, error: `مقدار بیش از ${fa(MAX_TEXT_VALUE)} نویسه است` }
  return { ok: true, value: text }
}

// Typed text → the value a condition stores: a number for NUMBER and ID, a boolean for BOOLEAN, a string for TEXT, and for the IN operator
// an array of those (items separated by a comma `,` or `،` or a new line; empty items are skipped). `{ok: false, error}` when it is not valid.
export const parseValueText = (type, operator, text) => {
  if (operator !== 'IN') return parseSingle(type, text, false)
  const parts = String(text ?? '')
    .split(/[,،\n]/)
    .map((part) => part.trim())
    .filter(Boolean)
  if (!parts.length) return { ok: false, error: 'دست‌کم یک مقدار وارد کنید' }
  if (parts.length > MAX_IN_VALUES) return { ok: false, error: `حداکثر ${fa(MAX_IN_VALUES)} مقدار` }
  const values = []
  for (const part of parts) {
    const parsed = parseSingle(type, part, true)
    if (!parsed.ok) return { ok: false, error: `«${part}»: ${parsed.error}` }
    values.push(parsed.value)
  }
  return { ok: true, value: values }
}

// The text a typed value shows in its input (the inverse of parseValueText)
export const valueToText = (value) => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map((item) => String(item)).join(', ')
  return String(value)
}

// A stored single value fits the type (BACK `WorkflowFieldTypeRules.accepts`). A type this file does not know accepts nothing.
const acceptsValue = (type, value) => {
  switch (type) {
    case 'NUMBER':
      return typeof value === 'number' && Number.isFinite(value)
    case 'ID':
      return typeof value === 'number' && Number.isInteger(value)
    case 'TEXT':
      return typeof value === 'string' && value.trim() !== '' && value.length <= MAX_TEXT_VALUE
    case 'BOOLEAN':
      return typeof value === 'boolean'
    default:
      return false
  }
}

// ---------- issues ----------

const fieldTypeOf = (fieldMap, key) => fieldMap?.get(key)?.type

// The first problem of ONE node, or '' when the node itself is fine (children are not looked at). `fieldMap` is a Map key → field, `known`
// says whether the field list is trustworthy: BACK skips the field checks when the subject is unknown, so without a catalog only the
// shape is checked here.
export const nodeIssue = (node, depth, fieldMap, known = true) => {
  if (!isPlainObject(node)) return 'شرط خالی است'
  if (isGroup(node)) {
    if (depth > MAX_CONDITION_DEPTH) return `گروه شرط بیش از ${fa(MAX_CONDITION_DEPTH)} سطح تودرتو است`
    if (node.join !== 'ALL' && node.join !== 'ANY') return 'نوع گروه را انتخاب کنید: همه‌ی شرط‌ها یا دست‌کم یکی'
    if (node.field !== null && node.field !== undefined && node.field !== '') return 'گروه شرط نباید فیلد داشته باشد'
    if (!node.items.length) return 'گروه باید دست‌کم یک شرط داشته باشد'
    if (node.items.length > MAX_CONDITION_ITEMS) return `هر گروه حداکثر ${fa(MAX_CONDITION_ITEMS)} شرط دارد`
    if (node.items.some((item) => !isPlainObject(item))) return 'گروه شرط یک مورد خالی دارد'
    return ''
  }
  if (!node.field) return 'فیلد را انتخاب کنید'
  const type = fieldTypeOf(fieldMap, node.field)
  if (known) {
    if (type === undefined) return `فیلد «${node.field}» برای این موجودیت یا مرحله‌های قبلی تعریف نشده است`
    if (!node.operator || !operatorsFor(type).includes(node.operator)) {
      return 'عملگر انتخاب‌شده برای این نوع فیلد مجاز نیست'
    }
  } else if (!node.operator) {
    return 'عملگر را انتخاب کنید'
  }
  if (node.operator === 'IN') {
    const list = node.value
    if (!Array.isArray(list) || !list.length) return 'دست‌کم یک مقدار وارد کنید'
    if (list.length > MAX_IN_VALUES) return `حداکثر ${fa(MAX_IN_VALUES)} مقدار`
    if (known && !list.every((item) => acceptsValue(type, item))) return 'مقدارها با نوع فیلد جور نیستند'
    return ''
  }
  if (node.value === null || node.value === undefined || node.value === '') return 'مقدار را وارد کنید'
  if (known && !acceptsValue(type, node.value)) return 'مقدار با نوع فیلد جور نیست'
  return ''
}

// Every problem of a condition, in document order (a group with a problem is reported and its children are not walked: BACK does the same)
export const conditionIssues = (node, fieldMap, known = true, depth = 1) => {
  const own = nodeIssue(node, depth, fieldMap, known)
  if (own) return [own]
  if (!isGroup(node)) return []
  return node.items.flatMap((item) => conditionIssues(item, fieldMap, known, depth + 1))
}

export const fieldMapOf = (fields) => new Map((fields ?? []).map((field) => [field.key, field]))

// ---------- edits that return a new tree (the builder never mutates what it was given) ----------

// Leaf with another field: the operator is kept when the new type allows it (EQ otherwise) and the value is cleared when the type or
// operator changed, because the old value would be of the wrong kind
export const withLeafField = (leaf, fieldKey, newType, oldType) => {
  const allowed = operatorsFor(newType)
  const operator = allowed.includes(leaf.operator) ? leaf.operator : allowed[0]
  const keep = oldType === newType && operator === leaf.operator
  return { ...leaf, field: fieldKey, operator, value: keep ? leaf.value : null }
}

// Leaf with another operator: moving between IN (a list) and a single value clears the value
export const withLeafOperator = (leaf, operator) => {
  const wasList = leaf.operator === 'IN'
  const isList = operator === 'IN'
  return { ...leaf, operator, value: wasList === isList ? leaf.value : null }
}

// The same tree with every `step.<oldKey>.<output>` field renamed (a step key was renamed). Returns the SAME object when nothing in it
// refers to the old key, so callers can tell whether anything changed by reference.
export const renameConditionField = (node, oldKey, newKey) => {
  if (!isPlainObject(node)) return node
  if (isGroup(node)) {
    let changed = false
    const items = node.items.map((item) => {
      const next = renameConditionField(item, oldKey, newKey)
      if (next !== item) changed = true
      return next
    })
    return changed ? { ...node, items } : node
  }
  const prefix = `step.${oldKey}.`
  if (typeof node.field === 'string' && node.field.startsWith(prefix)) {
    return { ...node, field: `step.${newKey}.${node.field.slice(prefix.length)}` }
  }
  return node
}
