/**
 * Shipping methods admin: verified against BACK's ShippingMethodAdminController (`/api/admin/shipping-methods`).
 * Unpaged. Payload = res.data.data. The list includes inactive methods, sorted by sortOrder.
 * Request body is ShippingMethodRequest (every field replaces the stored value on PUT; active null = unchanged).
 */
const BASE = 'api/admin/shipping-methods'

export default (apiCaller) => ({
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
