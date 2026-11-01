// URL ⇄ filter state ⇄ POST api/elastic/search body, for the product listing (/medications) and brand page.
//
// Query string (the URL is the source of truth, so links and the hero search box work):
//   search=<text>  categoryId=<id>  sort=<GoodsSearchSort>  page=<n>  inStock=true  onSale=true  timedOffer=true  brandIds=1,2
//   a=<attributeId>:o:<optionId,optionId>   a=<attributeId>:b:true   a=<attributeId>:n:<min>-<max>   (a repeats)

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'

// "۱۲٫۵" / "١٢.٥" → "12.5"; keeps only a number's characters
export const toLatinNumber = (value) =>
  String(value ?? '')
    .replace(/[۰-۹]/g, (d) => PERSIAN_DIGITS.indexOf(d))
    .replace(/[٠-٩]/g, (d) => ARABIC_DIGITS.indexOf(d))
    .replace(/[٫,]/g, '.')
    .replace(/[^\d.]/g, '')

export const emptyAttr = () => ({ optionIds: [], bool: false, min: '', max: '' })

export const emptySearchState = () => ({
  search: '',
  sort: '',
  page: 1,
  categoryId: null,
  inStock: false,
  onSale: false,
  timedOffer: false,
  brandIds: [],
  attrs: {},
})

const asArray = (value) => (Array.isArray(value) ? value : value == null ? [] : [value])
const toIdList = (value) =>
  String(value ?? '')
    .split(',')
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)

export const parseSearchQuery = (query) => {
  const state = emptySearchState()
  state.search = String(query.search ?? query.q ?? '').trim()
  state.sort = String(query.sort ?? '')
  state.page = Math.max(1, parseInt(query.page, 10) || 1)
  state.categoryId = Number(query.categoryId) > 0 ? Number(query.categoryId) : null
  state.inStock = query.inStock === 'true'
  state.onSale = query.onSale === 'true'
  state.timedOffer = query.timedOffer === 'true'
  state.brandIds = toIdList(query.brandIds)

  for (const entry of asArray(query.a)) {
    const [id, kind, raw = ''] = String(entry).split(':')
    if (!Number(id)) continue
    const attr = (state.attrs[id] ??= emptyAttr())
    if (kind === 'o') attr.optionIds = toIdList(raw)
    else if (kind === 'b') attr.bool = raw === 'true'
    else if (kind === 'n') {
      const [min = '', max = ''] = raw.split('-')
      attr.min = min
      attr.max = max
    }
  }
  return state
}

const attrActive = (attr) => attr.optionIds.length > 0 || attr.bool || attr.min !== '' || attr.max !== ''

export const buildSearchQuery = (state) => {
  const query = {}
  if (state.search) query.search = state.search
  if (state.sort) query.sort = state.sort
  if (state.page > 1) query.page = String(state.page)
  if (state.categoryId) query.categoryId = String(state.categoryId)
  if (state.inStock) query.inStock = 'true'
  if (state.onSale) query.onSale = 'true'
  if (state.timedOffer) query.timedOffer = 'true'
  if (state.brandIds.length) query.brandIds = state.brandIds.join(',')

  const attrs = []
  for (const [id, attr] of Object.entries(state.attrs)) {
    if (attr.optionIds.length) attrs.push(`${id}:o:${attr.optionIds.join(',')}`)
    else if (attr.bool) attrs.push(`${id}:b:true`)
    else if (attr.min !== '' || attr.max !== '') attrs.push(`${id}:n:${attr.min}-${attr.max}`)
  }
  if (attrs.length) query.a = attrs
  return query
}

export const activeFilterCount = (state) =>
  Number(Boolean(state.categoryId)) +
  Number(state.inStock) +
  Number(state.onSale) +
  state.brandIds.length +
  Object.values(state.attrs).filter(attrActive).length

// GoodsSearchRequestDTO. Unset filters are left out so BACK applies its defaults (no sort → RELEVANCE with text, else NEWEST).
export const toSearchRequest = (state, { size = 12, withPaging = true } = {}) => {
  const attributes = []
  for (const [id, attr] of Object.entries(state.attrs)) {
    const attributeId = Number(id)
    if (attr.optionIds.length) attributes.push({ attributeId, optionIds: attr.optionIds })
    else if (attr.bool) attributes.push({ attributeId, booleanValue: true })
    else if (attr.min !== '' || attr.max !== '') {
      attributes.push({
        attributeId,
        min: attr.min === '' ? null : Number(toLatinNumber(attr.min)),
        max: attr.max === '' ? null : Number(toLatinNumber(attr.max)),
      })
    }
  }

  const request = {}
  if (state.search) request.keyword = state.search
  if (state.sort) request.sort = state.sort
  if (state.categoryId) request.categoryId = state.categoryId // BACK includes its subcategories
  if (state.inStock) request.inStock = true
  if (state.onSale) request.onSale = true
  if (state.timedOffer) request.timedOffer = true
  if (state.brandIds.length) request.brandIds = state.brandIds
  if (attributes.length) request.attributes = attributes
  if (withPaging) {
    request.page = state.page - 1 // BACK pages are 0-based
    request.size = size
  }
  return request
}
