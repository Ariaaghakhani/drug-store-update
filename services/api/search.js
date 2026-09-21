/**
 * Search Service
 * Global search and Elasticsearch-powered search
 */
export default (apiCaller) => ({
  // ========== GLOBAL SEARCH ==========
  globalSearch(config) {
    return apiCaller.post('api/search', config)
  },

  // ========== GOODS SEARCH (Elasticsearch) ==========
  searchGoods(config) {
    return apiCaller.post('api/goods-search', config)
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
