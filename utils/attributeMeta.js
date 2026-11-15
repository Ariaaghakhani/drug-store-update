// Goods attribute types (BACK `AttributeType`). Only SELECT and MULTI_SELECT carry options; only SELECT can be a variant axis.
export const ATTRIBUTE_TYPE_LABELS = {
  TEXT: 'متن',
  NUMBER: 'عدد',
  BOOLEAN: 'بله / خیر',
  SELECT: 'انتخاب تکی',
  MULTI_SELECT: 'انتخاب چندتایی',
}

export const ATTRIBUTE_TYPE_ITEMS = Object.entries(ATTRIBUTE_TYPE_LABELS).map(([value, label]) => ({ value, label }))

export const attributeTypeLabel = (type) => ATTRIBUTE_TYPE_LABELS[type] ?? type ?? '—'

// True for the types whose values are a fixed option list (SELECT, MULTI_SELECT)
export const hasOptions = (type) => type === 'SELECT' || type === 'MULTI_SELECT'
