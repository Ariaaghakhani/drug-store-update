/**
 * Inventory & Warehouse Service
 * Stock management and warehouse operations
 * Verified against BACK's InventoryController (/api/inventories) and WarehouseController (/api/warehouses)
 */
export default (apiCaller) => ({
  // ========== INVENTORY ==========
  listInventory(config) {
    return apiCaller.get('api/inventories/all', config)
  },

  getInventory(config) {
    return apiCaller.post('api/inventories/get', config)
  },

  listInventoryByWarehouse(config) {
    return apiCaller.post('api/inventories/by-warehouse', config)
  },

  listInventoryByGoods(config) {
    return apiCaller.post('api/inventories/by-goods', config)
  },

  listInventoryByBatch(config) {
    return apiCaller.post('api/inventories/by-batch', config)
  },

  createInventory(config) {
    return apiCaller.post('api/inventories/create', config)
  },

  updateInventory(config) {
    return apiCaller.post('api/inventories/update', config)
  },

  deleteInventory(config) {
    return apiCaller.post('api/inventories/delete', config)
  },

  // ========== WAREHOUSES ==========
  listWarehouses(config) {
    return apiCaller.get('api/warehouses/all', config)
  },

  getWarehouse(config) {
    return apiCaller.post('api/warehouses/get-by-id', config)
  },

  listWarehousesByType(config) {
    return apiCaller.post('api/warehouses/by-type', config)
  },

  createWarehouse(config) {
    return apiCaller.post('api/warehouses', config)
  },

  updateWarehouse(config) {
    return apiCaller.put('api/warehouses', config)
  },

  deleteWarehouse(config) {
    return apiCaller.post('api/warehouses/delete', config)
  },

  // ========== INVENTORY ADJUSTMENTS ==========
  adjustInventory(config) {
    return apiCaller.post('api/inventories/adjust', config)
  },

  // ========== STOCK TRANSFERS ==========
  transferStock(config) {
    return apiCaller.post('api/inventories/transfer', config)
  },
})
