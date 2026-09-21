/**
 * Organization & Supplier Service
 * Organization and supplier management
 */
export default (apiCaller) => ({
  // ========== ORGANIZATIONS ==========
  listOrganizations(config) {
    return apiCaller.post('api/organizations/list', config)
  },

  getOrganization(config) {
    return apiCaller.post('api/organizations/get', config)
  },

  createOrganization(config) {
    return apiCaller.post('api/organizations/create', config)
  },

  updateOrganization(config) {
    return apiCaller.post('api/organizations/update', config)
  },

  deleteOrganization(config) {
    return apiCaller.post('api/organizations/delete', config)
  },

  // ========== SUPPLIERS ==========
  listSuppliers(config) {
    return apiCaller.post('api/suppliers/list', config)
  },

  getSupplier(config) {
    return apiCaller.post('api/suppliers/get', config)
  },

  createSupplier(config) {
    return apiCaller.post('api/suppliers/create', config)
  },

  updateSupplier(config) {
    return apiCaller.post('api/suppliers/update', config)
  },

  deleteSupplier(config) {
    return apiCaller.post('api/suppliers/delete', config)
  },

  // ========== SUPPLIER RATINGS ==========
  rateSupplier(config) {
    return apiCaller.post('api/suppliers/rate', config)
  },

  getSupplierRating(config) {
    return apiCaller.post('api/suppliers/rating', config)
  },
})
