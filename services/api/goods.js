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
    return apiCaller.post('api/tags/list', config)
  },

  createTag(config) {
    return apiCaller.post('api/tags/create', config)
  },

  updateTag(config) {
    return apiCaller.post('api/tags/update', config)
  },

  deleteTag(config) {
    return apiCaller.post('api/tags/delete', config)
  },

  // ========== PRODUCT BATCHES ==========
  getProductBatches(config) {
    return apiCaller.post('api/product-batches/list', config)
  },

  createProductBatch(config) {
    return apiCaller.post('api/product-batches/create', config)
  },

  updateProductBatch(config) {
    return apiCaller.post('api/product-batches/update', config)
  },

  deleteProductBatch(config) {
    return apiCaller.post('api/product-batches/delete', config)
  },
})
