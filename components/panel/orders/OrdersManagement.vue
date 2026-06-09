<!-- components/panel/orders/ManagementOrders.vue -->
<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">
        مدیریت <span class="text-brand-500">سفارشات</span>
      </h3>
      <UInput
        v-model="search"
        placeholder="جستجوی سفارش یا مشتری..."
        icon="i-heroicons-magnifying-glass"
        size="sm"
        class="w-56"
      />
    </div>

    <!-- Stats strip -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3"
      >
        <p class="text-xs text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
        <p class="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
          {{ stat.value }}
        </p>
      </div>
    </div>

    <!-- Status filter tabs -->
    <div class="flex gap-2 flex-wrap mb-4">
      <button
        v-for="opt in statusOptions"
        :key="opt.value"
        class="px-3 py-1.5 rounded-lg text-sm transition-colors"
        :class="
          statusFilter === opt.value
            ? 'bg-brand-500 text-white font-medium'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        "
        @click="statusFilter = opt.value"
      >
        {{ opt.label }}
        <span
          v-if="opt.count !== undefined"
          class="ms-1 opacity-75"
        >
          ({{ opt.count.toLocaleString('fa-IR') }})
        </span>
      </button>
    </div>

    <!-- Orders table -->
    <div v-if="filteredOrders.length > 0" class="space-y-2">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <!-- Order id + customer -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm font-semibold text-gray-900 dark:text-white">
              #{{ order.id }}
            </span>
            <UBadge
              :color="statusColor(order.status)"
              variant="subtle"
              size="xs"
            >
              {{ statusLabel(order.status) }}
            </UBadge>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {{ order.customerName }} · {{ order.date }}
          </p>
        </div>

        <!-- Items count -->
        <span class="hidden sm:block text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
          {{ order.itemCount.toLocaleString('fa-IR') }} کالا
        </span>

        <!-- Total -->
        <span class="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">
          {{ order.total.toLocaleString('fa-IR') }} تومان
        </span>

        <!-- Action -->
        <UButton
          color="neutral"
          variant="soft"
          size="xs"
          icon="i-heroicons-eye"
          class="flex-shrink-0"
        >
          <span class="hidden sm:inline">بررسی</span>
        </UButton>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-16">
      <UIcon
        name="i-heroicons-clipboard-document-list"
        class="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4"
      />
      <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-1">
        سفارشی یافت نشد
      </h4>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        فیلتر را تغییر دهید یا عبارت جستجو را بررسی کنید
      </p>
    </div>
  </div>
</template>

<script setup>
const search = ref('')
const statusFilter = ref('all')

const allOrders = [
  { id: '۱۰۰۴۵', status: 'pending', customerName: 'علی محمدی', itemCount: 2, total: 185000, date: '۱۴۰۳/۰۳/۱۴' },
  { id: '۱۰۰۴۴', status: 'processing', customerName: 'سارا رضایی', itemCount: 4, total: 620000, date: '۱۴۰۳/۰۳/۱۴' },
  { id: '۱۰۰۴۳', status: 'shipped', customerName: 'مهدی کریمی', itemCount: 1, total: 129000, date: '۱۴۰۳/۰۳/۱۳' },
  { id: '۱۰۰۴۲', status: 'delivered', customerName: 'فاطمه احمدی', itemCount: 3, total: 340000, date: '۱۴۰۳/۰۳/۱۲' },
  { id: '۱۰۰۴۱', status: 'cancelled', customerName: 'رضا حسینی', itemCount: 2, total: 98000, date: '۱۴۰۳/۰۳/۱۱' },
]

const stats = computed(() => [
  { label: 'کل سفارشات', value: allOrders.length.toLocaleString('fa-IR') },
  { label: 'در انتظار', value: allOrders.filter((o) => o.status === 'pending').length.toLocaleString('fa-IR') },
  { label: 'درحال پردازش', value: allOrders.filter((o) => o.status === 'processing').length.toLocaleString('fa-IR') },
  {
    label: 'درآمد امروز',
    value: allOrders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0).toLocaleString('fa-IR') + ' ت',
  },
])

const statusOptions = computed(() => [
  { label: 'همه', value: 'all', count: allOrders.length },
  { label: 'در انتظار', value: 'pending', count: allOrders.filter((o) => o.status === 'pending').length },
  { label: 'پردازش', value: 'processing', count: allOrders.filter((o) => o.status === 'processing').length },
  { label: 'ارسال شده', value: 'shipped', count: allOrders.filter((o) => o.status === 'shipped').length },
  { label: 'تحویل شده', value: 'delivered', count: allOrders.filter((o) => o.status === 'delivered').length },
  { label: 'لغو شده', value: 'cancelled', count: allOrders.filter((o) => o.status === 'cancelled').length },
])

const filteredOrders = computed(() => {
  let result = allOrders
  if (statusFilter.value !== 'all') result = result.filter((o) => o.status === statusFilter.value)
  if (search.value.trim()) {
    const q = search.value.trim()
    result = result.filter((o) => o.id.includes(q) || o.customerName.includes(q))
  }
  return result
})

const statusColor = (status) => {
  const map = { pending: 'warning', processing: 'info', shipped: 'primary', delivered: 'success', cancelled: 'error' }
  return map[status]
}

const statusLabel = (status) => {
  const map = { pending: 'در انتظار تایید', processing: 'در حال پردازش', shipped: 'ارسال شده', delivered: 'تحویل شده', cancelled: 'لغو شده' }
  return map[status]
}
</script>
