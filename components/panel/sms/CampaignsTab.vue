<!-- components/panel/sms/CampaignsTab.vue -->
<template>
  <div class="space-y-4">
    <!-- Monthly usage -->
    <div class="relative">
      <Transition name="sk">
        <USkeleton v-if="usageLoading" key="skeleton" class="h-24 w-full rounded-xl" />

        <UCard v-else-if="usage" key="usage" :ui="{ body: 'p-4' }">
          <div class="flex items-center gap-3 flex-wrap">
            <div class="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-brand-500 dark:text-brand-400" />
            </div>
            <div class="min-w-0">
              <h2 class="text-sm font-bold text-gray-900 dark:text-white">سهمیه‌ی پیامک این ماه</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">ماه {{ smsPeriodText(usage.period) }}</p>
            </div>
            <StatusBadge v-if="usage.unlimited" class="ms-auto" :meta="{ label: 'نامحدود', color: 'success' }" />
          </div>

          <p v-if="usage.unlimited" class="text-sm text-gray-600 dark:text-gray-300 mt-3 leading-6">
            حساب کاوه‌نگار خودتان در حال استفاده است؛ کمپین‌ها سقف ماهانه ندارند و هزینه‌ی آن‌ها با حساب شماست.
          </p>

          <UAlert
            v-else-if="usage.monthlyQuota === 0"
            class="mt-3"
            color="warning"
            variant="soft"
            icon="i-heroicons-exclamation-triangle"
            title="کمپین پیامک برای این فروشگاه فعال نیست"
            description="سهمیه‌ی ماهانه تعیین نشده است. برای فعال‌سازی با پشتیبانی پلتفرم تماس بگیرید."
          />

          <div v-else class="mt-3 space-y-2">
            <div class="flex items-center justify-between gap-3 text-xs text-gray-600 dark:text-gray-300">
              <span>
                {{ usage.used.toLocaleString('fa-IR') }} از {{ usage.monthlyQuota.toLocaleString('fa-IR') }} پیامک مصرف شده
              </span>
              <span>{{ usage.remaining.toLocaleString('fa-IR') }} پیامک مانده</span>
            </div>
            <div class="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                class="h-full rounded-full"
                :class="usedPercent >= 90 ? 'bg-warning dark:bg-warning/80' : 'bg-brand-500 dark:bg-brand-400'"
                :style="{ width: `${usedPercent}%` }"
              />
            </div>
          </div>

          <UAlert
            v-if="usage.ownAccountProblem"
            class="mt-3"
            color="warning"
            variant="soft"
            icon="i-heroicons-exclamation-triangle"
            title="مشکل در حساب پیامک اختصاصی"
            :description="usage.ownAccountProblem"
          />

          <p v-if="usage.ownAccountAllowed && !usage.unlimited" class="text-xs text-gray-500 dark:text-gray-400 mt-3">
            می‌توانید حساب کاوه‌نگار خودتان را ثبت کنید تا سقف ماهانه نداشته باشید:
            <NuxtLink
              to="/panel/sms?tab=account"
              class="text-brand-600 dark:text-brand-400 hover:underline underline-offset-2"
            >
              حساب پیامک
            </NuxtLink>
          </p>
        </UCard>

        <div
          v-else-if="usageFailed"
          key="usage-error"
          class="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3"
        >
          <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-gray-400 dark:text-gray-500" />
          <p class="text-sm text-gray-600 dark:text-gray-300">دریافت سهمیه‌ی پیامک ناموفق بود</p>
          <UButton class="ms-auto" color="neutral" variant="soft" size="sm" icon="i-heroicons-arrow-path" @click="loadUsage">
            تلاش دوباره
          </UButton>
        </div>
      </Transition>
    </div>

    <!-- Campaign list -->
    <UCard :ui="{ body: 'p-0' }">
      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-48" />
                <USkeleton class="h-3 w-32" />
              </div>
              <USkeleton class="h-5 w-20 rounded-full" />
              <USkeleton class="h-2 w-28 rounded-full" />
            </div>
          </div>

          <PanelEmptyState
            v-else-if="forbidden"
            key="forbidden"
            variant="forbidden"
            title="دسترسی به کمپین‌های پیامک ندارید"
          />

          <PanelEmptyState
            v-else-if="error"
            key="error"
            variant="error"
            title="دریافت کمپین‌ها ناموفق بود"
          >
            <template #action>
              <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="reload">
                تلاش دوباره
              </UButton>
            </template>
          </PanelEmptyState>

          <div v-else-if="items.length" key="content">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">کمپین</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">وضعیت</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">ارسال</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">ناموفق</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">زمان</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in items"
                    :key="row.id"
                    class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td class="px-6 py-3 align-top">
                      <NuxtLink
                        :to="`/panel/sms/${row.id}`"
                        class="text-sm font-semibold text-gray-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400"
                      >
                        {{ row.title }}
                      </NuxtLink>
                      <div class="flex items-center gap-1.5 flex-wrap mt-1">
                        <UBadge color="neutral" variant="soft" size="xs">{{ kindLabel(row.kind) }}</UBadge>
                        <UBadge color="neutral" variant="soft" size="xs">{{ audienceLabel(row.audience) }}</UBadge>
                        <UBadge v-if="row.ownAccount" color="info" variant="soft" size="xs">حساب اختصاصی</UBadge>
                      </div>
                    </td>
                    <td class="px-6 py-3 align-top">
                      <StatusBadge :meta="campaignStatusMeta(row.status)" />
                    </td>
                    <td class="px-6 py-3 align-top">
                      <div class="flex items-center gap-2">
                        <div class="h-1.5 w-24 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div
                            class="h-full rounded-full bg-brand-500 dark:bg-brand-400"
                            :style="{ width: `${percentOf(row.sentCount, row.recipientCount)}%` }"
                          />
                        </div>
                        <span class="text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          {{ (row.sentCount ?? 0).toLocaleString('fa-IR') }} از
                          {{ (row.recipientCount ?? 0).toLocaleString('fa-IR') }}
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-3 align-top text-sm">
                      <span
                        v-if="row.failedCount > 0"
                        class="font-medium text-error"
                      >
                        {{ row.failedCount.toLocaleString('fa-IR') }}
                      </span>
                      <span v-else class="text-gray-500 dark:text-gray-400">—</span>
                    </td>
                    <td class="px-6 py-3 align-top text-xs text-gray-600 dark:text-gray-400">
                      <template v-if="row.status === 'QUEUED' && row.scheduledAt">
                        زمان‌بندی: {{ formatJalali(row.scheduledAt, { withTime: true }) }}
                      </template>
                      <template v-else>{{ formatJalali(row.createdAt, { withTime: true }) || '—' }}</template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="totalPages > 1" class="flex justify-center py-4 border-t border-gray-100 dark:border-gray-800">
              <UPagination v-model:page="page" :total="total" :items-per-page="PAGE_SIZE" />
            </div>
          </div>

          <PanelEmptyState
            v-else
            key="empty"
            icon="i-heroicons-chat-bubble-bottom-center-text"
            title="هنوز کمپینی نساخته‌اید"
            text="با یک کمپین پیامک، خبر تخفیف یا تبریک را برای مشتریان باشگاه بفرستید"
          >
            <template #action>
              <UButton to="/panel/sms/new" color="neutral" variant="soft" icon="i-heroicons-plus">
                کمپین جدید
              </UButton>
            </template>
          </PanelEmptyState>
        </Transition>
      </div>
    </UCard>
  </div>
