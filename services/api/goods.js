/**
 * Goods/Products Service
 * Complete product management endpoints
 */
export default (apiCaller) => ({
  // ========== PRODUCT CRUD ==========
  createGoods(config) {
    return apiCaller.post('api/goods/create', config)
  },

  updateGoods(config) {
    return apiCaller.post('api/goods/update', config)
  },

  getGoods(config) {
    return apiCaller.post('api/goods/get', config)
  },

  deleteGoods(config) {
    return apiCaller.post('api/goods/delete', config)
  },

  // ========== LISTING & FILTERING ==========
  listGoods(config) {
    return apiCaller.post('api/goods/list', config)
  },

  filterGoods(config) {
    return apiCaller.post('api/goods/filter', config)
  },

  // ========== BULK OPERATIONS ==========
  importGoods(config) {
    return apiCaller.post('api/goods/import', config)
  },

  // ========== TAGS ==========
  getTags(config) {
    return apiCaller.get('api/tags', config)
  },

  getTagById(config) {
    return apiCaller.post('api/tags/get-by-id', config)
  },

  createTag(config) {
    return apiCaller.post('api/tags', config)
  },

  updateTag(config) {
    return apiCaller.post('api/tags/update', config)
  },

  deleteTag(config) {
    return apiCaller.post('api/tags/delete', config)
  },

  // ========== PRODUCT BATCHES ==========
  getProductBatches(config) {
    return apiCaller.get('api/product-batches', config)
  },

  getProductBatch(config) {
    return apiCaller.post('api/product-batches/get', config)
  },

  getProductBatchesByGoods(config) {
    return apiCaller.post('api/product-batches/by-goods', config)
  },

  getProductBatchesBySupplier(config) {
    return apiCaller.post('api/product-batches/by-supplier', config)
  },

  createProductBatch(config) {
    return apiCaller.post('api/product-batches', config)
  },

  updateProductBatch(config) {
    return apiCaller.put('api/product-batches', config)
  },

  deleteProductBatch(config) {
    return apiCaller.post('api/product-batches/delete', config)
  },
})
