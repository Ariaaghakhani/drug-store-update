/**
 * Payments Service
 * Checkout, order payment and payment-request endpoints
 */
export default (apiCaller) => ({
  // ========== CHECKOUT ==========
  checkout(config) {
    return apiCaller.post('api/checkout', config)
  },

  quote(config) {
    return apiCaller.post('api/checkout/quote', config)
  },

  // ========== PAYMENT ==========
  payOrder(orderId, gateway) {
    return apiCaller.post(`api/payment/order/${orderId}`, {
      params: { gateway },
    })
  },

  requestPayment(config) {
    return apiCaller.post('api/payment/request', config)
  },
})