</template>

<script setup>
// «کمپین‌ها» tab of /panel/sms (module SMS_CAMPAIGN): this month's quota card and the campaign list (newest first,
// 0-based BACK paging behind a 1-based UPagination). The «کمپین جدید» button lives in the page header.
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import { formatJalali } from '~/utils/jalali.js'
import {
  audienceLabel,
  campaignStatusMeta,
  kindLabel,
  percentOf,
  smsPeriodText,
} from '~/utils/smsMeta.js'

const PAGE_SIZE = 20

const app = useNuxtApp()

const { items, total, totalPages, page, loading, error, forbidden, reload } = usePagedList(
  ({ page: backendPage, size }) => app.$api.crm.listCampaigns({ params: { page: backendPage, size } }),
  { size: PAGE_SIZE }
)

// The quota card loads on its own: a failed quota call must not hide the campaigns
const usage = ref(null)
const usageLoading = ref(true)
const usageFailed = ref(false)

const usedPercent = computed(() => percentOf(usage.value?.used, usage.value?.monthlyQuota))

const loadUsage = async () => {
  usageLoading.value = true
  usageFailed.value = false
  try {
    const res = await app.$api.crm.getCampaignUsage()
    usage.value = res.data.data ?? null
    usageFailed.value = !usage.value
  } catch (e) {
    usage.value = null
    // A 403 is already shown by the list below; anything else gets a retry row
    usageFailed.value = e?.response?.status !== 403
  } finally {
    usageLoading.value = false
  }
}

onMounted(loadUsage)
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
