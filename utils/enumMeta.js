// Helpers for BACK enum → label/color maps. A map entry is `{label, color}` (Nuxt UI color token) or a plain label string.
// Unknown values fall back to the raw value with a neutral color, so a new BACK enum never breaks a screen.

const normalize = (entry) => (typeof entry === 'string' ? { label: entry, color: 'neutral' } : entry)

// metaOf(STATUS_META, 'PAID') → {label, color}; unknown → {label: raw value or '—', color: 'neutral'}
export const metaOf = (map, value) => {
  const entry = map?.[value]
  if (entry === undefined || entry === null) return { label: value ?? '—', color: 'neutral' }
  return normalize(entry)
}

export const labelOf = (map, value) => metaOf(map, value).label

// selectItems(STATUS_META, 'همه') → [{value:'all', label:'همه'}, {value:'PAID', label:'پرداخت شده'}, …]
// Without allLabel there is no 'all' item.
export const selectItems = (map, allLabel = null) => {
  const items = Object.keys(map ?? {}).map((value) => ({ value, label: labelOf(map, value) }))
  return allLabel === null ? items : [{ value: 'all', label: allLabel }, ...items]
}
