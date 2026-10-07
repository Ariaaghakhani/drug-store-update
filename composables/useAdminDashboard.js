export const useAdminDashboard = () => {
  const { $api } = useNuxtApp()

  const { data: summary, pending: summaryPending } = useAsyncData(
    'admin-dashboard-summary',
    async () => {
      const response = await $api.analytics.getDashboardSummary()
      return response.data.data
    }
  )

  const { data: lowStock, pending: lowStockPending } = useAsyncData(
    'admin-dashboard-low-stock',
    async () => {
      const response = await $api.analytics.getLowStock()
      return response.data.data
    }
  )

  const { data: expiringGoods, pending: expiringGoodsPending } = useAsyncData(
    'admin-dashboard-expiring-goods',
    async () => {
      const response = await $api.analytics.getExpiringGoods()
      return response.data.data
    }
  )

  // TODO: order queue data
  // TODO: prescription review queue

  return {
    summary,
    summaryPending,
    lowStock,
    lowStockPending,
    expiringGoods,
    expiringGoodsPending,
  }
}
