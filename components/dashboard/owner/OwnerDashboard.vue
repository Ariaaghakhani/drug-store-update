<template>
  <div class="space-y-4">
    <UCard :ui="{ body: 'p-5' }">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-100 dark:bg-brand-900/20">
          <UIcon
            name="i-heroicons-chart-pie"
            class="w-5 h-5 text-brand-500 dark:text-brand-400"
          />
        </div>
        <div>
          <h1 class="text-lg font-black text-gray-900 dark:text-white">
            داشبورد <span class="text-brand-500">مالک</span>
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            وضعیت کاربران و دسته‌بندی کالاها
          </p>
        </div>
      </div>
    </UCard>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <UCard :ui="{ body: 'p-0' }">
        <div class="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <UIcon name="i-heroicons-chart-bar" class="w-4 h-4 text-brand-500 dark:text-brand-400" />
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            وضعیت کاربران (فعال / غیرفعال)
          </span>
        </div>
        <div class="px-5 py-5">
          <div class="relative">
            <Transition name="sk">
              <div v-if="userActivityChartPending" key="loading" class="space-y-3">
                <USkeleton v-for="i in 3" :key="i" class="h-8 w-full rounded-lg" />
              </div>

              <div
                v-else-if="userActivityBars.length === 0"
                key="empty"
                class="flex flex-col items-center py-10 gap-3"
              >
                <UIcon
                  name="i-heroicons-chart-bar"
                  class="w-12 h-12 text-gray-300 dark:text-gray-600"
                />
                <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
                  داده‌ای برای نمایش وجود ندارد
                </p>
              </div>

              <div v-else key="content" class="space-y-4">
                <div v-for="bar in userActivityBars" :key="bar.label" class="space-y-1.5">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ bar.label }}</span>
                    <span class="text-sm font-bold text-gray-900 dark:text-white">
                      {{ formatCount(bar.value) }}
                    </span>
                  </div>
                  <div class="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      class="h-full rounded-full bg-brand-500"
                      :style="{ width: barWidth(bar.value) }"
                    />
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-0' }">
        <div class="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4 text-brand-500 dark:text-brand-400" />
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            تعداد کالاها بر اساس دسته‌بندی
          </span>
        </div>
        <div class="px-5 py-5">
          <div class="relative">
            <Transition name="sk">
              <div v-if="categoryChartPending" key="loading" class="space-y-3">
                <USkeleton v-for="i in 4" :key="i" class="h-8 w-full rounded-lg" />
              </div>

              <div
                v-else-if="categoryBars.length === 0"
                key="empty"
                class="flex flex-col items-center py-10 gap-3"
              >
                <UIcon
                  name="i-heroicons-squares-2x2"
                  class="w-12 h-12 text-gray-300 dark:text-gray-600"
                />
                <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
                  داده‌ای برای نمایش وجود ندارد
                </p>
              </div>

              <div v-else key="content" class="space-y-4">
                <div v-for="bar in categoryBars.slice(0, 6)" :key="bar.id" class="space-y-1.5">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-sm text-gray-700 dark:text-gray-300 truncate">{{ bar.label }}</span>
                    <span class="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">
                      {{ formatCount(bar.value) }}
                    </span>
                  </div>
                  <div class="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      class="h-full rounded-full bg-brand-500"
                      :style="{ width: categoryBarWidth(bar.value) }"
                    />
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-success/10">
            <UIcon name="i-heroicons-banknotes" class="w-5 h-5 text-success" />
          </div>
          <div class="min-w-0">
            <p class="text-xs text-gray-500 dark:text-gray-400">درآمد این ماه</p>
            <USkeleton v-if="revenueSummaryPending" class="h-5 w-20 mt-1" />
            <template v-else>
              <p class="text-sm font-bold text-gray-900 dark:text-white">
                {{ formatPrice(revenueSummary?.periodRevenue ?? 0) }}
              </p>
              <p
                v-if="revenueSummary?.revenueGrowthPercent !== null && revenueSummary?.revenueGrowthPercent !== undefined"
                class="text-xs mt-0.5"
                :class="revenueSummary.revenueGrowthPercent >= 0 ? 'text-success' : 'text-error'"
              >
                {{ revenueSummary.revenueGrowthPercent >= 0 ? '+' : '' }}{{ revenueSummary.revenueGrowthPercent.toLocaleString('fa-IR') }}٪ نسبت به ماه قبل
              </p>
            </template>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-info/10">
            <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-info" />
          </div>
          <div class="min-w-0">
            <p class="text-xs text-gray-500 dark:text-gray-400">فروش ۳۰ روز اخیر</p>
            <USkeleton v-if="salesTrendChartPending" class="h-5 w-20 mt-1" />
            <p v-else class="text-sm font-bold text-gray-900 dark:text-white">
              {{ formatPrice(salesTrendTotal) }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-brand-100 dark:bg-brand-900/20">
            <UIcon name="i-heroicons-cube" class="w-5 h-5 text-brand-500 dark:text-brand-400" />
          </div>
          <div class="min-w-0">
            <p class="text-xs text-gray-500 dark:text-gray-400">پرفروش‌ترین</p>
            <USkeleton v-if="topProductsPending" class="h-5 w-20 mt-1" />
            <template v-else-if="topProduct">
              <p class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ topProduct.nameFa }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ formatCount(topProduct.unitsSold) }} عدد</p>
            </template>
            <p v-else class="text-sm text-gray-400 dark:text-gray-600 font-medium">داده‌ای وجود ندارد</p>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/20">
            <UIcon name="i-heroicons-users" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div class="min-w-0">
            <p class="text-xs text-gray-500 dark:text-gray-400">فعال‌ترین کارمند</p>
            <USkeleton v-if="staffActivityPending" class="h-5 w-20 mt-1" />
            <template v-else-if="topStaff">
              <p class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ topStaff.fullName }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ formatCount(topStaff.actionCount) }} فعالیت</p>
            </template>
            <p v-else class="text-sm text-gray-400 dark:text-gray-600 font-medium">داده‌ای وجود ندارد</p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { useOwnerDashboard } from '@/composables/useOwnerDashboard'
