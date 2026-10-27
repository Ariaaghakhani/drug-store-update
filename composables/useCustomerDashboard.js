const mapOrderStage = (order) => {
  if (order.status && order.status !== 'PAID') return 'pending'
  if (order.fulfillmentStatus === 'DELIVERED') return 'delivered'
  if (order.fulfillmentStatus === 'SHIPPED' || order.fulfillmentStatus === 'READY_FOR_PICKUP') return 'shipping'
  return 'packaging'
}

export const useCustomerDashboard = () => {
  const { $api } = useNuxtApp()

  const { data: summary, pending: summaryPending } = useAsyncData(
    'customer-dashboard-summary',
    async () => {
      const response = await $api.analytics.getCustomerDashboardSummary()
      return response.data.data
    }
  )

  const stats = computed(() => ({
    pendingCount: summary.value?.pendingOrderCount ?? 0,
    completedCount: summary.value?.completedOrderCount ?? 0,
    totalSpent: summary.value?.totalSpent ?? 0,
  }))

  const orders = computed(() =>
    (summary.value?.activeOrders ?? []).map((order) => ({
      id: order.trackingCode || `#${order.id}`,
      trackingCode: order.trackingCode,
      status: mapOrderStage(order),
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('fa-IR') : '',
      itemCount: order.itemCount ?? 0,
      createdAt: order.createdAt ? new Date(order.createdAt).getTime() : 0,
    }))
  )

  const prescriptions = computed(() => summary.value?.prescriptions ?? [])
  const reorderItems = computed(() => summary.value?.reorderSuggestions ?? [])

  return {
    stats,
    statsPending: summaryPending,
    orders,
    ordersPending: summaryPending,
    prescriptions,
    prescriptionsPending: summaryPending,
    reorderItems,
    reorderPending: summaryPending,
  }
}
