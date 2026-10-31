export const useOwnerDashboard = () => {
  const { $api } = useNuxtApp()

  const { data: userActivityChart, pending: userActivityChartPending } = useAsyncData(
    'owner-dashboard-user-activity-chart',
    async () => {
      const response = await $api.analytics.getUserActivityChart()
      return response.data.data
    }
  )

  const { data: categoryChart, pending: categoryChartPending } = useAsyncData(
    'owner-dashboard-category-chart',
    async () => {
      const response = await $api.analytics.getCategoryChart()
      return response.data.data
    }
  )

  const { data: revenueSummary, pending: revenueSummaryPending } = useAsyncData(
    'owner-dashboard-revenue-summary',
    async () => {
      const response = await $api.analytics.getRevenueSummary()
      return response.data.data
    }
  )

  const { data: salesTrendChart, pending: salesTrendChartPending } = useAsyncData(
    'owner-dashboard-sales-trend-chart',
    async () => {
      const response = await $api.analytics.getSalesTrendChart()
      return response.data.data
    }
  )

  const { data: topProducts, pending: topProductsPending } = useAsyncData(
    'owner-dashboard-top-products',
    async () => {
      const response = await $api.analytics.getTopProducts()
      return response.data.data
    }
  )

  const { data: staffActivity, pending: staffActivityPending } = useAsyncData(
    'owner-dashboard-staff-activity',
    async () => {
      const response = await $api.analytics.getStaffActivity()
      return response.data.data
    }
  )

  return {
    userActivityChart,
    userActivityChartPending,
    categoryChart,
    categoryChartPending,
    revenueSummary,
    revenueSummaryPending,
    salesTrendChart,
    salesTrendChartPending,
    topProducts,
    topProductsPending,
    staffActivity,
    staffActivityPending,
  }
}
