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
                <UBadge :color="fulfillmentMeta(order).color" variant="subtle" size="xs">
                  {{ fulfillmentMeta(order).label }}
                </UBadge>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                {{ order.personFullName }} · {{ formatDate(order.dateOrdered) }}
                <span v-if="order.trackingCode"> · کد پیگیری: {{ order.trackingCode }}</span>
              </p>
            </div>

            <span class="hidden sm:block text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
              {{ (order.items?.length ?? 0).toLocaleString('fa-IR') }} کالا
            </span>

            <span class="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">
              {{ Number(order.totalAmount ?? 0).toLocaleString('fa-IR') }} تومان
            </span>

            <UDropdownMenu :items="actionsForOrder(order)" :content="{ align: 'end' }">
              <UButton
                color="neutral"
                variant="soft"
                size="xs"
                icon="i-heroicons-eye"
                class="flex-shrink-0"
                :loading="actingOrderId === order.id"
              >
                <span class="hidden sm:inline">بررسی</span>
              </UButton>
            </UDropdownMenu>
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

    <UModal v-model:open="shipModalOpen" title="ثبت ارسال سفارش">
      <template #body>
        <UFormField label="کد پیگیری (اختیاری)" name="trackingCode">
          <UInput v-model="trackingCodeInput" dir="ltr" placeholder="TR-12345" class="w-full" />
        </UFormField>
        <div class="flex justify-end gap-2 mt-4">
          <UButton color="neutral" variant="outline" @click="shipModalOpen = false">انصراف</UButton>
          <UButton color="primary" :loading="actingOrderId === pendingOrder?.id" @click="confirmShip">
            ثبت ارسال
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="failModalOpen" title="ثبت عدم تحویل">
      <template #body>
        <UFormField label="دلیل عدم تحویل" name="reason">
          <USelect v-model="failureReason" :items="failureReasonOptions" class="w-full" />
        </UFormField>
        <div class="flex justify-end gap-2 mt-4">
          <UButton color="neutral" variant="outline" @click="failModalOpen = false">انصراف</UButton>
          <UButton color="error" variant="soft" :loading="actingOrderId === pendingOrder?.id" @click="confirmDeliveryFailed">
            ثبت
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
const ORDER_STATUS_META = {
  PENDING: { label: 'در انتظار پرداخت', color: 'warning' },
  PAID: { label: 'پرداخت شده', color: 'success' },
  FAILED: { label: 'پرداخت ناموفق', color: 'error' },
  CANCELLED: { label: 'لغو شده', color: 'neutral' },
}

const FULFILLMENT_META = {
  SHIPPED: { label: 'ارسال شده', color: 'info' },
  READY_FOR_PICKUP: { label: 'آماده تحویل', color: 'info' },
  DELIVERED: { label: 'تحویل شده', color: 'success' },
  DELIVERY_FAILED: { label: 'تحویل ناموفق', color: 'error' },
  RETURNED_TO_STORE: { label: 'بازگشت به فروشگاه', color: 'warning' },
  NOT_COLLECTED: { label: 'عدم دریافت', color: 'warning' },
  LOST: { label: 'مفقود شده', color: 'error' },
  DAMAGED: { label: 'آسیب‌دیده', color: 'error' },
}
const FULFILLMENT_PREPARING = { label: 'در حال آماده‌سازی', color: 'neutral' }

const FAILURE_REASON_LABELS = {
  CUSTOMER_ABSENT: 'مشتری حضور نداشت',
  UNREACHABLE: 'عدم دسترسی به مشتری',
  WRONG_ADDRESS: 'آدرس نادرست',
  REFUSED: 'عدم تحویل توسط مشتری',
  OTHER: 'سایر موارد',
}
const failureReasonOptions = Object.entries(FAILURE_REASON_LABELS).map(([value, label]) => ({
  label,
  value,
}))

const app = useNuxtApp()
const toast = useAppToast()

const search = ref('')
const statusFilter = ref('all')
const isLoading = ref(true)
const orders = ref([])
const statusCatalog = ref([])
const totalCount = ref(0)
const statusCounts = ref({})
const revenueTotal = ref(0)
const actingOrderId = ref(null)
const shipModalOpen = ref(false)
const failModalOpen = ref(false)
const trackingCodeInput = ref('')
const failureReason = ref('CUSTOMER_ABSENT')
const pendingOrder = ref(null)
let searchDebounce = null

const extractErrorMessage = (error, fallback) => error?.response?.data?.message ?? fallback

