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
  // returnOrigin = this site's origin; BACK redirects the browser to {returnOrigin}/checkout/redirect after the bank
  payOrder(orderId, gateway, returnOrigin) {
    return apiCaller.post(`api/payment/order/${orderId}`, {
      params: { gateway, returnOrigin },
    })
  },

  requestPayment(config) {
    return apiCaller.post('api/payment/request', config)
  },

  // Full PaymentResultDTO for the /checkout/redirect landing page, keyed by the `paymentToken` query param
  getPaymentResult(paymentToken) {
    return apiCaller.get(`api/payment/result/${encodeURIComponent(paymentToken)}`)
  },
})
