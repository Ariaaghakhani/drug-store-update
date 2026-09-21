/**
 * Analytics & Dashboard Service
 * Dashboard, KPIs, reports, and analytics
 */
export default (apiCaller) => ({
  // ========== DASHBOARD ==========
  getDashboardSummary(config) {
    return apiCaller.post('api/dashboard/summary', config)
  },

  getDashboardKpi(config) {
    return apiCaller.post('api/dashboard/kpi', config)
  },

  getSalesChart(config) {
    return apiCaller.post('api/dashboard/sales-chart', config)
  },

  getRevenueChart(config) {
    return apiCaller.post('api/dashboard/revenue-chart', config)
  },

  getCategoryChart(config) {
    return apiCaller.post('api/dashboard/category-chart', config)
  },

  getExpiringGoods(config) {
    return apiCaller.post('api/dashboard/expiring-goods', config)
  },

  // ========== REPORTS ==========
  listReports(config) {
    return apiCaller.post('api/reports/list', config)
  },

  getReport(config) {
    return apiCaller.post('api/reports/get', config)
  },

  generateReport(config) {
    return apiCaller.post('api/reports/generate', config)
  },

  downloadReport(config) {
    return apiCaller.post('api/reports/download', config)
  },

  // ========== REPORT MANAGEMENT ==========
  listReportTemplates(config) {
    return apiCaller.post('api/reports/manage/templates', config)
  },

  createReportTemplate(config) {
    return apiCaller.post('api/reports/manage/create-template', config)
  },

  updateReportTemplate(config) {
    return apiCaller.post('api/reports/manage/update-template', config)
  },

  deleteReportTemplate(config) {
    return apiCaller.post('api/reports/manage/delete-template', config)
  },

  scheduleReport(config) {
    return apiCaller.post('api/reports/manage/schedule', config)
  },
})
