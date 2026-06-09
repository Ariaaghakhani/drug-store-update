<!-- components/panel/orders/Customer.vue -->
<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">
        سفارشات <span class="text-brand-500">من</span>
      </h3>
      <div class="flex gap-2">
        <USelect
          v-model="statusFilter"
          :items="statusOptions"
          size="sm"
          class="w-40"
        />
      </div>
    </div>

    <!-- Orders list -->
    <div v-if="filteredOrders.length > 0" class="space-y-3">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="flex items-center gap-4 px-4 py-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <!-- Icon -->
        <div
          class="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0"
        >
          <UIcon
            name="i-heroicons-shopping-bag"
            class="w-5 h-5 text-brand-500 dark:text-brand-400"
          />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm font-semibold text-gray-900 dark:text-white">
              سفارش #{{ order.id }}
            </span>
            <UBadge
              :color="statusColor(order.status)"
              variant="subtle"
              size="xs"
            >
              {{ statusLabel(order.status) }}
            </UBadge>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {{ order.itemCount.toLocaleString('fa-IR') }} کالا ·
            {{ order.date }}
          </p>
        </div>

        <!-- Price + action -->
        <div class="text-end flex-shrink-0">
          <p class="text-sm font-bold text-gray-900 dark:text-white">
            {{ order.total.toLocaleString('fa-IR') }} تومان
          </p>
          <button
            class="text-xs text-brand-500 dark:text-brand-400 hover:underline mt-0.5"
          >
            مشاهده جزئیات
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-16">
      <div
        class="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4"
      >
        <UIcon
          name="i-heroicons-shopping-bag"
          class="w-10 h-10 text-gray-400 dark:text-gray-600"
        />
      </div>
      <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
        هنوز سفارشی ثبت نشده است
      </h4>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
        می‌توانید از فروشگاه ما خرید کنید
      </p>
      <UButton to="/medications" color="primary" icon="i-heroicons-shopping-cart">
        مشاهده محصولات
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface Order {
  id: string
  status: OrderStatus
  itemCount: number
  total: number
  date: string
}

const statusOptions = [
  { label: 'همه سفارشات', value: 'all' },
  { label: 'در انتظار تایید', value: 'pending' },
  { label: 'در حال پردازش', value: 'processing' },
  { label: 'ارسال شده', value: 'shipped' },
  { label: 'تحویل شده', value: 'delivered' },
  { label: 'لغو شده', value: 'cancelled' },
]

const statusFilter = ref('all')

const orders: Order[] = [
  { id: '۱۰۰۴۵', status: 'delivered', itemCount: 3, total: 285000, date: '۱۴۰۳/۰۳/۱۲' },
  { id: '۱۰۰۳۸', status: 'shipped', itemCount: 1, total: 129000, date: '۱۴۰۳/۰۳/۰۵' },
  { id: '۱۰۰۲۱', status: 'cancelled', itemCount: 2, total: 98000, date: '۱۴۰۳/۰۲/۲۸' },
]

const filteredOrders = computed(() =>
  statusFilter.value === 'all'
    ? orders
    : orders.filter((o) => o.status === statusFilter.value)
)

const statusColor = (status: OrderStatus) => {
  const map: Record<OrderStatus, 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
    pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error',
  }
  return map[status]
}

const statusLabel = (status: OrderStatus) => {
  const map: Record<OrderStatus, string> = {
    pending: 'در انتظار تایید',
    processing: 'در حال پردازش',
    shipped: 'ارسال شده',
    delivered: 'تحویل شده',
    cancelled: 'لغو شده',
  }
  return map[status]
}
</script>
