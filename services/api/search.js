/**
 * Search Service
 * Global search and Elasticsearch-powered search
 */
export default (apiCaller) => ({
  // ========== GLOBAL SEARCH ==========
  globalSearch(config) {
    return apiCaller.post('api/search', config)
  },

  // ========== GOODS SEARCH (Elasticsearch, public) ==========
  // Verified against BACK's GoodsSearchController. config.data is GoodsSearchRequestDTO {keyword, categoryId, brand,
  // brandIds, tagName, inStock, onSale, timedOffer, attributes: [{attributeId, optionIds|min|max|booleanValue|text}],
  // sort, page (0-based), size}; → PageResponse<GoodsDocument>. One result per model unless expandVariants is true.
  searchGoods(config) {
    return apiCaller.post('api/elastic/search', config)
  },

  // Same body → AttributeFacetDTO[] {attributeId, name, type, unit, options: [{optionId, value, count}], trueCount, falseCount, min, max}
  searchGoodsFacets(config) {
    return apiCaller.post('api/elastic/search/facets', config)
  },

  // ========== ORDER SEARCH (Elasticsearch) ==========
  searchOrders(config) {
    return apiCaller.post('api/order-search', config)
  },

  // ========== REINDEXING ==========
  reindexGoods(config) {
    return apiCaller.post('api/goods-reindex', config)
  },

  reindexOrders(config) {
    return apiCaller.post('api/orders-reindex', config)
  },

  // ========== ELASTICSEARCH BACKUP ==========
  backupElasticsearch(config) {
    return apiCaller.post('api/elasticsearch-backup', config)
  },

  restoreElasticsearch(config) {
    return apiCaller.post('api/elasticsearch-restore', config)
  },

  getBackupStatus(config) {
    return apiCaller.post('api/elasticsearch-backup-status', config)
  },
})
