<template>
  <UCard :ui="{ body: 'p-0' }" class="h-full">
    <div
      class="flex items-center justify-between gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800"
    >
      <div class="flex items-center gap-2 min-w-0 flex-wrap">
        <UIcon
          name="i-heroicons-truck"
          class="w-4 h-4 text-brand-500 dark:text-brand-400 flex-shrink-0"
        />
        <span class="text-sm font-medium text-gray-900 dark:text-white">
          پیگیری سفارش
        </span>
        <UBadge v-if="otherActiveCount > 0" color="warning" variant="soft" size="xs">
          +{{ Number(otherActiveCount).toLocaleString('fa-IR') }} سفارش فعال دیگر
        </UBadge>
      </div>
      <UButton
        v-if="showSeeAll"
        color="neutral"
        variant="ghost"
        size="xs"
        class="flex-shrink-0"
        @click="$emit('viewAll')"
      >
        مشاهده همه
      </UButton>
    </div>

    <div class="px-5 py-5">
      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="loading" class="space-y-5">
            <div class="flex items-center justify-between">
              <USkeleton class="h-5 w-32" />
              <USkeleton class="h-5 w-20 rounded-full" />
            </div>
            <USkeleton class="h-4 w-48" />
            <USkeleton class="h-20 w-full rounded-lg" />
            <USkeleton class="h-9 w-36 rounded-lg" />
          </div>

          <div
            v-else-if="!featuredOrder"
            key="empty"
            class="flex flex-col items-center py-8 gap-4"
          >
            <UIcon
              name="i-heroicons-shopping-bag"
              class="w-14 h-14 text-gray-300 dark:text-gray-600"
            />
            <div class="text-center">
              <p class="font-bold text-gray-700 dark:text-gray-300">
                هنوز سفارشی ثبت نکرده‌اید
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                اولین سفارش خود را ثبت کنید
              </p>
            </div>
            <UButton color="primary" @click="$emit('shop')">
              شروع خرید
            </UButton>
          </div>

          <div v-else key="content" class="space-y-5">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <span class="font-bold text-gray-900 dark:text-white text-sm">
                سفارش {{ featuredOrder.id }}
              </span>
              <UBadge :color="statusColor" variant="soft" size="sm">
                {{ statusLabel }}
              </UBadge>
            </div>

            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ featuredOrder.date }} · {{ Number(featuredOrder.itemCount).toLocaleString('fa-IR') }} کالا ·
              کد رهگیری: {{ featuredOrder.trackingCode }}
            </p>

            <div class="relative pt-2">
              <div
                class="absolute top-5 start-4 end-4 h-0.5 bg-gray-200 dark:bg-gray-700"
              >
                <div
                  class="absolute top-0 start-0 h-full bg-brand-500 transition-all duration-700"
                  :style="{ width: progressWidth }"
                />
              </div>

              <div class="relative flex justify-between">
                <div
                  v-for="(step, i) in steps"
                  :key="step.key"
                  class="flex flex-col items-center gap-2"
                >
                  <div
                    :class="[
                      'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                      stepState(i) === 'done' &&
                        'bg-brand-500 border-brand-500',
                      stepState(i) === 'active' &&
                        'bg-white dark:bg-gray-800 border-brand-500 ring-4 ring-brand-100 dark:ring-brand-900/30',
                      stepState(i) === 'upcoming' &&
                        'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600',
                    ]"
                  >
                    <UIcon
                      v-if="stepState(i) === 'done'"
                      name="i-heroicons-check"
                      class="w-4 h-4 text-white"
                    />
                    <div
                      v-else-if="stepState(i) === 'active'"
                      class="w-2.5 h-2.5 rounded-full bg-brand-500"
                    />
                  </div>
                  <span
                    :class="[
                      'text-xs text-center',
                      stepState(i) === 'upcoming'
                        ? 'text-gray-400 dark:text-gray-600'
                        : 'text-brand-500 dark:text-brand-400 font-medium',
                    ]"
                  >
                    {{ step.label }}
                  </span>
                </div>
              </div>
            </div>

            <UButton
              color="neutral"
              variant="soft"
              icon="i-heroicons-magnifying-glass"
              size="sm"
              @click="$emit('track')"
            >
              پیگیری مرسوله
            </UButton>
          </div>
        </Transition>
      </div>
    </div>
  </UCard>
</template>

<script setup>
const props = defineProps({
  orders: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['track', 'shop', 'viewAll'])

const ACTIVE_STATUSES = new Set(['pending', 'packaging', 'shipping'])

const activeOrders = computed(() =>
  props.orders
    .filter((o) => ACTIVE_STATUSES.has(o.status))
    .sort((a, b) => b.createdAt - a.createdAt)
)

const featuredOrder = computed(() => {
  if (activeOrders.value.length > 0) return activeOrders.value[0]
  const completed = props.orders
    .filter((o) => o.status === 'delivered')
    .sort((a, b) => b.createdAt - a.createdAt)
  return completed[0] ?? null
})

const otherActiveCount = computed(() => Math.max(0, activeOrders.value.length - 1))
const showSeeAll = computed(() => props.orders.length > 1)

const steps = [
  { key: 'pending', label: 'ثبت' },
  { key: 'packaging', label: 'بسته‌بندی' },
  { key: 'shipping', label: 'ارسال' },
  { key: 'delivered', label: 'تحویل' },
]

const statusIndexMap = { pending: 0, packaging: 1, shipping: 2, delivered: 3 }
const progressWidths = ['0%', '33.33%', '66.66%', '100%']

const progressWidth = computed(() => {
  if (!featuredOrder.value) return '0%'
  return progressWidths[statusIndexMap[featuredOrder.value.status]] ?? '0%'
})

const stepState = (i) => {
  if (!featuredOrder.value) return 'upcoming'
  if (featuredOrder.value.status === 'delivered') return 'done'
  const current = statusIndexMap[featuredOrder.value.status] ?? 0
  if (i < current) return 'done'
  if (i === current) return 'active'
  return 'upcoming'
}

const statusLabel = computed(() => {
  const labels = {
    pending: 'ثبت شده',
    packaging: 'در حال بسته‌بندی',
    shipping: 'در حال ارسال',
    delivered: 'تحویل شده',
  }
  return labels[featuredOrder.value?.status] ?? ''
})

const statusColor = computed(() => {
  const colors = {
    pending: 'info',
    packaging: 'warning',
    shipping: 'primary',
    delivered: 'success',
  }
  return colors[featuredOrder.value?.status] ?? 'neutral'
})
</script>
