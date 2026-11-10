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

  // Blob GET (GoodsImportController, module GOODS): the goods import template. Consume with useFileDownload().download(..., 'goods-template.xlsx')
  downloadGoodsTemplate() {
    return apiCaller.get('api/import/downloadTemplate', { responseType: 'blob' })
  },

  // RAW POST multipart `file` (.xlsx, caller builds the FormData, `{ data: fd }`). No ApiResponse wrapper: payload = res.data
  // = {totalRows, successCount, errors:[{rowNumber, message, goodCode, nameFa}]}. A 400 (no file) has the same shape; 413 = too large
  importGoodsExcel(config) {
    return apiCaller.post('api/import/goodsImport', config)
  },

  // POST multipart: repeated `files` + `replaceExisting` ('true'|'false'). The file name is the goods code (12345.jpg = primary,
  // 12345-2.jpg … = others). ApiResponse payload = res.data.data = {totalFiles, attachedCount, failedCount, files:[{fileName, goodCode, goodsId, attachmentId, url, primary, error}]}
  importGoodsImages(config) {
    return apiCaller.post('api/import/goods-images', config)
  },

  // GET config.params {size 1..100, default 20} (module WISHLIST) → [{goodsId, goodsName, wishCount}], ApiResponse payload = res.data.data
  topWishlist(config) {
    return apiCaller.get('api/admin/wishlist/top', config)
  },

  // GET config.params {size 1..100, default 20} (module STOCK_ALERT) → [{goodsId, goodsName, waitingCount, sellableQuantity}]
  topStockAlerts(config) {
    return apiCaller.get('api/admin/stock-alerts/top', config)
  },

  // GET config.params {days 1..365 (default 7), limit 1..100 (default 20)} (module GLOBAL_SEARCH, this store's queries only) → [{queryText, count}]
  popularSearches(config) {
    return apiCaller.get('api/admin/search/queries/popular', config)
  },

  // GET config.params {days, limit} as popularSearches: searches with no product found → [{queryText, count}]
  zeroResultSearches(config) {
    return apiCaller.get('api/admin/search/queries/zero-results', config)
  },

  // POST config.data {goodsId?, warehouseId?, batchId?, inventoryId?, type?, fromDate?, toDate? (yyyy-MM-dd, both inclusive), page (1-BASED), size ≤100} (module INVENTORY) → PageResponse<StockMovementDTO>
  // {id, inventoryId, goodsId, goodsCode, goodsName, warehouseId, warehouseName, batchId, batchNumber, type, quantity (signed), balanceAfter, reason, note, referenceType ORDER|TRANSFER|PURCHASE_ORDER, referenceId, unitCost, createdAt, createdBy}
  listStockMovements(config) {
    return apiCaller.post('api/stock-movements/list', config)
  },

  // RAW POST multipart `file` (.xlsx: good_code, batch_number, expiry_date yyyy-MM-dd, quantity; default warehouse).
  // Payload = res.data = {totalRows, successCount, errors:[{rowNumber, message, goodCode, nameFa}]}; a 400 has the same shape
  importOpeningStock(config) {
    return apiCaller.post('api/import/opening-stock', config)
  },
})