const stats = computed(() => [
  { label: 'کل سفارشات', value: totalCount.value.toLocaleString('fa-IR') },
  ...statusCatalog.value.map((entry) => ({
    label: ORDER_STATUS_META[entry.code]?.label ?? entry.title,
    value: (statusCounts.value[entry.code] ?? 0).toLocaleString('fa-IR'),
  })),
  { label: 'جمع درآمد', value: revenueTotal.value.toLocaleString('fa-IR') + ' ت' },
])

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

const fulfillmentMeta = (order) => FULFILLMENT_META[order.fulfillmentStatus] ?? FULFILLMENT_PREPARING

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

async function fetchStats() {
  try {
    const response = await app.$api.orders.getStats()
    const data = response.data.data ?? {}
    totalCount.value = data.totalOrders ?? 0
    statusCounts.value = data.countByStatus ?? {}
    revenueTotal.value = data.revenueTotal ?? 0
  } catch (error) {
    console.log(error)
    totalCount.value = 0
    statusCounts.value = {}
    revenueTotal.value = 0
  }
}

function actionsForOrder(order) {
  const fulfillment = order.fulfillmentStatus
  const run = (action, needsInput) => () => {
    if (needsInput) {
      pendingOrder.value = order
      if (action === 'ship') {
        trackingCodeInput.value = ''
        shipModalOpen.value = true
      } else if (action === 'delivery-failed') {
        failureReason.value = 'CUSTOMER_ABSENT'
        failModalOpen.value = true
      }
      return
    }
    performAction(order, action)
  }

  const items = []
  if (!fulfillment) {
    items.push({ label: 'ثبت ارسال', icon: 'i-heroicons-truck', onSelect: run('ship', true) })
    items.push({ label: 'آماده تحویل حضوری', icon: 'i-heroicons-shopping-bag', onSelect: run('ready-for-pickup') })
  }
  if (fulfillment === 'SHIPPED' || fulfillment === 'READY_FOR_PICKUP') {
    items.push({ label: 'تحویل شد', icon: 'i-heroicons-check-circle', onSelect: run('deliver') })
    items.push({ label: 'ثبت عدم تحویل', icon: 'i-heroicons-x-circle', onSelect: run('delivery-failed', true) })
  }
  if (fulfillment === 'READY_FOR_PICKUP') {
    items.push({ label: 'عدم دریافت مشتری', icon: 'i-heroicons-clock', onSelect: run('not-collected') })
  }
  items.push({ label: 'بازگشت به فروشگاه', icon: 'i-heroicons-arrow-uturn-right', onSelect: run('returned') })
  items.push({ label: 'مفقود شده', icon: 'i-heroicons-question-mark-circle', onSelect: run('lost') })
  items.push({ label: 'آسیب‌دیده', icon: 'i-heroicons-exclamation-triangle', onSelect: run('damaged') })
  return items
}

async function performAction(order, action, payload) {
  actingOrderId.value = order.id
  try {
    switch (action) {
      case 'ship':
        await app.$api.orders.shipOrder(order.id, { data: payload?.trackingCode ? { trackingCode: payload.trackingCode } : undefined })
        break
      case 'ready-for-pickup':
        await app.$api.orders.readyForPickup(order.id)
        break
      case 'deliver':
        await app.$api.orders.deliverOrder(order.id)
        break
      case 'delivery-failed':
        await app.$api.orders.deliveryFailed(order.id, { data: { reason: payload?.reason } })
        break
      case 'returned':
        await app.$api.orders.returnedToStore(order.id)
        break
      case 'not-collected':
        await app.$api.orders.notCollected(order.id)
        break
      case 'lost':
        await app.$api.orders.lostOrder(order.id)
        break
      case 'damaged':
        await app.$api.orders.damagedOrder(order.id)
        break
    }
    toast.success('وضعیت سفارش به‌روزرسانی شد')
    shipModalOpen.value = false
    failModalOpen.value = false
    await Promise.all([fetchOrders(), fetchStats()])
  } catch (error) {
    toast.error(extractErrorMessage(error, 'ثبت تغییر وضعیت سفارش ناموفق بود'))
  } finally {
    actingOrderId.value = null
  }
}

function confirmShip() {
  if (!pendingOrder.value) return
  performAction(pendingOrder.value, 'ship', { trackingCode: trackingCodeInput.value || undefined })
}

function confirmDeliveryFailed() {
  if (!pendingOrder.value) return
  performAction(pendingOrder.value, 'delivery-failed', { reason: failureReason.value })
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
  fetchStats()
  fetchOrders()
})
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
