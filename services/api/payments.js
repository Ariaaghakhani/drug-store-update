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

  // Public, no login. GET params {amount (Rial, the quote total)} → AvailablePaymentGatewayDTO[] {gateway, eligible (null = no check; false = hide), title, description}
  listGateways(config) {
    return apiCaller.get('api/payment/gateways', config)
  },

  // ========== PAYMENT ==========
  // returnOrigin = this site's origin; BACK redirects the browser to {returnOrigin}/checkout/result?status&orderId|walletTopUp&paymentToken after the bank (/checkout/redirect is only the pre-gateway interstitial)
  payOrder(orderId, gateway, returnOrigin) {
    return apiCaller.post(`api/payment/order/${orderId}`, {
      params: { gateway, returnOrigin },
    })
  },

  requestPayment(config) {
    return apiCaller.post('api/payment/request', config)
  },

  // Full PaymentResultDTO for the /checkout/result landing page, keyed by the `paymentToken` query param
  getPaymentResult(paymentToken) {
    return apiCaller.get(`api/payment/result/${encodeURIComponent(paymentToken)}`)
  },

  // ========== STORE PAYMENT GATEWAYS (admin) ==========
  // Verified against BACK's StorePaymentGatewayController (module PAYMENT_GATEWAY). Payload = res.data.data.
  // Passwords and secrets never come back; only passwordSet / clientSecretSet.

  // GET → TenantPaymentGatewayDTO[] {gateway, merchantId, terminalId, username, clientId, passwordSet, clientSecretSet, configured, active, requiredFields[]}; unconfigured gateways included
  adminListGateways() {
    return apiCaller.get('api/admin/payment-gateways')
  },

  // PUT full replace, body in config.data {gateway (req), merchantId<=100, terminalId<=100, username<=100, password<=200 (empty = keep), clientId<=100, clientSecret<=200 (empty = keep), active (null = on)} → TenantPaymentGatewayDTO
  adminSaveGateway(config) {
    return apiCaller.put('api/admin/payment-gateways', config)
  },

  // POST → TenantPaymentGatewayDTO (409/400 when the account is not complete)
  adminEnableGateway(gateway) {
    return apiCaller.post(`api/admin/payment-gateways/${gateway}/enable`)
  },

  // POST → TenantPaymentGatewayDTO; new payments stop, pending ones still confirm
  adminDisableGateway(gateway) {
    return apiCaller.post(`api/admin/payment-gateways/${gateway}/disable`)
  },
})
