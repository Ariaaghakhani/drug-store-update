/**
 * Dynamic Columns Service
 * Flexible schema and custom fields
 */
export default (apiCaller) => ({
  // ========== DYNAMIC COLUMNS ==========
  listDynamicColumns(config) {
    return apiCaller.post('api/dynamic-columns/list', config)
  },

  getDynamicColumn(config) {
    return apiCaller.post('api/dynamic-columns/get', config)
  },

  createDynamicColumn(config) {
    return apiCaller.post('api/dynamic-columns/create', config)
  },

  updateDynamicColumn(config) {
    return apiCaller.post('api/dynamic-columns/update', config)
  },

  deleteDynamicColumn(config) {
    return apiCaller.post('api/dynamic-columns/delete', config)
  },

  // ========== REORDER COLUMNS ==========
  reorderColumns(config) {
    return apiCaller.post('api/dynamic-columns/reorder', config)
  },

  // ========== COLUMN TEMPLATES ==========
  listColumnTemplates(config) {
    return apiCaller.post('api/dynamic-columns/templates/list', config)
  },

  applyColumnTemplate(config) {
    return apiCaller.post('api/dynamic-columns/templates/apply', config)
  },

  saveAsTemplate(config) {
    return apiCaller.post('api/dynamic-columns/templates/save', config)
  },

  deleteTemplate(config) {
    return apiCaller.post('api/dynamic-columns/templates/delete', config)
  },

  // ========== COLUMN VALIDATION ==========
  validateColumnConfig(config) {
    return apiCaller.post('api/dynamic-columns/validate', config)
  },

  // ========== COLUMN MIGRATION ==========
  migrateColumnData(config) {
    return apiCaller.post('api/dynamic-columns/migrate', config)
  },
})
