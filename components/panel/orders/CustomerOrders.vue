<template>
  <div>
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

    <div class="relative">
      <Transition name="sk">
        <div v-if="isLoading" key="skeleton" class="space-y-3">
          <div
            v-for="i in 3"
            :key="i"
            class="flex items-center gap-4 px-4 py-4 rounded-xl border border-gray-100 dark:border-gray-800"
          >
            <USkeleton class="w-11 h-11 rounded-xl flex-shrink-0" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-24" />
              <USkeleton class="h-3 w-32" />
            </div>
            <USkeleton class="h-4 w-20" />
          </div>
        </div>

        <div v-else-if="filteredOrders.length > 0" key="content" class="space-y-3">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="flex items-center gap-4 px-4 py-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div
              class="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0"
            >
              <UIcon
                name="i-heroicons-shopping-bag"
                class="w-5 h-5 text-brand-500 dark:text-brand-400"
              />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-semibold text-gray-900 dark:text-white">
                  سفارش #{{ order.id.toLocaleString('fa-IR') }}
                </span>
                <UBadge :color="orderStatusMeta(order).color" variant="subtle" size="xs">
                  {{ orderStatusMeta(order).label }}
                </UBadge>
                <UBadge :color="fulfillmentMeta(order).color" variant="subtle" size="xs">
                  {{ fulfillmentMeta(order).label }}
                </UBadge>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {{ formatDate(order.dateOrdered) }}
              </p>
            </div>

            <div class="text-end flex-shrink-0">
              <p class="text-sm font-bold text-gray-900 dark:text-white">
                {{ Number(order.totalAmount ?? 0).toLocaleString('fa-IR') }} تومان
              </p>
              <button
                class="text-xs text-brand-500 dark:text-brand-400 hover:underline mt-0.5"
              >
                مشاهده جزئیات
              </button>
            </div>
          </div>
        </div>

        <div v-else key="empty" class="text-center py-16">
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
      </Transition>
    </div>
  </div>
</template>

<script setup>
const ORDER_STATUS_META = {
  PENDING: { label: 'در انتظار پرداخت', color: 'warning' },
  PAID: { label: 'پرداخت شده', color: 'success' },
  FAILED: { label: 'پرداخت ناموفق', color: 'error' },
}

const FULFILLMENT_META = {
  SHIPPED: { label: 'ارسال شده', color: 'info' },
  READY_FOR_PICKUP: { label: 'آماده تحویل', color: 'info' },
  DELIVERED: { label: 'تحویل شده', color: 'success' },
}

const FULFILLMENT_PREPARING = { label: 'در حال آماده‌سازی', color: 'neutral' }

const app = useNuxtApp()
const userStore = useUserStore()

const isLoading = ref(true)
const orders = ref([])
const statusCatalog = ref([])
const statusFilter = ref('all')

const catalogById = computed(() => {
  const map = new Map()
  statusCatalog.value.forEach((entry) => map.set(entry.id, entry))
  return map
})

const statusOptions = computed(() => [
  { label: 'همه سفارشات', value: 'all' },
  ...statusCatalog.value.map((entry) => ({
    label: ORDER_STATUS_META[entry.code]?.label ?? entry.title,
    value: entry.id,
  })),
])

const orderStatusMeta = (order) => {
  const entry = catalogById.value.get(order.statusId)
  if (!entry) {
    return { label: `#${order.statusId}`, color: 'neutral' }
  }
  return ORDER_STATUS_META[entry.code] ?? { label: entry.title, color: 'neutral' }
}

const fulfillmentMeta = (order) => {
  if (!order.fulfillmentStatus) return FULFILLMENT_PREPARING
  return FULFILLMENT_META[order.fulfillmentStatus] ?? FULFILLMENT_PREPARING
}

const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('fa-IR')
}

const filteredOrders = computed(() =>
  statusFilter.value === 'all'
    ? orders.value
    : orders.value.filter((order) => order.statusId === statusFilter.value)
)

async function fetchStatusCatalog() {
  try {
    const response = await app.$api.catalog.getCatalogsByType({
      data: { type: 'ORDER_STATUS' },
    })
    statusCatalog.value = response.data.data ?? []
  } catch {
    statusCatalog.value = []
  }
}

async function fetchOrders() {
  isLoading.value = true
  try {
    const personId = userStore.currentUser?.person?.id
    const response = await app.$api.orders.byPerson({
      data: { personId },
    })
    orders.value = response.data.data ?? []
  } catch (error) {
    console.log(error)
    orders.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchStatusCatalog()
  fetchOrders()
})
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
