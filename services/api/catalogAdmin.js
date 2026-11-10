/**
 * Catalog admin: goods attribute library (`/api/attributes`, module GOODS_ATTRIBUTE), category attribute assignments
 * and goods variants (`/api/goods/variants`, module GOODS). Verified against BACK's AttributeController and
 * GoodsVariantController. Payload = res.data.data. Attribute lists are unpaged.
 */
export default (apiCaller) => ({
  // GET, unpaged → AttributeDefinitionDTO[] {id, name, type TEXT|NUMBER|BOOLEAN|SELECT|MULTI_SELECT, unit, options[{id, value, sortOrder}]}
  listAttributes(config) {
    return apiCaller.get('api/attributes', config)
  },

  // POST config.data {id} → AttributeDefinitionDTO with its options
  getAttribute(config) {
    return apiCaller.post('api/attributes/get', config)
  },

  // POST (201), config.data {name ≤100, type, unit ≤30 (NUMBER only), options (SELECT and MULTI_SELECT only) [{value ≤100, sortOrder}]}
  createAttribute(config) {
    return apiCaller.post('api/attributes', config)
  },

  // PUT, config.data {id, name, type, unit, options}. An option without id is new; an omitted option is removed
  updateAttribute(config) {
    return apiCaller.put('api/attributes', config)
  },

  // POST config.data {id} → 204. Fails with a BACK message while goods still use the attribute
  deleteAttribute(config) {
    return apiCaller.post('api/attributes/delete', config)
  },

  // POST config.data {categoryId} (public) → CategoryAttributeDTO[] {id, categoryId, categoryName, inherited, attribute, required, filterable, variantAxis, sortOrder}; inherited = from a parent category
  listCategoryAttributes(config) {
    return apiCaller.post('api/attributes/category/list', config)
  },

  // POST config.data {categoryId, attributeId, required, filterable, variantAxis (SELECT only), sortOrder}; creates or updates the assignment
  assignCategoryAttribute(config) {
    return apiCaller.post('api/attributes/category/assign', config)
  },

  // POST config.data {categoryId, attributeId} → 204
  unassignCategoryAttribute(config) {
    return apiCaller.post('api/attributes/category/unassign', config)
  },

  // POST config.data {modelId} → GoodsVariantDTO[] {id, goodCode, barcode, nameFa, price, purchasePrice, discountPercent, discountStartsAt, discountEndsAt, activeDiscountPercent, finalPrice, isActive, availableQuantity, axes[{attributeId, attributeName, optionId, optionValue}]}
  listVariants(config) {
    return apiCaller.post('api/goods/variants/list', config)
  },

  // POST (201) config.data {modelId, axes:[{attributeId, optionIds[] (non-empty)}]} → GoodsVariantDTO[] of the NEW combinations only; code = model code + n, price = model price; existing combinations are skipped
  generateVariants(config) {
    return apiCaller.post('api/goods/variants/generate', config)
  },

  // POST (201) config.data {modelId, goodCode?, barcode? (≤255), price?, purchasePrice? (≥0), axes:[{attributeId, optionId}]} → GoodsVariantDTO; one option per axis
  createVariant(config) {
    return apiCaller.post('api/goods/variants/create', config)
  },
})
