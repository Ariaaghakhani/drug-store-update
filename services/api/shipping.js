/**
 * Shipping methods: the public checkout list (`/api/shipping/methods`, verified against BACK's ShippingMethodController) and the admin CRUD (`/api/admin/shipping-methods`, verified against BACK's ShippingMethodAdminController).
 * Payload = res.data.data. Admin lists are unpaged and include inactive methods, sorted by sortOrder.
 * Request body is ShippingMethodRequest (every field replaces the stored value on PUT; active null = unchanged).
 */
const BASE = 'api/admin/shipping-methods'
const PUBLIC_BASE = 'api/shipping/methods'

export default (apiCaller) => ({
  // Public, no login. GET params {amount (items total, Rial), provinceId?, cityId?} → ShippingOptionDTO[] {id, title, description, type, deliveryMethod DELIVERY|PICKUP, coverage, covered, cost, freeShippingThreshold, payOnDeliveryAllowed, cashOnDeliveryAllowed, slotsEnabled, expressMinutes, deliverBy, trackingRequired, minDeliveryDays, maxDeliveryDays}; id is the shippingMethodId for checkout
  listMethods(config) {
    return apiCaller.get(PUBLIC_BASE, config)
  },

  // Public GET → PickupSlotDTO[] {start, end, label, remaining, available}; start is the pickupSlotStart for checkout. A method without slots returns []
  listSlots(id) {
    return apiCaller.get(`${PUBLIC_BASE}/${id}/slots`)
  },

  // GET → ShippingMethodDTO[]
  adminListMethods() {
    return apiCaller.get(BASE)
  },

  // GET → ShippingMethodDTO
  adminGetMethod(id) {
    return apiCaller.get(`${BASE}/${id}`)
  },

  // POST (201) body in config.data → ShippingMethodDTO
  adminCreateMethod(config) {
    return apiCaller.post(BASE, config)
  },

  // PUT full replace, body in config.data → ShippingMethodDTO
  adminUpdateMethod(id, config) {
    return apiCaller.put(`${BASE}/${id}`, config)
  },

  // DELETE → null. Past orders keep their own cost and title.
  adminDeleteMethod(id) {
    return apiCaller.delete(`${BASE}/${id}`)
  },
})
