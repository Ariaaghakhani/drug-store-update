/**
 * Storefront Service — public store info + the logged-in customer's wallet/wishlist/stock-alerts.
 * Verified against BACK's StoreProfileController, Wallet/Wishlist controllers/StockAlertController, About/Terms/ReturnPolicy
 * public controllers and ContactController. Paginated reads are 0-based `page` + `size`.
 */
export default (apiCaller) => ({
  // ========== STORE PROFILE (public) ==========
  // StoreProfileDTO: feature flags (orderingEnabled, wishlistEnabled, walletEnabled, stockAlertsEnabled, ...)
  getStoreProfile() {
    return apiCaller.get('api/store-profile')
  },

  // ========== INFO PAGES (public) ==========
  getAboutUs() {
    return apiCaller.get('api/about-us')
  },

  // List of TermsAndConditionsDTO (one per type); getTermsByType(type) for a single one
  listTerms() {
    return apiCaller.get('api/terms')
  },

  getTermsByType(type) {
    return apiCaller.get(`api/terms/${encodeURIComponent(type)}`)
  },

  getReturnPolicy() {
    return apiCaller.get('api/return-policy')
  },

  // body {fullName, subject, message, email?, phone?, captchaId?, captchaAnswer?}; rate-limited
  sendContactMessage(config) {
    return apiCaller.post('api/contact', config)
  },

  // ========== WALLET (customer) ==========
  // WalletDTO {personId, balance, enabled}
  getMyWallet() {
    return apiCaller.get('api/wallet/my')
  },

  // PageResponse<WalletTransactionDTO {id, amount, balanceAfter, type, typeLabel, orderId, refundId, note, createdAt}>
  listWalletTransactions(config) {
    return apiCaller.get('api/wallet/my/transactions', config)
  },

  // body {amount, gateway, returnOrigin?} → {amount, paymentUrl, paymentToken}
  topUpWallet(config) {
    return apiCaller.post('api/wallet/my/top-up', config)
  },

  // ========== WISHLIST (customer) ==========
  // PageResponse<WishlistItemDTO {goodsId, goodsName, addedAt, available, card: StorefrontGoodsDTO}>
  listWishlist(config) {
    return apiCaller.get('api/wishlist/my', config)
  },

  // goods ids in the wishlist, to fill hearts on list pages with one call
  listWishlistIds() {
    return apiCaller.get('api/wishlist/my/ids')
  },

  addToWishlist(goodsId) {
    return apiCaller.put(`api/wishlist/my/${goodsId}`)
  },

  removeFromWishlist(goodsId) {
    return apiCaller.delete(`api/wishlist/my/${goodsId}`)
  },

  // ========== STOCK ALERTS ("notify me when available", customer) ==========
  listStockAlerts(config) {
    return apiCaller.get('api/stock-alerts/my', config)
  },

  listStockAlertIds() {
    return apiCaller.get('api/stock-alerts/my/ids')
  },

  addStockAlert(goodsId) {
    return apiCaller.put(`api/stock-alerts/my/${goodsId}`)
  },

  removeStockAlert(goodsId) {
    return apiCaller.delete(`api/stock-alerts/my/${goodsId}`)
  },
})
