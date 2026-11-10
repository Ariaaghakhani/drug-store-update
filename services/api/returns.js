/**
 * Returns Service — order returns, verified against BACK's OrderReturnCustomerController / OrderReturnAdminController.
 * Customers use /api/returns/my/**, staff use /api/admin/returns/**; the `staff` flag picks the base path.
 * Staff-only write calls (create for a customer, approve, reject, receive, refund) always hit /api/admin/returns/**
 * (BACK OrderReturnAdminController, module ORDER_RETURN). Every write answers OrderReturnDTO; a wrong status is 409.
 */
const base = (staff) => (staff ? 'api/admin/returns' : 'api/returns/my')

export default (apiCaller) => ({
  // GET, 0-based `page`, `size` 1..100, optional `status`, `open` (boolean), `orderId` via config.params; newest first
  listReturns(staff, config) {
    return apiCaller.get(base(staff), config)
  },

  // OrderReturnDTO incl. items[] and photos[] (AttachmentDTO: id, fileName, fileType)
  getReturn(staff, id) {
    return apiCaller.get(`${base(staff)}/${id}`)
  },

  // ReturnableOrderDTO {orderId, deliveredAt, deadline, open, changeOfMindAllowed, items[{orderItemId, remaining, returnable, ...}]}
  getReturnable(staff, orderId) {
    return apiCaller.get(`${base(staff)}/orders/${orderId}`)
  },

  // 409 unless REQUESTED or APPROVED. Customers send no body; staff body optional {note<=500}
  cancelReturn(staff, id, config) {
    return apiCaller.post(`${base(staff)}/${id}/cancel`, config)
  },

  // Path of one photo file (binary, not JSON): fetch with { responseType: 'blob' }, photoId from DTO.photos[].id
  photoPath(staff, id, photoId) {
    return `${base(staff)}/${id}/photos/${photoId}`
  },

  // customer only. body {orderId, reason, details?<=1000, items:[{orderItemId, quantity 1..100000}]}; 201 OrderReturnDTO
  submitReturn(config) {
    return apiCaller.post('api/returns/my', config)
  },

  // customer only. multipart `file` (image), max 5 per return, REQUESTED/APPROVED only; caller builds the FormData
  uploadReturnPhoto(id, config) {
    return apiCaller.post(`api/returns/my/${id}/photos`, config)
  },

  // customer only. body {trackingCode (required, <=100)}; APPROVED with returnMethod CUSTOMER_SENDS only, else 409
  setReturnTracking(id, config) {
    return apiCaller.put(`api/returns/my/${id}/tracking`, config)
  },

  // staff. body {orderId, reason, details<=1000, items:[{orderItemId, quantity 1..100000}]}; 201 OrderReturnDTO. Any paid order;
  // exempt from the window, delivery and change-of-mind rules
  createReturnForCustomer(config) {
    return apiCaller.post('api/admin/returns', config)
  },

  // staff. REQUESTED only. body {returnMethod CUSTOMER_SENDS|STORE_PICKUP|CUSTOMER_BRINGS (required), note<=500 (shown to customer)}
  approveReturn(id, config) {
    return apiCaller.post(`api/admin/returns/${id}/approve`, config)
  },

  // staff. REQUESTED only. body {note (required, <=500, shown to customer)}
  rejectReturn(id, config) {
    return apiCaller.post(`api/admin/returns/${id}/reject`, config)
  },

  // staff. APPROVED only. body {items?:[{returnItemId, restockedQuantity>=0, damagedQuantity>=0}], note<=500}; body optional
  receiveReturn(id, config) {
    return apiCaller.post(`api/admin/returns/${id}/receive`, config)
  },

  // staff. RECEIVED only. body {amount? >=0 (empty = suggestedRefund, 0 = none), note<=500}; body optional
  refundReturn(id, config) {
    return apiCaller.post(`api/admin/returns/${id}/refund`, config)
  },
})
