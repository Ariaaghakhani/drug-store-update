/**
 * Orders Service
 * Complete order management endpoints
 */
export default (apiCaller) => ({
  // ========== ORDERS ==========
  listOrders(config) {
    return apiCaller.post('api/orders/list', config)
  },

  getOrder(config) {
    return apiCaller.post('api/orders/get', config)
  },

  createOrder(config) {
    return apiCaller.post('api/orders/create', config)
  },

  updateOrder(config) {
    return apiCaller.post('api/orders/update', config)
  },

  deleteOrder(config) {
    return apiCaller.post('api/orders/delete', config)
  },

  // ========== ORDER ITEMS ==========
  listOrderItems(config) {
    return apiCaller.post('api/order-items/list', config)
  },

  getOrderItem(config) {
    return apiCaller.post('api/order-items/get', config)
  },

  createOrderItem(config) {
    return apiCaller.post('api/order-items/create', config)
  },

  updateOrderItem(config) {
    return apiCaller.post('api/order-items/update', config)
  },

  deleteOrderItem(config) {
    return apiCaller.post('api/order-items/delete', config)
  },

  // ========== INVOICES ==========
  listInvoices(config) {
    return apiCaller.post('api/invoices/list', config)
  },

  getInvoice(config) {
    return apiCaller.post('api/invoices/get', config)
  },

  createInvoice(config) {
    return apiCaller.post('api/invoices/create', config)
  },

  updateInvoice(config) {
    return apiCaller.post('api/invoices/update', config)
  },

  deleteInvoice(config) {
    return apiCaller.post('api/invoices/delete', config)
  },

  // ========== PURCHASE ORDERS (Supplier) ==========
  listPurchaseOrders(config) {
    return apiCaller.post('api/purchase-orders/list', config)
  },

  getPurchaseOrder(config) {
    return apiCaller.post('api/purchase-orders/get', config)
  },

  createPurchaseOrder(config) {
    return apiCaller.post('api/purchase-orders/create', config)
  },

  updatePurchaseOrder(config) {
    return apiCaller.post('api/purchase-orders/update', config)
  },

  deletePurchaseOrder(config) {
    return apiCaller.post('api/purchase-orders/delete', config)
  },

  // ========== PURCHASE ORDER ITEMS ==========
  listPurchaseOrderItems(config) {
    return apiCaller.post('api/purchase-order-items/list', config)
  },

  getPurchaseOrderItem(config) {
    return apiCaller.post('api/purchase-order-items/get', config)
  },

  createPurchaseOrderItem(config) {
    return apiCaller.post('api/purchase-order-items/create', config)
  },

  updatePurchaseOrderItem(config) {
    return apiCaller.post('api/purchase-order-items/update', config)
  },

  deletePurchaseOrderItem(config) {
    return apiCaller.post('api/purchase-order-items/delete', config)
  },
})
