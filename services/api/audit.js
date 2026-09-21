/**
 * Audit Service
 * Audit logs and activity tracking
 */
export default (apiCaller) => ({
  // ========== AUDIT LOGS ==========
  listAuditLogs(config) {
    return apiCaller.post('api/audit/logs', config)
  },

  getAuditLog(config) {
    return apiCaller.post('api/audit/logs/get', config)
  },

  filterAuditLogs(config) {
    return apiCaller.post('api/audit/logs/filter', config)
  },

  searchAuditLogs(config) {
    return apiCaller.post('api/audit/logs/search', config)
  },

  // ========== AUDIT BY ENTITY ==========
  getEntityAuditLogs(config) {
    return apiCaller.post('api/audit/entity-logs', config)
  },

  getEntityHistory(config) {
    return apiCaller.post('api/audit/entity-history', config)
  },

  // ========== AUDIT EXPORT ==========
  exportAuditLogs(config) {
    return apiCaller.post('api/audit/export', config)
  },

  // ========== AUDIT CONFIGURATION ==========
  getAuditConfig(config) {
    return apiCaller.post('api/audit/config', config)
  },

  updateAuditConfig(config) {
    return apiCaller.post('api/audit/config/update', config)
  },

  // ========== RETENTION POLICY ==========
  getRetentionPolicy(config) {
    return apiCaller.post('api/audit/retention-policy', config)
  },

  updateRetentionPolicy(config) {
    return apiCaller.post('api/audit/retention-policy/update', config)
  },

  archiveAuditLogs(config) {
    return apiCaller.post('api/audit/archive', config)
  },
})
