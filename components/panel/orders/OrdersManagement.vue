<template>
  <div>
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

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
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

    <div class="flex gap-2 flex-wrap mb-4">
      <button
        v-for="opt in statusTabs"
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
        <span v-if="opt.count !== undefined" class="ms-1 opacity-75">
          ({{ opt.count.toLocaleString('fa-IR') }})
        </span>
      </button>
    </div>

    <div class="relative">
      <Transition name="sk">
        <div v-if="isLoading" key="skeleton" class="space-y-2">
          <div
            v-for="i in 4"
            :key="i"
            class="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800"
          >
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-28" />
              <USkeleton class="h-3 w-36" />
            </div>
            <USkeleton class="h-4 w-16" />
            <USkeleton class="h-7 w-16 rounded-lg" />
          </div>
        </div>

        <div v-else-if="orders.length > 0" key="content" class="space-y-2">
          <div
            v-for="order in orders"
            :key="order.id"
            class="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-semibold text-gray-900 dark:text-white">
                  #{{ Number(order.entityId ?? 0).toLocaleString('fa-IR') }}
                </span>
                <UBadge :color="orderStatusMeta(order).color" variant="subtle" size="xs">
                  {{ orderStatusMeta(order).label }}
                </UBadge>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                {{ order.personFullName }} · {{ formatDate(order.dateOrdered) }}
              </p>
            </div>

            <span class="hidden sm:block text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
              {{ (order.items?.length ?? 0).toLocaleString('fa-IR') }} کالا
            </span>

            <span class="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">
              {{ Number(order.totalAmount ?? 0).toLocaleString('fa-IR') }} تومان
            </span>

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

        <div v-else key="empty" class="text-center py-16">
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

const app = useNuxtApp()

const search = ref('')
const statusFilter = ref('all')
const isLoading = ref(true)
const orders = ref([])
const statusCatalog = ref([])
const totalCount = ref(0)
const statusCounts = ref({})
let searchDebounce = null

const stats = computed(() => {
  const pageSum = orders.value.reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0)
  return [
    { label: 'کل سفارشات', value: totalCount.value.toLocaleString('fa-IR') },
    ...statusCatalog.value.map((entry) => ({
      label: ORDER_STATUS_META[entry.code]?.label ?? entry.title,
      value: (statusCounts.value[entry.code] ?? 0).toLocaleString('fa-IR'),
    })),
    { label: 'جمع این صفحه', value: pageSum.toLocaleString('fa-IR') + ' ت' },
  ]
})

const statusTabs = computed(() => [
  { label: 'همه', value: 'all', count: totalCount.value },
  ...statusCatalog.value.map((entry) => ({
    label: ORDER_STATUS_META[entry.code]?.label ?? entry.title,
    value: entry.code,
    count: statusCounts.value[entry.code] ?? 0,
  })),
])

const orderStatusMeta = (order) => {
  return ORDER_STATUS_META[order.statusCode] ?? { label: order.status ?? `#${order.statusCode}`, color: 'neutral' }
}

const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('fa-IR')
}

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

async function fetchStatusCounts() {
  try {
    const allResponse = await app.$api.orders.searchOrders({ data: { page: 0, size: 1 } })
    totalCount.value = allResponse.data.data?.totalElements ?? 0

    const counts = {}
    await Promise.all(
      statusCatalog.value.map(async (entry) => {
        try {
          const response = await app.$api.orders.searchOrdersByStatus(entry.code, {
            data: { page: 0, size: 1 },
          })
          counts[entry.code] = response.data.data?.totalElements ?? 0
        } catch {
          counts[entry.code] = 0
        }
      })
    )
    statusCounts.value = counts
  } catch (error) {
    console.log(error)
    totalCount.value = 0
    statusCounts.value = {}
  }
}

async function fetchOrders() {
  isLoading.value = true
  try {
    const body = { data: { query: search.value || undefined, page: 0, size: 20 } }
    const response =
      statusFilter.value === 'all'
        ? await app.$api.orders.searchOrders(body)
        : await app.$api.orders.searchOrdersByStatus(statusFilter.value, body)
    orders.value = response.data.data?.content ?? []
  } catch (error) {
    console.log(error)
    orders.value = []
  } finally {
    isLoading.value = false
  }
}

watch(statusFilter, () => fetchOrders())

watch(search, () => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => fetchOrders(), 300)
})

onMounted(async () => {
  await fetchStatusCatalog()
  fetchStatusCounts()
  fetchOrders()
})
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
