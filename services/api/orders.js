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

  // GET api/orders/my (verified 2026-11-10, OrderCustomerController): the caller's own orders from the token,
  // 0-based page/size (max 100), newest first. List items carry no `items`; use getOrder for lines.
  listMyOrders(config) {
    return apiCaller.get('api/orders/my', config)
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

  getStats(config) {
    return apiCaller.get('api/orders/stats', config)
  },

  // ========== FULFILLMENT (staff-only, all return OrderDTO) ==========

  shipOrder(id, config) {
    return apiCaller.post(`api/admin/orders/${id}/ship`, config)
  },

  readyForPickup(id, config) {
    return apiCaller.post(`api/admin/orders/${id}/ready-for-pickup`, config)
  },

  deliverOrder(id) {
    return apiCaller.post(`api/admin/orders/${id}/deliver`)
  },

  deliveryFailed(id, config) {
    return apiCaller.post(`api/admin/orders/${id}/delivery-failed`, config)
  },

  returnedToStore(id) {
    return apiCaller.post(`api/admin/orders/${id}/returned`)
  },

  notCollected(id) {
    return apiCaller.post(`api/admin/orders/${id}/not-collected`)
  },

  lostOrder(id) {
    return apiCaller.post(`api/admin/orders/${id}/lost`)
  },

  damagedOrder(id) {
    return apiCaller.post(`api/admin/orders/${id}/damaged`)
  },

  updateShipping(id, config) {
    return apiCaller.put(`api/admin/orders/${id}/shipping`, config)
  },

  fulfillmentHistory(id) {
    return apiCaller.get(`api/admin/orders/${id}/fulfillment-history`)
  },

  // ========== REFUNDS (staff-only; BACK OrderRefundController, module ORDER_REFUND) ==========

  // POST, body in config.data {note≤500, refundAmount? ≥0 (empty = full paid amount, 0 = none), restock (null/true = back to stock)}; only PAID and not shipped/delivered, else 409 → OrderDTO
  cancelPaidOrder(orderId, config) {
    return apiCaller.post(`api/admin/orders/${orderId}/cancel`, config)
  },

  // GET → OrderRefundDTO[] {id, orderId, amount, reason, status PENDING|PAID, note, reference, paidAt, toWallet, createdAt, createdBy, workflow}, newest first
  listOrderRefunds(orderId) {
    return apiCaller.get(`api/admin/orders/${orderId}/refunds`)
  },

  // POST (201), body in config.data {amount ≥1 (required), reason (required, not RETURN from this form), note≤500}; total refunds ≤ paid amount, else 409
  createOrderRefund(orderId, config) {
    return apiCaller.post(`api/admin/orders/${orderId}/refunds`, config)
  },

  // POST, body in config.data {reference≤100, note≤500, toWallet}; body optional. Workflow-bindable: a pending approval answers 202 (plugin flags `pending`)
  markOrderRefundPaid(refundId, config) {
    return apiCaller.post(`api/admin/order-refunds/${refundId}/paid`, config)
  },

  // ========== CASH ON DELIVERY (staff-only) ==========

  listCodOrders(config) {
    return apiCaller.get('api/admin/cod-orders', config)
  },

  markCodPaid(id) {
    return apiCaller.post(`api/admin/cod-orders/${id}/paid`)
  },

  cancelCodOrder(id) {
    return apiCaller.post(`api/admin/cod-orders/${id}/cancel`)
  },

  // ========== SHIPMENTS (staff-only) ==========

  listShipments(config) {
    return apiCaller.get('api/admin/shipments', config)
  },

  getShipmentsSummary(config) {
    return apiCaller.get('api/admin/shipments/summary', config)
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

  // POST api/invoices/pdf {id} (verified 2026-11-10, InvoiceController): application/pdf bytes. Customers get only
  // their own invoices (default customer policy + OwnershipGuard). Blob response: the file is res.data, see
  // composables/useFileDownload.js.
  downloadInvoicePdf(id) {
    return apiCaller.post('api/invoices/pdf', { data: { id }, responseType: 'blob' })
  },

  // ========== PURCHASE ORDERS (module PURCHASE_ORDER; verified 2026-11-11 against BACK PurchaseOrderController) ==========
  // POST api/purchase-orders/list {supplierId?, status?, page (1-based), size ≤100} → PageResponse<PurchaseOrderDTO>, page 1-based.
  listPurchaseOrders(config) {
    return apiCaller.post('api/purchase-orders/list', config)
  },

  // POST api/purchase-orders/get {id} → PurchaseOrderDTO with items.
  getPurchaseOrder(config) {
    return apiCaller.post('api/purchase-orders/get', config)
  },

  // POST api/purchase-orders {supplierId, dateExpected?, note?, items:[{goodsId, quantityOrdered, unitCost}]} → 201 PurchaseOrderDTO (DRAFT).
  createPurchaseOrder(config) {
    return apiCaller.post('api/purchase-orders', config)
  },

  // PUT api/purchase-orders {id, supplierId, dateExpected?, note?, items} → PurchaseOrderDTO. DRAFT only; items are replaced.
  updatePurchaseOrder(config) {
    return apiCaller.put('api/purchase-orders', config)
  },

  // POST api/purchase-orders/submit {id}: DRAFT → ORDERED. Workflow-bindable (202 when pending).
  submitPurchaseOrder(config) {
    return apiCaller.post('api/purchase-orders/submit', config)
  },

  // POST api/purchase-orders/receive {purchaseOrderId, warehouseId, note?, lines:[{itemId, quantity, batchNumber?, manufactureDate?, expiryDate?}]}.
  receivePurchaseOrder(config) {
    return apiCaller.post('api/purchase-orders/receive', config)
  },

  // POST api/purchase-orders/close {id}: PARTIALLY_RECEIVED → CLOSED.
  closePurchaseOrder(config) {
    return apiCaller.post('api/purchase-orders/close', config)
  },

  // POST api/purchase-orders/cancel {id}: DRAFT | ORDERED → CANCELLED.
  cancelPurchaseOrder(config) {
    return apiCaller.post('api/purchase-orders/cancel', config)
  },

  // POST api/purchase-orders/delete {id}: DRAFT | CANCELLED only; 204.
  deletePurchaseOrder(config) {
    return apiCaller.post('api/purchase-orders/delete', config)
  },
})
