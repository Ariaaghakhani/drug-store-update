/**
 * Payments Service
 * Payment processing and verification
 */
export default (apiCaller) => ({
  // ========== CHECKOUT ==========
  initiateCheckout(config) {
    return apiCaller.post('api/checkout/init', config)
  },

  // ========== PAYMENT VERIFICATION ==========
  verifyPayment(config) {
    return apiCaller.post('api/payments/verify', config)
  },

  getPaymentStatus(config) {
    return apiCaller.post('api/payments/status', config)
  },

  // ========== PAYMENT HISTORY ==========
  listPayments(config) {
    return apiCaller.post('api/payments/list', config)
  },

  getPayment(config) {
    return apiCaller.post('api/payments/get', config)
  },

  // ========== MOCK BANK (Testing) ==========
  mockBankCallback(config) {
    return apiCaller.post('api/mock-bank/callback', config)
  },

  initiateMockPayment(config) {
    return apiCaller.post('api/mock-bank/initiate', config)
  },
})
