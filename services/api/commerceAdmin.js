/**
 * Commerce admin: discount codes (`/api/admin/discount-codes`, module DISCOUNT) and customer wallets
 * (`/api/admin/wallets`, module WALLET), verified against BACK's DiscountCodeAdminController and WalletAdminController.
 * Payload = res.data.data. Amounts are Rial (PERCENT discount value is a percent 1..100).
 */
const BASE = 'api/admin/discount-codes'
const WALLET_BASE = 'api/admin/wallets'

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

  // GET, 0-based `page`, `size` via config.params {minBalance?} → PageResponse<{personId, fullName, phone, balance, updatedAt}>, highest balance first
  listWallets(config) {
    return apiCaller.get(WALLET_BASE, config)
  },

  // GET → {personId, balance, enabled}; a wallet with no transactions has balance 0
  getWallet(personId) {
    return apiCaller.get(`${WALLET_BASE}/person/${personId}`)
  },

  // GET, 0-based `page`, `size` via config.params → PageResponse<{id, amount (signed), balanceAfter, type ORDER_PAYMENT|ORDER_RELEASE|REFUND|ADJUSTMENT|TOP_UP, typeLabel, orderId, refundId, note, createdAt}>, newest first
  listWalletTransactionsAdmin(personId, config) {
    return apiCaller.get(`${WALLET_BASE}/person/${personId}/transactions`, config)
  },

  // POST, body in config.data {amount (non-zero Rial; + credit / − debit), note (required, ≤500)} → WalletTransactionDTO; debit above balance → 409 wallet.insufficient
  adjustWallet(personId, config) {
    return apiCaller.post(`${WALLET_BASE}/person/${personId}/adjust`, config)
  },
})
