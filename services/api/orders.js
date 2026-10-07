export default (apiCaller) => ({
  listOrders(config) {
    return apiCaller.post('api/orders/list', config)
  },

  getOrder(config) {
    return apiCaller.post('api/orders/get', config)
  },

  createOrder(config) {
    return apiCaller.post('api/orders/create', config)
  },

  deleteOrder(config) {
    return apiCaller.post('api/orders/delete', config)
  },

  byPerson(config) {
    return apiCaller.post('api/orders/by-person', config)
  },

  byUser(config) {
    return apiCaller.post('api/orders/by-user', config)
  },

  byStatus(config) {
    return apiCaller.post('api/orders/by-status', config)
  },

  byDate(config) {
    return apiCaller.post('api/orders/by-date', config)
  },

  searchOrders(config) {
    return apiCaller.post('api/search/orders', config)
  },

  searchOrdersByStatus(status, config) {
    return apiCaller.post(`api/search/orders/status/${status}`, config)
  },

  listOrderItems(config) {
    return apiCaller.post('api/order-items/list', config)
  },

  getOrderItem(config) {
    return apiCaller.post('api/order-items/get', config)
  },

  createOrderItem(config) {
    return apiCaller.post('api/order-items/create', config)
  },

  deleteOrderItem(config) {
    return apiCaller.post('api/order-items/delete', config)
  },

  listInvoices(config) {
    return apiCaller.post('api/invoices/list', config)
  },

  getInvoice(config) {
    return apiCaller.post('api/invoices/get', config)
  },

  createInvoice(config) {
    return apiCaller.post('api/invoices/create', config)
  },

  byOrder(config) {
    return apiCaller.post('api/invoices/by-order', config)
  },

  deleteInvoice(config) {
    return apiCaller.post('api/invoices/delete', config)
  },

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
