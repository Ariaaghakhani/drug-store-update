/**
 * Commerce admin: discount codes, verified against BACK's DiscountCodeAdminController (`/api/admin/discount-codes`, module DISCOUNT).
 * Payload = res.data.data. Amounts are Rial (PERCENT value is a percent 1..100).
 */
const BASE = 'api/admin/discount-codes'

export default (apiCaller) => ({
  // GET, 0-based `page`, `size` 1..100 via config.params → PageResponse<DiscountCodeDTO>, newest first, inactive included
  listDiscountCodes(config) {
    return apiCaller.get(BASE, config)
  },

  // GET → DiscountCodeDTO {id, code, description, type PERCENT|FIXED, value, maxDiscountAmount, minPurchaseAmount, startsAt, endsAt, usageLimit, usageLimitPerCustomer, usedCount, active, createdAt}
  getDiscountCode(id) {
    return apiCaller.get(`${BASE}/${id}`)
  },

  // POST (201), body in config.data → DiscountCodeDTO; duplicate code → 409
  createDiscountCode(config) {
    return apiCaller.post(BASE, config)
  },

  // PUT full replace, body in config.data (empty optional = no limit); active null = unchanged → DiscountCodeDTO
  updateDiscountCode(id, config) {
    return apiCaller.put(`${BASE}/${id}`, config)
  },

  // DELETE → null. Past orders keep their discount amount.
  deleteDiscountCode(id) {
    return apiCaller.delete(`${BASE}/${id}`)
  },
})
