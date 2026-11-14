/**
 * Analytics & Dashboard Service
 * Dashboard and KPIs (reports live in reports.js)
 */
export default (apiCaller) => ({
  // ========== DASHBOARD ==========
  getDashboardSummary(config) {
    return apiCaller.get('api/dashboard/admin/summary', config)
  },

  getLowStock(config) {
    return apiCaller.get('api/dashboard/admin/low-stock', config)
  },

  getExpiringGoods(config) {
    return apiCaller.post('api/dashboard/admin/expiring-goods', config)
  },

  getUserActivityChart(config) {
    return apiCaller.post('api/dashboard/admin/users-bar-chart-filtered', config)
  },

  getCategoryChart(config) {
    return apiCaller.post('api/dashboard/admin/goods-category-pie-filtered', config)
  },

  // ========== OWNER DASHBOARD (staff with dashboard access only) ==========
  getRevenueSummary(config) {
    return apiCaller.get('api/dashboard/owner/revenue-summary', config)
  },

  getSalesTrendChart(config) {
    return apiCaller.post('api/dashboard/owner/sales-trend-chart', config)
  },

  getTopProducts(config) {
    return apiCaller.post('api/dashboard/owner/top-products', config)
  },

  getStaffActivity(config) {
    return apiCaller.post('api/dashboard/owner/staff-activity', config)
  },

  // ========== CUSTOMER DASHBOARD (any logged-in user, own data) ==========
  getCustomerDashboardSummary(config) {
    return apiCaller.get('api/dashboard/customer/summary', config)
  },
})
