/**
 * Communication Service
 * Support tickets, reviews, blog, and messages
 */
export default (apiCaller) => ({
  // ========== SUPPORT TICKETS ==========
  listTickets(config) {
    return apiCaller.post('api/tickets/list', config)
  },

  getTicket(config) {
    return apiCaller.post('api/tickets/get', config)
  },

  createTicket(config) {
    return apiCaller.post('api/tickets/create', config)
  },

  updateTicket(config) {
    return apiCaller.post('api/tickets/update', config)
  },

  deleteTicket(config) {
    return apiCaller.post('api/tickets/delete', config)
  },

  // ========== TICKET MESSAGES ==========
  listTicketMessages(config) {
    return apiCaller.post('api/ticket-messages/list', config)
  },

  getTicketMessage(config) {
    return apiCaller.post('api/ticket-messages/get', config)
  },

  createTicketMessage(config) {
    return apiCaller.post('api/ticket-messages/create', config)
  },

  updateTicketMessage(config) {
    return apiCaller.post('api/ticket-messages/update', config)
  },

  deleteTicketMessage(config) {
    return apiCaller.post('api/ticket-messages/delete', config)
  },

  // ========== REVIEWS ==========
  listReviews(config) {
    return apiCaller.post('api/reviews/list', config)
  },

  getReview(config) {
    return apiCaller.post('api/reviews/get', config)
  },

  createReview(config) {
    return apiCaller.post('api/reviews/create', config)
  },

  updateReview(config) {
    return apiCaller.post('api/reviews/update', config)
  },

  deleteReview(config) {
    return apiCaller.post('api/reviews/delete', config)
  },

  // ========== REVIEW REPLIES ==========
  listReplies(config) {
    return apiCaller.post('api/replies/list', config)
  },

  createReply(config) {
    return apiCaller.post('api/replies/create', config)
  },

  updateReply(config) {
    return apiCaller.post('api/replies/update', config)
  },

  deleteReply(config) {
    return apiCaller.post('api/replies/delete', config)
  },

  // ========== BLOG POSTS ==========
  listBlogPosts(config) {
    return apiCaller.post('api/blog/list', config)
  },

  getBlogPost(config) {
    return apiCaller.post('api/blog/get', config)
  },

  createBlogPost(config) {
    return apiCaller.post('api/blog/create', config)
  },

  updateBlogPost(config) {
    return apiCaller.post('api/blog/update', config)
  },

  deleteBlogPost(config) {
    return apiCaller.post('api/blog/delete', config)
  },

  // ========== CONTACT MESSAGES ==========
  listContactMessages(config) {
    return apiCaller.post('api/contact-messages/list', config)
  },

  getContactMessage(config) {
    return apiCaller.post('api/contact-messages/get', config)
  },

  createContactMessage(config) {
    return apiCaller.post('api/contact-messages/create', config)
  },

  updateContactMessage(config) {
    return apiCaller.post('api/contact-messages/update', config)
  },

  deleteContactMessage(config) {
    return apiCaller.post('api/contact-messages/delete', config)
  },

  // ========== ABOUT US ==========
  getAboutUs(config) {
    return apiCaller.post('api/about-us/get', config)
  },

  updateAboutUs(config) {
    return apiCaller.post('api/about-us/update', config)
  },

  // ========== TERMS & CONDITIONS ==========
  getTermsAndConditions(config) {
    return apiCaller.post('api/terms/get', config)
  },

  updateTermsAndConditions(config) {
    return apiCaller.post('api/terms/update', config)
  },
})
