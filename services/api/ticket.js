/**
 * Ticket Service — support tickets, verified against BACK's TicketCustomerController / TicketAdminController.
 * Customers use /api/tickets/my/**, staff use /api/admin/tickets/**; the `staff` flag picks the base path.
 */
const base = (staff) => (staff ? 'api/admin/tickets' : 'api/tickets/my')

export default (apiCaller) => ({
  // GET, 0-based `page`, `size` 1..100, optional `status` (staff also: priority/category/q/unassigned/...) via config.params
  listTickets(staff, config) {
    return apiCaller.get(base(staff), config)
  },

  // TicketDetailDTO incl. messages[] (customers never receive internal notes)
  getTicket(staff, id) {
    return apiCaller.get(`${base(staff)}/${id}`)
  },

  // customer only. body {subject(<=150), description, category, priority}
  createTicket(config) {
    return apiCaller.post('api/tickets/my', config)
  },

  // body {message, internal?} (`internal` is ignored for customers); closed ticket → 409
  replyTicket(staff, id, config) {
    return apiCaller.post(`${base(staff)}/${id}/messages`, config)
  },

  // multipart `files` (one or more, all-or-nothing) onto a message the caller sent; caller builds the FormData
  attachToMessage(staff, id, messageId, config) {
    return apiCaller.post(`${base(staff)}/${id}/messages/${messageId}/attachments`, config)
  },

  // customer only
  closeTicket(id) {
    return apiCaller.post(`api/tickets/my/${id}/close`)
  },

  // customer only, once, RESOLVED/CLOSED only. body {score 1..5, comment?<=500}
  rateTicket(id, config) {
    return apiCaller.post(`api/tickets/my/${id}/rating`, config)
  },

  // staff only. body {status}
  setTicketStatus(id, config) {
    return apiCaller.post(`api/admin/tickets/${id}/status`, config)
  },

  attachmentPath(staff, attachmentId) {
    return `${base(staff)}/attachments/${attachmentId}`
  },
})
