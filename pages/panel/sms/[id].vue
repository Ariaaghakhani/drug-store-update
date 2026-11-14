<!-- pages/panel/sms/[id].vue -->
<template>
  <div class="space-y-5">
    <UButton to="/panel/sms" color="neutral" variant="outline" icon="i-heroicons-arrow-right">
      بازگشت به کمپین‌ها
    </UButton>

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="space-y-4">
          <USkeleton class="h-16 w-full rounded-xl" />
          <USkeleton class="h-24 w-full rounded-xl" />
          <USkeleton class="h-48 w-full rounded-xl" />
        </div>

        <PanelEmptyState
          v-else-if="forbidden"
          key="forbidden"
          variant="forbidden"
          title="دسترسی به این کمپین ندارید"
        />

        <PanelEmptyState
          v-else-if="notFound"
          key="not-found"
          icon="i-heroicons-chat-bubble-bottom-center-text"
          title="کمپین پیدا نشد"
          text="این کمپین وجود ندارد یا به فروشگاه دیگری تعلق دارد"
        >
          <template #action>
            <UButton to="/panel/sms" color="neutral" variant="soft" icon="i-heroicons-arrow-right">
              بازگشت به کمپین‌ها
            </UButton>
          </template>
        </PanelEmptyState>

        <PanelEmptyState v-else-if="!campaign" key="error" variant="error" title="دریافت کمپین ناموفق بود">
          <template #action>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="retryLoad">
              تلاش دوباره
            </UButton>
          </template>
        </PanelEmptyState>

        <div v-else key="content" class="space-y-4">
          <PanelPageHeader icon="i-heroicons-chat-bubble-bottom-center-text" title="کمپین" :accent="campaign.title">
            <template #actions>
              <UButton
                v-if="canRetry"
                color="neutral"
                variant="soft"
                size="lg"
                icon="i-heroicons-arrow-path"
                :loading="retrying"
                :disabled="acting"
                @click="showRetry = true"
              >
                ارسال دوباره‌ی ناموفق‌ها
              </UButton>
              <UButton
                v-if="active"
                color="error"
                variant="soft"
                size="lg"
                icon="i-heroicons-no-symbol"
                :disabled="acting"
                @click="showCancel = true"
              >
                لغو کمپین
              </UButton>
            </template>
          </PanelPageHeader>

          <!-- Summary -->
          <UCard>
            <div class="flex items-center gap-2 flex-wrap">
              <StatusBadge :meta="campaignStatusMeta(campaign.status)" />
              <UBadge color="neutral" variant="soft" size="xs">{{ kindLabel(campaign.kind) }}</UBadge>
              <UBadge color="neutral" variant="soft" size="xs">{{ audienceLabel(campaign.audience) }}</UBadge>
              <UBadge v-if="campaign.ownAccount" color="info" variant="soft" size="xs">حساب اختصاصی فروشگاه</UBadge>
            </div>

            <p
              v-if="active"
              class="flex items-center gap-1.5 text-xs mt-3"
              :class="pollNote ? 'text-warning' : 'text-gray-500 dark:text-gray-400'"
            >
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
              {{ pollNote || pollHint }}
            </p>

            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4 text-sm">
              <div v-if="campaign.createdBy">
                <dt class="text-xs text-gray-500 dark:text-gray-400">ساخته‌شده توسط</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5" dir="ltr">
                  <span class="font-mono">{{ campaign.createdBy }}</span>
                </dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">زمان ساخت</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ dateText(campaign.createdAt) }}</dd>
              </div>
              <div v-if="campaign.scheduledAt">
                <dt class="text-xs text-gray-500 dark:text-gray-400">زمان‌بندی ارسال</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ dateText(campaign.scheduledAt) }}</dd>
              </div>
              <div v-if="campaign.startedAt">
                <dt class="text-xs text-gray-500 dark:text-gray-400">شروع ارسال</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ dateText(campaign.startedAt) }}</dd>
              </div>
              <div v-if="campaign.finishedAt">
                <dt class="text-xs text-gray-500 dark:text-gray-400">پایان</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ dateText(campaign.finishedAt) }}</dd>
              </div>
              <div v-if="campaign.occasionDate">
                <dt class="text-xs text-gray-500 dark:text-gray-400">روز مناسبت</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ formatJalali(campaign.occasionDate) }}</dd>
              </div>
              <div v-if="campaign.parts">
                <dt class="text-xs text-gray-500 dark:text-gray-400">تعداد بخش هر پیامک</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ campaign.parts.toLocaleString('fa-IR') }}</dd>
              </div>
            </dl>

            <div class="mt-4">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1.5">متن کامل پیامک</p>
              <p
                class="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line leading-7"
              >
                {{ campaign.fullText }}
              </p>
            </div>
          </UCard>

          <!-- Counters -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <UCard v-for="tile in counters" :key="tile.key" :ui="{ body: 'p-4' }">
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ tile.label }}</p>
              <p class="text-xl font-black mt-1" :class="tile.class">{{ tile.value.toLocaleString('fa-IR') }}</p>
            </UCard>
          </div>

          <UCard :ui="{ body: 'p-4' }">
            <div class="flex items-center justify-between gap-3 text-xs text-gray-600 dark:text-gray-300 mb-2">
              <span>پیشرفت ارسال</span>
              <span>{{ progress.toLocaleString('fa-IR') }}٪</span>
            </div>
            <div class="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div class="h-full rounded-full bg-brand-500 dark:bg-brand-400" :style="{ width: `${progress}%` }" />
            </div>
          </UCard>

          <!-- Recipients -->
          <UCard :ui="{ body: 'p-0' }">
            <div
              class="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800"
            >
              <UIcon name="i-heroicons-users" class="w-4 h-4 text-brand-500 dark:text-brand-400" />
              <h2 class="text-sm font-medium text-gray-900 dark:text-white">گیرنده‌ها</h2>
              <USelect v-model="filters.status" :items="statusOptions" size="sm" class="w-40 ms-auto" />
            </div>

            <div class="relative">
              <Transition name="sk">
                <div
                  v-if="recipientsLoading && !recipients.length"
                  key="skeleton"
                  class="divide-y divide-gray-100 dark:divide-gray-800"
                >
                  <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
                    <div class="flex-1 space-y-2">
                      <USkeleton class="h-4 w-40" />
                      <USkeleton class="h-3 w-28" />
                    </div>
                    <USkeleton class="h-5 w-16 rounded-full" />
                  </div>
                </div>

                <PanelEmptyState
                  v-else-if="recipientsForbidden"
                  key="forbidden"
                  variant="forbidden"
                  title="دسترسی به گیرنده‌های کمپین ندارید"
                />

                <PanelEmptyState
                  v-else-if="recipientsError"
                  key="error"
                  variant="error"
                  title="دریافت گیرنده‌ها ناموفق بود"
                >
                  <template #action>
                    <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="reloadRecipients">
                      تلاش دوباره
                    </UButton>
                  </template>
                </PanelEmptyState>

                <div v-else-if="recipients.length" key="content">
                  <div class="overflow-x-auto">
                    <table class="w-full">
                      <thead>
                        <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                          <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">گیرنده</th>
                          <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">وضعیت</th>
                          <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">پاسخ سرویس پیامک</th>
                          <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">زمان ارسال</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="row in recipients"
                          :key="row.id"
                          class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                        >
                          <td class="px-6 py-3 align-top">
                            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ row.name || '—' }}</p>
                            <p dir="ltr" class="text-xs font-mono text-gray-500 dark:text-gray-400 text-end">{{ row.phone }}</p>
                          </td>
                          <td class="px-6 py-3 align-top">
                            <StatusBadge :meta="recipientStatusMeta(row.status)" />
                          </td>
                          <td class="px-6 py-3 align-top text-xs max-w-xs">
                            <p v-if="row.error" class="text-error break-words">{{ row.error }}</p>
                            <p v-else-if="row.providerStatus" class="text-gray-600 dark:text-gray-400 break-words">
                              {{ row.providerStatus }}
                            </p>
                            <span v-else class="text-gray-500 dark:text-gray-400">—</span>
                          </td>
                          <td class="px-6 py-3 align-top text-xs text-gray-600 dark:text-gray-400">
                            {{ dateText(row.sentAt) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div
                    v-if="recipientsTotalPages > 1"
                    class="flex justify-center py-4 border-t border-gray-100 dark:border-gray-800"
                  >
                    <UPagination
                      v-model:page="recipientsPage"
                      :total="recipientsTotal"
                      :items-per-page="RECIPIENT_PAGE_SIZE"
                    />
                  </div>
                </div>

                <PanelEmptyState
                  v-else
                  key="empty"
                  icon="i-heroicons-users"
                  title="گیرنده‌ای پیدا نشد"
                  text="با این فیلتر گیرنده‌ای در این کمپین نیست"
                />
              </Transition>
            </div>
          </UCard>
        </div>
      </Transition>
    </div>

    <PanelConfirmDialog
      v-model:open="showCancel"
      title="لغو کمپین"
      message="ارسال به گیرنده‌های باقی‌مانده متوقف می‌شود. پیامک‌هایی که تا حالا رفته‌اند برنمی‌گردند."
      confirm-label="لغو کمپین"
      confirm-color="error"
      :loading="cancelling"
      @confirm="cancelCampaign"
    />

    <!-- Re-sending costs quota or credit again, so it is confirmed first -->
    <PanelConfirmDialog
      v-model:open="showRetry"
      title="ارسال دوباره‌ی ناموفق‌ها"
      :message="retryMessage"
      confirm-label="ارسال دوباره"
      confirm-color="warning"
      :loading="retrying"
      @confirm="retryFailed"
    />
  </div>
</template>

<script setup>
// One SMS campaign (module SMS_CAMPAIGN): counters, full text, dates, a filterable recipients table, cancel and
// retry-failed. While the campaign is QUEUED or SENDING it is re-read every 15 s; the timer stops when the campaign
// finishes and when the page unmounts, and a failed poll shows a quiet note instead of a toast.
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import { apiErrorMessage, errorStatus } from '~/utils/apiError.js'
import { selectItems } from '~/utils/enumMeta.js'
import { formatJalali } from '~/utils/jalali.js'
import {
  SMS_RECIPIENT_STATUS_META,
  audienceLabel,
  campaignStatusMeta,
  isCampaignActive,
  kindLabel,
  percentOf,
  recipientStatusMeta,
} from '~/utils/smsMeta.js'

const POLL_MS = 15000
const RECIPIENT_PAGE_SIZE = 50
const pollHint = `وضعیت ارسال هر ${(POLL_MS / 1000).toLocaleString('fa-IR')} ثانیه خودکار به‌روز می‌شود`

const route = useRoute()
const app = useNuxtApp()
const toast = useAppToast()

const campaignId = route.params.id

const loading = ref(true)
const campaign = ref(null)
const loadErrorStatus = ref(null)

const notFound = computed(() => loadErrorStatus.value === 404)
const forbidden = computed(() => loadErrorStatus.value === 403)

const active = computed(() => isCampaignActive(campaign.value?.status))
const canRetry = computed(() => campaign.value && campaign.value.failedCount > 0 && campaign.value.status !== 'CANCELLED')

const dateText = (value) => formatJalali(value, { withTime: true }) || '—'

const counters = computed(() => {
  const dto = campaign.value
  if (!dto) return []
  return [
    { key: 'total', label: 'گیرنده‌ها', value: dto.recipientCount ?? 0, class: 'text-gray-900 dark:text-white' },
    { key: 'sent', label: 'ارسال شد', value: dto.sentCount ?? 0, class: 'text-success' },
    { key: 'failed', label: 'ناموفق', value: dto.failedCount ?? 0, class: 'text-error' },
    { key: 'pending', label: 'در انتظار', value: dto.pendingCount ?? 0, class: 'text-info' },
    { key: 'cancelled', label: 'لغو شده', value: dto.cancelledCount ?? 0, class: 'text-gray-500 dark:text-gray-400' },
  ]
})

// Share of recipients that are no longer waiting (sent, failed or cancelled)
const progress = computed(() => {
  const dto = campaign.value
  if (!dto) return 0
  return percentOf((dto.recipientCount ?? 0) - (dto.pendingCount ?? 0), dto.recipientCount)
})

// ---------- recipients ----------
const filters = reactive({ status: 'all' })
const statusOptions = selectItems(SMS_RECIPIENT_STATUS_META, 'همه وضعیت‌ها')

const {
  items: recipients,
  total: recipientsTotal,
  totalPages: recipientsTotalPages,
  page: recipientsPage,
  loading: recipientsLoading,
  error: recipientsError,
  forbidden: recipientsForbidden,
  reload: reloadRecipients,
} = usePagedList(
  ({ page, size }) => {
    const params = { page, size }
    if (filters.status !== 'all') params.status = filters.status
    return app.$api.crm.listCampaignRecipients(campaignId, { params })
  },
  { size: RECIPIENT_PAGE_SIZE, filters }
)

// ---------- campaign + polling ----------
const pollNote = ref('')
let pollTimer = null
let unmounted = false

const stopPolling = () => {
  clearTimeout(pollTimer)
  pollTimer = null
}

// One timer at most; none once the campaign is finished or the page is gone
const schedulePolling = () => {
  if (pollTimer || unmounted || !isCampaignActive(campaign.value?.status)) return
  pollTimer = setTimeout(poll, POLL_MS)
}

// Takes a fresh DTO. The recipients refresh only when a counter or the status moved, and keep their rows meanwhile.
const applyCampaign = (dto) => {
  const before = campaign.value
  const moved =
    before &&
    (before.status !== dto.status ||
      before.sentCount !== dto.sentCount ||
      before.failedCount !== dto.failedCount ||
      before.cancelledCount !== dto.cancelledCount)
  campaign.value = dto
  if (moved) reloadRecipients()
  if (isCampaignActive(dto.status)) schedulePolling()
  else stopPolling()
}

async function poll() {
  pollTimer = null
  if (unmounted) return
  try {
    const res = await app.$api.crm.getCampaign(campaignId)
    if (unmounted) return
    pollNote.value = ''
    if (res.data.data) applyCampaign(res.data.data)
  } catch (e) {
    if (unmounted) return
    const status = errorStatus(e)
    // Gone or no longer allowed: retrying cannot help
    if (status === 403 || status === 404) {
      pollNote.value = 'به‌روزرسانی خودکار متوقف شد؛ صفحه را دوباره باز کنید'
      return
    }
    pollNote.value = 'به‌روزرسانی خودکار ناموفق بود؛ دوباره تلاش می‌شود'
  }
  schedulePolling()
}

async function fetchCampaign() {
  try {
    const res = await app.$api.crm.getCampaign(campaignId)
    const dto = res.data.data ?? null
    loadErrorStatus.value = dto ? null : 404
    if (dto) applyCampaign(dto)
    else campaign.value = null
  } catch (e) {
    campaign.value = null
    loadErrorStatus.value = errorStatus(e) ?? 0
  } finally {
    loading.value = false
  }
}

const retryLoad = () => {
  loading.value = true
  fetchCampaign()
}

onMounted(fetchCampaign)

onBeforeUnmount(() => {
  unmounted = true
  stopPolling()
})

// ---------- actions ----------
const showCancel = ref(false)
const cancelling = ref(false)
const retrying = ref(false)
const showRetry = ref(false)
const retryMessage = computed(
  () =>
    `پیامک برای ${(campaign.value?.failedCount ?? 0).toLocaleString('fa-IR')} گیرنده‌ی ناموفق دوباره در صف ارسال می‌رود و از سهمیه یا اعتبار پیامک کم می‌شود.`
)
const acting = computed(() => cancelling.value || retrying.value)

async function cancelCampaign() {
  if (acting.value) return
  cancelling.value = true
  try {
    const res = await app.$api.crm.cancelCampaign(campaignId)
    showCancel.value = false
    toast.success('کمپین لغو شد')
    if (res.data.data) applyCampaign(res.data.data)
  } catch (e) {
    // 409: the campaign already finished. Show BACK's reason and read the current state
    showCancel.value = false
    toast.error(apiErrorMessage(e, 'لغو کمپین ناموفق بود'))
    await refreshQuietly()
  } finally {
    cancelling.value = false
  }
}

async function retryFailed() {
  if (acting.value) return
  retrying.value = true
  try {
    const res = await app.$api.crm.retryCampaignFailed(campaignId)
    showRetry.value = false
    toast.success('گیرنده‌های ناموفق دوباره در صف ارسال قرار گرفتند')
    // A finished campaign becomes QUEUED again, so this also restarts the polling
    if (res.data.data) applyCampaign(res.data.data)
    reloadRecipients()
  } catch (e) {
    showRetry.value = false
    toast.error(apiErrorMessage(e, 'ارسال دوباره‌ی ناموفق‌ها ناموفق بود'))
    await refreshQuietly()
  } finally {
    retrying.value = false
  }
}

// Re-reads the campaign after a refused action, without any loading state or second toast
async function refreshQuietly() {
  try {
    const res = await app.$api.crm.getCampaign(campaignId)
    if (res.data.data) applyCampaign(res.data.data)
  } catch {
    // the failed action already showed its message
  }
}

useHead({ title: 'جزئیات کمپین پیامک | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