import { useFormat } from '@/composables/useFormat'

const {
  userActivityChart,
  userActivityChartPending,
  categoryChart,
  categoryChartPending,
  revenueSummary,
  revenueSummaryPending,
  salesTrendChart,
  salesTrendChartPending,
  topProducts,
  topProductsPending,
  staffActivity,
  staffActivityPending,
} = useOwnerDashboard()

const { formatCount, formatPrice } = useFormat()

const salesTrendTotal = computed(() =>
  (salesTrendChart.value?.values ?? []).reduce((sum, v) => sum + Number(v ?? 0), 0)
)

const topProduct = computed(() => topProducts.value?.[0] ?? null)
const topStaff = computed(() => staffActivity.value?.[0] ?? null)

const userActivityBars = computed(() => {
  const labels = userActivityChart.value?.labels ?? []
  const values = userActivityChart.value?.values ?? []
  return labels.map((label, i) => ({ label, value: values[i] ?? 0 }))
})

const categoryBars = computed(() => {
  const ids = categoryChart.value?.categoryIds ?? []
  const labels = categoryChart.value?.categories ?? []
  const values = categoryChart.value?.counts ?? []
  return labels.map((label, i) => ({ id: ids[i] ?? label, label, value: values[i] ?? 0 }))
})

const maxUserActivity = computed(() =>
  Math.max(1, ...userActivityBars.value.map((bar) => bar.value))
)

const maxCategory = computed(() =>
  Math.max(1, ...categoryBars.value.map((bar) => bar.value))
)

const barWidth = (value) => `${Math.round((value / maxUserActivity.value) * 100)}%`
const categoryBarWidth = (value) => `${Math.round((value / maxCategory.value) * 100)}%`
</script>
