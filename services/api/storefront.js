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

  // ========== HOME / BRANDS / PRODUCT PAGE EXTRAS (public) ==========
  // StorefrontHomeDTO {sections: [{key, title, items: StorefrontGoodsDTO[]}]}; off/empty sections are not returned
  getHome() {
    return apiCaller.get('api/storefront/home')
  },

  // CategoryDTO[] roots with nested `children` {id, name, parentId, level, code, sortOrder, children}.
  // Public since BACK #470 (2026-11-04). Callers still treat 401/403 as "no categories" defensively.
  getCategoryTree(config) {
    return apiCaller.get('api/categories/tree', { params: { scope: 'PRODUCT' }, ...config })
  },

  // config.params {withGoodsOnly=true, limit?} → StorefrontBrandDTO {id, name, logoUrl, goodsCount}[]
  listBrands(config) {
    return apiCaller.get('api/storefront/brands', config)
  },

  // StorefrontBrandDetailDTO {id, name, logoUrl, description, goodsCount, categories}; 404 brand.not.found
  getBrand(brandId) {
    return apiCaller.get(`api/storefront/brands/${brandId}`)
  },

  // config.params {categoryId?, sort?, page, size} → {days, goods: PageResponse<StorefrontGoodsDTO>}
  listNearExpiry(config) {
    return apiCaller.get('api/storefront/goods/near-expiry', config)
  },

  // {goodsId, similar, brandId, brandName, sameBrand} — both lists are StorefrontGoodsDTO[], in-stock only
  getRelatedGoods(goodsId) {
    return apiCaller.get(`api/storefront/goods/${goodsId}/related`)
  },

  // config.params {rating?: 1..5, page, size} → PageResponse<GoodsReviewDTO> (approved only, newest first)
  listGoodsReviews(goodsId, config) {
    return apiCaller.get(`api/reviews/goods/${goodsId}`, config)
  },

  // {goodsId, averageRating (null when no reviews), reviewCount, ratingCounts: {1..5: n}}
  getGoodsRatingSummary(goodsId) {
    return apiCaller.get(`api/reviews/goods/${goodsId}/summary`)
  },

  // config.params {page, size} → PageResponse<GoodsQuestionDTO> (answered + public only; empty when the store turned Q&A off)
  listGoodsQuestions(goodsId, config) {
    return apiCaller.get(`api/questions/goods/${goodsId}`, config)
  },

  // ========== MY REVIEWS (customer, any login; BACK GoodsReviewCustomerController, module GOODS_REVIEW_CUSTOMER) ==========
  // {goodsId, canReview, review: MyGoodsReviewDTO|null}; canReview = a paid order holds the goods (else submit is 403)
  getMyReviewState(goodsId) {
    return apiCaller.get(`api/reviews/my/goods/${goodsId}`)
  },

  // body {goodsId, rating 1..5, comment?} → MyGoodsReviewDTO (status PENDING); re-submitting edits the one review per goods
  submitReview(config) {
    return apiCaller.post('api/reviews/my', config)
  },

  // config.params {page, size, rating?} → PageResponse<MyGoodsReviewDTO {id,rating,comment,authorName,createdAt,storeReply,storeReplyAt,goodsId,goodsName,status,updatedAt}>, newest first
  listMyReviews(config) {
    return apiCaller.get('api/reviews/my', config)
  },

  // 404 for another user's review
  deleteMyReview(id) {
    return apiCaller.delete(`api/reviews/my/${id}`)
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
