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

  // GET api/elastic/suggest?q= (public, light) → GoodsSuggestDTO[] {id, groupId, nameFa, modelName, brand, imageUrl}, one per
  // product; empty under 2 chars. Rate-limited per IP/user: 429 error.rate.limit.exceeded + Retry-After.
  suggestGoods(config) {
    return apiCaller.get('api/elastic/suggest', config)
  },

  // Same body as searchGoods → {totalCount, inStockCount, minFinalPrice, maxFinalPrice, brands: [{id,name,count}], categories: [{id,name,count}]}
  searchGoodsSummary(config) {
    return apiCaller.post('api/elastic/search/summary', config)
  },

  // GET api/elastic/search/correction?keyword= → {keyword, suggestion}; empty suggestion = nothing to offer
  getSearchCorrection(config) {
    return apiCaller.get('api/elastic/search/correction', config)
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
