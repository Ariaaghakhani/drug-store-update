/**
 * Catalog & Category Service
 * Category and catalog management
 */
export default (apiCaller) => ({
  // ========== CATALOGS (Generic Lookup) ==========
  listCatalogs(config) {
    return apiCaller.post('api/catalog/list', config)
  },

  getCatalog(config) {
    return apiCaller.post('api/catalog/get', config)
  },

  createCatalog(config) {
    return apiCaller.post('api/catalog/create', config)
  },

  updateCatalog(config) {
    return apiCaller.post('api/catalog/update', config)
  },

  deleteCatalog(config) {
    return apiCaller.post('api/catalog/delete', config)
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

  updateCategoryScope(config) {
    return apiCaller.post('api/category-scopes/update', config)
  },

  deleteCategoryScope(config) {
    return apiCaller.post('api/category-scopes/delete', config)
  },
})
