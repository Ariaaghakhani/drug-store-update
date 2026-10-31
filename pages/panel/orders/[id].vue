<!-- pages/panel/orders/[id].vue -->
<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-black text-gray-900 dark:text-white">
        جزئیات <span class="text-brand-500">سفارش</span>
      </h3>
      <UButton
        to="/panel/orders"
        color="neutral"
        variant="outline"
        icon="i-heroicons-arrow-right"
      >
        بازگشت به سفارشات
      </UButton>
    </div>

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="space-y-4">
          <USkeleton class="h-28 w-full rounded-xl" />
          <USkeleton class="h-48 w-full rounded-xl" />
          <USkeleton class="h-32 w-full rounded-xl" />
        </div>

        <div v-else-if="order" key="content" class="space-y-4">
          <!-- Summary -->
          <UCard>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-base font-bold text-gray-900 dark:text-white">
                سفارش #{{ order.id.toLocaleString('fa-IR') }}
              </span>
              <UBadge :color="orderStatus.color" variant="subtle" size="xs">
                {{ orderStatus.label }}
              </UBadge>
              <UBadge :color="fulfillment.color" variant="subtle" size="xs">
                {{ fulfillment.label }}
              </UBadge>
            </div>
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm">
              <div>
                <dt class="text-gray-500 dark:text-gray-400">تاریخ ثبت</dt>
                <dd class="font-semibold text-gray-900 dark:text-white">
                  {{ formatDate(order.dateOrdered) }}
                </dd>
              </div>
              <div v-if="order.shippingMethodTitle">
                <dt class="text-gray-500 dark:text-gray-400">روش ارسال</dt>
                <dd class="font-semibold text-gray-900 dark:text-white">
                  {{ order.shippingMethodTitle }}
                </dd>
              </div>
              <div v-if="order.trackingCode">
                <dt class="text-gray-500 dark:text-gray-400">کد رهگیری</dt>
                <dd class="font-semibold text-gray-900 dark:text-white">
                  <a
                    v-if="order.trackingUrl"
                    :href="order.trackingUrl"
                    target="_blank"
                    rel="noopener"
                    class="text-brand-500 dark:text-brand-400 hover:underline"
                  >
                    {{ order.trackingCode }}
                  </a>
                  <span v-else>{{ order.trackingCode }}</span>
                </dd>
              </div>
              <div v-if="order.deliveredAt">
                <dt class="text-gray-500 dark:text-gray-400">تاریخ تحویل</dt>
                <dd class="font-semibold text-gray-900 dark:text-white">
                  {{ formatDate(order.deliveredAt) }}
                </dd>
              </div>
            </dl>
          </UCard>

          <!-- Items -->
          <UCard>
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">اقلام سفارش</h4>
            <div v-if="items.length" class="divide-y divide-gray-100 dark:divide-gray-800">
              <div
                v-for="item in items"
                :key="item.id"
                class="flex items-center gap-3 py-3"
              >
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ item.goodsName || `کالا #${item.goodsId}` }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {{ Number(item.quantity).toLocaleString('fa-IR') }} ×
                    {{ formatPrice(item.unitPrice) }}
                  </p>
                </div>
                <p class="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">
                  {{ formatPrice(item.lineTotal) }}
                </p>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">
              قلمی برای این سفارش ثبت نشده است
            </p>
          </UCard>

          <!-- Totals -->
          <UCard>
            <dl class="space-y-2 text-sm">
              <div v-for="row in totalRows" :key="row.label" class="flex justify-between">
                <dt class="text-gray-500 dark:text-gray-400">{{ row.label }}</dt>
                <dd class="font-semibold text-gray-900 dark:text-white">{{ row.value }}</dd>
              </div>
              <div
                class="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-800"
              >
                <dt class="font-bold text-gray-900 dark:text-white">مبلغ نهایی</dt>
                <dd class="font-black text-brand-500 dark:text-brand-400">
                  {{ formatPrice(order.totalAmount) }}
                </dd>
              </div>
            </dl>
          </UCard>

          <!-- Shipping address -->
          <UCard v-if="order.shippingAddress">
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">آدرس تحویل</h4>
            <p class="text-sm text-gray-900 dark:text-white">
              {{ order.shippingAddress.recipientName }}
              <span v-if="order.shippingAddress.recipientPhone" class="text-gray-500 dark:text-gray-400">
                — {{ order.shippingAddress.recipientPhone }}
              </span>
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ addressLine }}
            </p>
            <p v-if="order.shippingAddress.postalCode" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              کد پستی: {{ order.shippingAddress.postalCode }}
            </p>
          </UCard>
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
          <h4 class="text-base font-bold text-gray-900 dark:text-white mb-2">سفارش یافت نشد</h4>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
            این سفارش وجود ندارد یا به شما تعلق ندارد
          </p>
          <UButton to="/panel/orders" color="primary" icon="i-heroicons-arrow-right">
            بازگشت به سفارشات
          </UButton>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
// orderStatusMeta(order) comes from utils/orderStatus.js (keyed by OrderDTO.statusCode)
const FULFILLMENT_META = {
  SHIPPED: { label: 'ارسال شده', color: 'info' },
  READY_FOR_PICKUP: { label: 'آماده تحویل', color: 'info' },
  DELIVERED: { label: 'تحویل شده', color: 'success' },
}

const FULFILLMENT_PREPARING = { label: 'در حال آماده‌سازی', color: 'neutral' }

const route = useRoute()
const app = useNuxtApp()
const { formatPrice } = useFormat()

const loading = ref(true)
const order = ref(null)

const items = computed(() => order.value?.items ?? [])

const orderStatus = computed(() => orderStatusMeta(order.value))

const fulfillment = computed(() => {
  const status = order.value?.fulfillmentStatus
  if (!status) return FULFILLMENT_PREPARING
  return FULFILLMENT_META[status] ?? FULFILLMENT_PREPARING
})

const totalRows = computed(() => {
  const o = order.value
  if (!o) return []
  const rows = []
  if (Number(o.discountAmount) > 0) rows.push({ label: 'تخفیف', value: `− ${formatPrice(o.discountAmount)}` })
  if (o.shippingCost != null) rows.push({ label: 'هزینه ارسال', value: formatPrice(o.shippingCost) })
  if (Number(o.walletAmount) > 0) rows.push({ label: 'پرداخت از کیف پول', value: formatPrice(o.walletAmount) })
  return rows
})

const addressLine = computed(() => {
  const a = order.value?.shippingAddress
  if (!a) return ''
  return [a.provinceName, a.cityName, a.fullAddress].filter(Boolean).join('، ')
})

const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('fa-IR')
}

async function fetchOrder() {
  loading.value = true
  try {
    const response = await app.$api.orders.getOrder({ data: { id: Number(route.params.id) } })
    order.value = response.data.data ?? null
  } catch {
    order.value = null
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrder)

useHead({ title: 'جزئیات سفارش | پنل کاربری' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
