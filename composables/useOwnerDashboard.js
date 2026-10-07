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

  // TODO: revenue metrics
  // TODO: sales trends
  // TODO: top products
  // TODO: staff activity

  return {
    userActivityChart,
    userActivityChartPending,
    categoryChart,
    categoryChartPending,
  }
}
