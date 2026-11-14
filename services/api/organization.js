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

  // ========== SUPPLIERS (verified 2026-11-11 against BACK SupplierController) ==========
  // GET api/suppliers → SupplierDTO[] (unpaged).
  listSuppliers(config) {
    return apiCaller.get('api/suppliers', config)
  },

  // POST api/suppliers/get-by-id {id} → SupplierDTO.
  getSupplier(config) {
    return apiCaller.post('api/suppliers/get-by-id', config)
  },

  // POST api/suppliers {name (required), contactName?, phone?, email?, …} → 201 SupplierDTO.
  createSupplier(config) {
    return apiCaller.post('api/suppliers', config)
  },

  // POST api/suppliers/update {id, supplierDTO: {…}} (nested, not flat) → SupplierDTO.
  updateSupplier(config) {
    return apiCaller.post('api/suppliers/update', config)
  },

  // POST api/suppliers/delete {id}; 204.
  deleteSupplier(config) {
    return apiCaller.post('api/suppliers/delete', config)
  },
})
