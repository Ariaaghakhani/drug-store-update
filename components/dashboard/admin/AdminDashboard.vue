<template>
  <div class="space-y-4">
    <UCard :ui="{ body: 'p-5' }">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-100 dark:bg-brand-900/20">
          <UIcon
            name="i-heroicons-squares-2x2"
            class="w-5 h-5 text-brand-500 dark:text-brand-400"
          />
        </div>
        <div>
          <h1 class="text-lg font-black text-gray-900 dark:text-white">
            داشبورد <span class="text-brand-500">مدیر</span>
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            خلاصه وضعیت کلی فروشگاه
          </p>
        </div>
      </div>
    </UCard>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <UCard v-for="stat in summaryStats" :key="stat.key" :ui="{ body: 'p-4 sm:p-5' }">
        <div class="relative">
          <Transition name="sk">
            <div v-if="!summaryPending" key="content" class="flex items-center gap-3">
              <div
                :class="[
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  stat.bg,
                ]"
              >
                <UIcon :name="stat.icon" :class="['w-5 h-5', stat.iconColor]" />
              </div>
              <div class="min-w-0">
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ stat.label }}
                </p>
                <p class="text-sm font-black text-gray-900 dark:text-white mt-0.5 truncate">
                  {{ stat.value }}
                </p>
              </div>
            </div>
            <div v-else key="loading" class="flex items-center gap-3">
              <USkeleton class="w-10 h-10 rounded-lg flex-shrink-0" />
              <div class="space-y-2 flex-1">
                <USkeleton class="h-3 w-16" />
                <USkeleton class="h-4 w-14" />
              </div>
            </div>
          </Transition>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <UCard :ui="{ body: 'p-0' }">
        <div class="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-4 h-4 text-brand-500 dark:text-brand-400"
          />
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            کالاهای به نقطه سفارش رسیده
          </span>
        </div>
        <div class="px-5 py-5">
          <div class="relative">
            <Transition name="sk">
              <div v-if="lowStockPending" key="loading" class="space-y-3">
                <USkeleton v-for="i in 4" :key="i" class="h-14 w-full rounded-lg" />
              </div>

              <div
                v-else-if="!lowStock || lowStock.length === 0"
                key="empty"
                class="flex flex-col items-center py-10 gap-3"
              >
                <UIcon
                  name="i-heroicons-check-circle"
                  class="w-12 h-12 text-gray-300 dark:text-gray-600"
                />
                <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
                  کالایی به نقطه سفارش نرسیده است
                </p>
              </div>

              <div v-else key="content" class="divide-y divide-gray-100 dark:divide-gray-800">
                <div
                  v-for="row in lowStock.slice(0, 6)"
                  :key="`${row.goodCode}-${row.warehouseName}`"
                  class="flex items-center justify-between gap-3 py-3"
                >
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {{ row.nameFa }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {{ row.warehouseName }}
                    </p>
                  </div>
                  <UBadge color="error" variant="soft" size="xs" class="flex-shrink-0">
                    {{ formatCount(row.available) }} / {{ formatCount(row.reorderPoint) }}
                  </UBadge>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-0' }">
        <div class="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <UIcon
            name="i-heroicons-clock"
            class="w-4 h-4 text-brand-500 dark:text-brand-400"
          />
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            کالاهای نزدیک به تاریخ انقضا
          </span>
        </div>
        <div class="px-5 py-5">
          <div class="relative">
            <Transition name="sk">
              <div v-if="expiringGoodsPending" key="loading" class="space-y-3">
                <USkeleton v-for="i in 4" :key="i" class="h-14 w-full rounded-lg" />
              </div>

              <div
                v-else-if="!expiringGoods || expiringGoods.length === 0"
                key="empty"
                class="flex flex-col items-center py-10 gap-3"
              >
                <UIcon
                  name="i-heroicons-check-circle"
                  class="w-12 h-12 text-gray-300 dark:text-gray-600"
                />
                <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
                  کالایی نزدیک به تاریخ انقضا نیست
                </p>
              </div>

              <div v-else key="content" class="divide-y divide-gray-100 dark:divide-gray-800">
                <div
                  v-for="row in expiringGoods.slice(0, 6)"
                  :key="`${row.goodCode}-${row.batchNumber ?? 'no-batch'}`"
                  class="flex items-center justify-between gap-3 py-3"
                >
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {{ row.nameFa }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {{ toPersianDigits(row.expiryDate) }} · {{ formatCount(row.quantity) }} عدد
                    </p>
                  </div>
                  <UBadge :color="row.expired ? 'error' : 'warning'" variant="soft" size="xs" class="flex-shrink-0">
                    {{ row.expired ? 'منقضی شده' : 'نزدیک به انقضا' }}
                  </UBadge>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-100 dark:bg-amber-900/20">
            <UIcon name="i-heroicons-shopping-bag" class="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">صف سفارشات</p>
            <p class="text-sm text-gray-400 dark:text-gray-600 font-medium">TODO</p>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/20">
            <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">بررسی نسخه</p>
            <p class="text-sm text-gray-400 dark:text-gray-600 font-medium">TODO</p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { useAdminDashboard } from '@/composables/useAdminDashboard'
import { useFormat } from '@/composables/useFormat'

const { summary, summaryPending, lowStock, lowStockPending, expiringGoods, expiringGoodsPending } =
  useAdminDashboard()

const { formatCount, formatPrice } = useFormat()

const toPersianDigits = (value) => {
  if (value === null || value === undefined) return ''
  const map = { 0: '۰', 1: '۱', 2: '۲', 3: '۳', 4: '۴', 5: '۵', 6: '۶', 7: '۷', 8: '۸', 9: '۹' }
  return String(value).replace(/[0-9]/g, (d) => map[d])
}

const summaryStats = computed(() => [
  {
    key: 'totalUsers',
    label: 'تعداد کاربران',
    value: formatCount(summary.value?.totalUsers ?? 0),
    icon: 'i-heroicons-users',
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    key: 'totalGoods',
    label: 'کالاهای فعال',
    value: formatCount(summary.value?.totalGoods ?? 0),
    icon: 'i-heroicons-cube',
    bg: 'bg-brand-100 dark:bg-brand-900/20',
    iconColor: 'text-brand-500 dark:text-brand-400',
  },
  {
    key: 'stockValueAtPurchasePrice',
    label: 'ارزش موجودی (خرید)',
    value: formatPrice(summary.value?.stockValueAtPurchasePrice ?? 0),
    icon: 'i-heroicons-banknotes',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'stockValueAtSalePrice',
    label: 'ارزش موجودی (فروش)',
    value: formatPrice(summary.value?.stockValueAtSalePrice ?? 0),
    icon: 'i-heroicons-banknotes',
    bg: 'bg-green-100 dark:bg-green-900/20',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    key: 'lowStockCount',
    label: 'به نقطه سفارش رسیده',
    value: formatCount(summary.value?.lowStockCount ?? 0),
    icon: 'i-heroicons-exclamation-triangle',
    bg: 'bg-red-100 dark:bg-red-900/20',
    iconColor: 'text-red-600 dark:text-red-400',
  },
])
</script>
