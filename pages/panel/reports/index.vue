<!-- pages/panel/reports/index.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader
      icon="i-heroicons-chart-bar"
      title="گزارش‌های"
      accent="فروشگاه"
      subtitle="گزارشی را انتخاب کنید و پارامترهایش را وارد کنید"
    />

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="i in 6"
            :key="i"
            class="space-y-3 rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-800"
          >
            <USkeleton class="h-10 w-10 rounded-xl" />
            <USkeleton class="h-4 w-40" />
            <USkeleton class="h-3 w-24" />
          </div>
        </div>

        <PanelEmptyState
          v-else-if="forbidden"
          key="forbidden"
          variant="forbidden"
          title="دسترسی به گزارش‌ها ندارید"
        />

        <PanelEmptyState
          v-else-if="error"
          key="error"
          variant="error"
          title="دریافت گزارش‌ها ناموفق بود"
        >
          <template #action>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
              تلاش دوباره
            </UButton>
          </template>
        </PanelEmptyState>

        <div v-else-if="reports.length" key="content" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            v-for="report in reports"
            :key="report.code"
            type="button"
            class="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 text-start transition-colors hover:border-brand-300 hover:bg-brand-50/50 dark:border-gray-800 dark:bg-gray-800 dark:hover:border-brand-700 dark:hover:bg-brand-900/10"
            @click="openReport(report)"
          >
            <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/20">
              <UIcon :name="chartIcon(report.chartType)" class="h-5 w-5 text-brand-500 dark:text-brand-400" />
            </div>
            <div class="min-w-0 flex-1 space-y-1.5">
              <p class="text-sm font-bold text-gray-900 dark:text-white">{{ report.title || report.code }}</p>
              <p dir="ltr" class="truncate text-start font-mono text-xs text-gray-500 dark:text-gray-400">{{ report.code }}</p>
              <div class="flex flex-wrap items-center gap-1.5">
                <UBadge v-if="report.reportType === 'DASHBOARD'" color="info" variant="subtle" size="xs">داشبورد</UBadge>
                <UBadge color="neutral" variant="subtle" size="xs">{{ paramCountText(report) }}</UBadge>
                <UBadge v-if="report.hasTemplate" color="neutral" variant="subtle" size="xs">PDF</UBadge>
              </div>
            </div>
          </button>
        </div>

        <PanelEmptyState
          v-else
          key="empty"
          icon="i-heroicons-chart-bar"
          title="گزارشی در دسترس نیست"
          text="برای نقش شما گزارشی تعریف نشده است"
        />
      </Transition>
    </div>

    <ReportRunModal v-model:open="modalOpen" :report="selected" />
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import ReportRunModal from '@/components/panel/reports/ReportRunModal.vue'

// «گزارش‌ها» (module REPORT): the reports the user's roles may run, from POST api/report/all (a plain list, not paged).
// A card opens ReportRunModal, which asks for the parameters and shows the table or downloads the file.
const app = useNuxtApp()

const CHART_ICONS = {
  BAR: 'i-heroicons-chart-bar',
  LINE: 'i-heroicons-presentation-chart-line',
  PIE: 'i-heroicons-chart-pie',
  AREA: 'i-heroicons-presentation-chart-line',
  TABLE: 'i-heroicons-table-cells',
}
const chartIcon = (chartType) => CHART_ICONS[chartType] || 'i-heroicons-document-chart-bar'

const paramCountText = (report) => {
  const count = Object.keys(report.parameters ?? {}).length
  return count ? `${count.toLocaleString('fa-IR')} پارامتر` : 'بدون پارامتر'
}

const reports = ref([])
const loading = ref(true)
const error = ref(null)
const forbidden = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await app.$api.reports.listReports()
    reports.value = res?.data?.data ?? []
    error.value = null
    forbidden.value = false
  } catch (e) {
    reports.value = []
    error.value = e
    forbidden.value = e?.response?.status === 403
  } finally {
    loading.value = false
  }
}

// Client-side only: onMounted never runs during SSR
onMounted(load)

const selected = ref(null)
const modalOpen = ref(false)
const openReport = (report) => {
  selected.value = report
  modalOpen.value = true
}

useHead({ title: 'گزارش‌ها | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
