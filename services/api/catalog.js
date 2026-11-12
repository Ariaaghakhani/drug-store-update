/**
 * Catalog & Category Service
 * Category and catalog management
 */
export default (apiCaller) => ({
  // ========== CATALOGS (Generic Lookup) — base path is /api/catalogs (plural) ==========
  // GET root; there is no /list
  listCatalogs(config) {
    return apiCaller.get('api/catalogs', config)
  },

  getCatalog(config) {
    return apiCaller.post('api/catalogs/get', config)
  },

  // POST root `CatalogDTO {type, code, title, description?}`; code is required, unique per type and never changes
  createCatalog(config) {
    return apiCaller.post('api/catalogs', config)
  },

  updateCatalog(config) {
    return apiCaller.post('api/catalogs/update', config)
  },

  deleteCatalog(config) {
    return apiCaller.post('api/catalogs/delete', config)
  },

  getCatalogsByType(config) {
    return apiCaller.post('api/catalogs/by-type', config)
  },

  // ========== CATEGORIES ==========
  listCategories(config) {
    return apiCaller.get('api/categories', config)
  },

  getCategory(config) {
    return apiCaller.post('api/categories/get', config)
  },

  createCategory(config) {
    return apiCaller.post('api/categories', config)
  },

  updateCategory(config) {
    return apiCaller.post('api/categories/update', config)
  },

  deleteCategory(config) {
    return apiCaller.post('api/categories/delete', config)
  },

  getCategoryChildren(config) {
    return apiCaller.post('api/categories/children', config)
  },

  // ========== CATEGORY SCOPES (Hierarchy) ==========
  listCategoryScopes(config) {
    return apiCaller.get('api/category-scopes', config)
  },

  getCategoryScope(config) {
    return apiCaller.post('api/category-scopes/get', config)
  },

  createCategoryScope(config) {
    return apiCaller.post('api/category-scopes/create', config)
  },

  // No update/delete: scopes are system values every store copies on creation and code refers to
  // by name (goods categories, Excel import, blog) — backend will not expose these (2026-10-27).
})
