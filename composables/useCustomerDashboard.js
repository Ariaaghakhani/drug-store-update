export const useCustomerDashboard = () => {
  const { data: stats, pending: statsPending } = useAsyncData(
    'customer-stats',
    () =>
      Promise.resolve({
        pendingCount: 2,
        completedCount: 8,
        totalSpent: 3450000,
      })
  )

  const { data: orders, pending: ordersPending } = useAsyncData(
    'customer-orders',
    () =>
      Promise.resolve([
        {
          id: 'ORD-10045',
          trackingCode: '۲۳۴۵۶۷۸۹۰۱',
          status: 'shipping',
          date: '۱۴۰۳/۰۳/۲۰',
          itemCount: 2,
          createdAt: 1717200000,
        },
        {
          id: 'ORD-10043',
          trackingCode: '۳۴۵۶۷۸۹۰۱۲',
          status: 'packaging',
          date: '۱۴۰۳/۰۳/۱۸',
          itemCount: 1,
          createdAt: 1717027200,
        },
        {
          id: 'ORD-10042',
          trackingCode: '۱۲۳۴۵۶۷۸۹۰',
          status: 'delivered',
          date: '۱۴۰۳/۰۳/۱۵',
          itemCount: 3,
          createdAt: 1716768000,
        },
      ])
  )

  const { data: reminders, pending: remindersPending } = useAsyncData(
    'customer-reminders',
    () =>
      Promise.resolve([
        { id: '1', medicationName: 'متفورمین ۵۰۰', daysRemaining: 2 },
        { id: '2', medicationName: 'لوزارتان ۵۰', daysRemaining: 7 },
        { id: '3', medicationName: 'آتورواستاتین ۲۰', daysRemaining: 14 },
        { id: '4', medicationName: 'امپرازول ۲۰', daysRemaining: 0 },
        { id: '5', medicationName: 'سرترالین ۵۰', daysRemaining: 21 },
      ])
  )

  const { data: prescriptions, pending: prescriptionsPending } = useAsyncData(
    'customer-prescriptions',
    () =>
      Promise.resolve([
        {
          id: 'RX-001',
          uploadedAt: '۱۴۰۳/۰۲/۱۰',
          status: 'approved',
          description: 'نسخه داروهای مزمن',
        },
        {
          id: 'RX-002',
          uploadedAt: '۱۴۰۳/۰۳/۰۱',
          status: 'pending',
          description: 'نسخه آنتی‌بیوتیک',
        },
      ])
  )

  const { data: reorderItems, pending: reorderPending } = useAsyncData(
    'customer-reorder',
    () =>
      Promise.resolve([
        {
          id: 1,
          nameFa: 'امگا ۳ ۱۰۰۰ میلی‌گرم',
          price: 285000,
          category: 'ویتامین و مکمل',
        },
        {
          id: 2,
          nameFa: 'ویتامین D3 2000 IU',
          price: 175000,
          category: 'ویتامین و مکمل',
        },
        {
          id: 3,
          nameFa: 'منیزیم ۲۵۰ میلی‌گرم',
          price: 210000,
          category: 'ویتامین و مکمل',
        },
        {
          id: 4,
          nameFa: 'زینک ۱۵ میلی‌گرم',
          price: 145000,
          category: 'ویتامین و مکمل',
        },
      ])
  )

  return {
    stats,
    statsPending,
    orders,
    ordersPending,
    reminders,
    remindersPending,
    prescriptions,
    prescriptionsPending,
    reorderItems,
    reorderPending,
  }
}
