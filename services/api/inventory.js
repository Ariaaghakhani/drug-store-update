/**
 * Inventory & Warehouse Service
 * Stock management and warehouse operations
 */
export default (apiCaller) => ({
  // ========== INVENTORY ==========
  listInventory(config) {
    return apiCaller.post('api/inventory/list', config)
  },

  getInventory(config) {
    return apiCaller.post('api/inventory/get', config)
  },

  createInventory(config) {
    return apiCaller.post('api/inventory/create', config)
  },

  updateInventory(config) {
    return apiCaller.post('api/inventory/update', config)
  },

  deleteInventory(config) {
    return apiCaller.post('api/inventory/delete', config)
  },

  // ========== WAREHOUSES ==========
  listWarehouses(config) {
    return apiCaller.post('api/warehouses/list', config)
  },

  getWarehouse(config) {
    return apiCaller.post('api/warehouses/get', config)
  },

  createWarehouse(config) {
    return apiCaller.post('api/warehouses/create', config)
  },

  updateWarehouse(config) {
    return apiCaller.post('api/warehouses/update', config)
  },

  deleteWarehouse(config) {
    return apiCaller.post('api/warehouses/delete', config)
  },

  // ========== INVENTORY ADJUSTMENTS ==========
  adjustInventory(config) {
    return apiCaller.post('api/inventory/adjust', config)
  },

  // ========== STOCK TRANSFERS ==========
  transferStock(config) {
    return apiCaller.post('api/inventory/transfer', config)
  },
})
