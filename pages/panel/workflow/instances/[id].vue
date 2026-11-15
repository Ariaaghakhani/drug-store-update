<!-- pages/panel/workflow/instances/[id].vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader icon="i-heroicons-arrow-path-rounded-square" title="جزئیات" accent="اجرا">
      <template #actions>
        <UButton to="/panel/workflow/instances" color="neutral" variant="outline" icon="i-heroicons-arrow-right">
          بازگشت به اجراها
        </UButton>
      </template>
    </PanelPageHeader>

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="space-y-4">
          <USkeleton class="h-40 w-full rounded-xl" />
          <USkeleton class="h-28 w-full rounded-xl" />
          <USkeleton class="h-24 w-3/4 rounded-xl" />
        </div>

        <PanelEmptyState
          v-else-if="forbidden"
          key="forbidden"
          variant="forbidden"
          title="گردش کار در دسترس نیست"
          text="یا دسترسی ندارید یا گردش کار برای این فروشگاه روشن نیست"
        />

        <PanelEmptyState
          v-else-if="notFound"
          key="not-found"
          icon="i-heroicons-arrow-path-rounded-square"
          title="این اجرا پیدا نشد"
        >
          <template #action>
            <UButton to="/panel/workflow/instances" color="neutral" variant="outline" icon="i-heroicons-arrow-right">
              بازگشت به اجراها
            </UButton>
          </template>
        </PanelEmptyState>

        <PanelEmptyState v-else-if="!detail" key="error" variant="error" title="دریافت اجرا ناموفق بود">
          <template #action>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="retryLoad">
              تلاش دوباره
            </UButton>
          </template>
        </PanelEmptyState>

        <div v-else key="content" class="space-y-4">
          <!-- ===== Header: the run itself ===== -->
          <UCard>
            <div class="flex items-start justify-between gap-3 flex-wrap">
              <div class="min-w-0 space-y-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <h2 class="text-base font-bold text-gray-900 dark:text-white">
                    اجرای #{{ instance.id.toLocaleString('fa-IR') }}
                    <span class="text-gray-500 dark:text-gray-400 font-normal">· {{ instance.definitionTitle || '—' }}</span>
                  </h2>
                  <StatusBadge :meta="metaOf(INSTANCE_STATUS_META, instance.status)" />
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ subjectTitle(instance.subject) }}
                  <template v-if="recordLink">
                    ·
                    <NuxtLink
                      :to="recordLink"
                      class="text-brand-500 dark:text-brand-400 hover:underline underline-offset-2"
                    >
                      مشاهده {{ subjectTitle(instance.subject) }} #{{ entityIdLabel(instance.entityId) }}
                    </NuxtLink>
                  </template>
                  <template v-else>
                    <span :dir="entityIdDir(instance.entityId)">#{{ entityIdLabel(instance.entityId) }}</span>
                  </template>
                </p>
              </div>
              <UButton
                v-if="running && canMonitor"
                color="error"
                variant="outline"
                icon="i-heroicons-no-symbol"
                :disabled="Boolean(busy)"
                @click="showCancel = true"
              >
                لغو اجرا
              </UButton>
            </div>

            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4 text-sm">
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">فرایند</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">
                  {{ instance.definitionTitle || '—' }}
                  <span v-if="instance.definitionVersion" class="text-xs text-gray-500 dark:text-gray-400">
                    · نسخه {{ instance.definitionVersion.toLocaleString('fa-IR') }}
                  </span>
                </dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">اقدام</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ actionTitle(instance.subject, instance.action) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">ثبت‌کننده‌ی درخواست</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">
                  <template v-if="instance.startedByName">{{ instance.startedByName }}</template>
                  <span v-else-if="instance.startedBy" dir="ltr">{{ instance.startedBy }}</span>
                  <template v-else>سیستم</template>
                </dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">شروع</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">
                  {{ formatJalali(instance.startedAt, { withTime: true }) || '—' }}
                </dd>
              </div>
              <div v-if="instance.endedAt">
                <dt class="text-xs text-gray-500 dark:text-gray-400">پایان</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ formatJalali(instance.endedAt, { withTime: true }) }}</dd>
              </div>
              <div v-if="instance.endReason" class="sm:col-span-2">
                <dt class="text-xs text-gray-500 dark:text-gray-400">علت پایان</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5 whitespace-pre-line">{{ instance.endReason }}</dd>
              </div>
              <div v-if="instance.activeSteps?.length" class="sm:col-span-2">
                <dt class="text-xs text-gray-500 dark:text-gray-400">مرحله‌های فعال</dt>
                <dd class="flex items-center gap-1.5 flex-wrap mt-1">
                  <UBadge v-for="step in instance.activeSteps" :key="step" color="info" variant="subtle" size="xs">
                    {{ step }}
                  </UBadge>
                </dd>
              </div>
            </dl>
          </UCard>

          <!-- ===== Open tasks (one per step; several on an «all approvers» step) ===== -->
          <UCard v-if="openTasks.length">
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">کارهای باز</h4>
            <ul class="divide-y divide-gray-100 dark:divide-gray-800">
              <li v-for="task in openTasks" :key="task.taskId" class="py-3 first:pt-0 last:pb-0">
                <div class="flex items-start justify-between gap-3 flex-wrap">
                  <div class="min-w-0 space-y-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ task.stepTitle }}</span>
                      <UBadge :color="task.status === 'CLAIMED' ? 'info' : 'neutral'" variant="subtle" size="xs">
                        {{ task.status === 'CLAIMED' ? 'برداشته‌شده' : 'برداشته‌نشده' }}
                      </UBadge>
                      <UBadge v-if="task.overdue" color="error" variant="subtle" size="xs">دیرشده</UBadge>
                    </div>
                    <p class="text-xs text-gray-600 dark:text-gray-300">
                      دارنده:
                      <template v-if="task.assigneeName">{{ task.assigneeName }}</template>
                      <template v-else-if="task.assigneeUserId">کاربر {{ task.assigneeUserId.toLocaleString('fa-IR') }}</template>
                      <template v-else>برداشته نشده</template>
                    </p>
                    <p class="text-xs" :class="task.overdue ? 'text-error' : 'text-gray-500 dark:text-gray-400'">
                      <template v-if="task.dueAt">مهلت: {{ formatJalali(task.dueAt, { withTime: true }) }}</template>
                      <template v-else>بدون مهلت</template>
                      · ساخته‌شده {{ formatJalali(task.createdAt, { withTime: true }) }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <!-- Reassign lives here, not only on the task page: a monitor who is no candidate gets a 404 there -->
                    <UButton
                      v-if="canMonitor"
                      color="neutral"
                      variant="outline"
                      size="sm"
                      icon="i-heroicons-arrow-uturn-right"
                      :disabled="Boolean(busy)"
                      @click="reassignTaskId = task.taskId"
                    >
                      ارجاع
                    </UButton>
                    <UButton
                      :to="`/panel/tasks/${encodeURIComponent(task.taskId)}`"
                      color="neutral"
                      variant="ghost"
                      size="sm"
                      icon="i-heroicons-arrow-top-right-on-square"
                    >
                      مشاهده کار
                    </UButton>
                  </div>
                </div>
              </li>
            </ul>
          </UCard>

          <!-- ===== Incidents: system steps whose retries ran out ===== -->
          <UCard v-if="incidents.length">
            <UAlert
              color="error"
              variant="soft"
              icon="i-heroicons-exclamation-triangle"
              title="مرحله‌ی سیستمی با خطا مواجه شد"
              description="بعد از چند تلاش، این مرحله اجرا نشد و اجرا منتظر تلاش دوباره یا لغو است."
              class="mb-4"
            />
            <ul class="space-y-3">
              <li
                v-for="incident in incidents"
                :key="incident.jobId"
                class="rounded-xl border border-gray-200 dark:border-gray-700 p-3 space-y-1"
              >
                <p dir="ltr" class="text-sm font-mono font-semibold text-gray-900 dark:text-white text-start">
                  {{ incident.stepKey }}
                </p>
                <p dir="auto" class="text-xs text-gray-600 dark:text-gray-300 break-words">{{ incident.message || '—' }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatJalali(incident.failedAt, { withTime: true }) }}
                </p>
              </li>
            </ul>
            <div v-if="running && canMonitor" class="mt-4">
              <UButton
                color="primary"
                icon="i-heroicons-arrow-path"
                :loading="busy === 'retry'"
                :disabled="Boolean(busy)"
                @click="retry"
              >
                تلاش دوباره
              </UButton>
            </div>
          </UCard>

          <!-- ===== Waits: steps waiting for an event ===== -->
          <UCard v-if="waits.length">
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">در انتظار رویداد</h4>
            <ul class="divide-y divide-gray-100 dark:divide-gray-800">
              <li v-for="wait in waits" :key="wait.stepKey" class="py-3 first:pt-0 last:pb-0">
                <div class="flex items-start justify-between gap-3 flex-wrap">
                  <div class="min-w-0 space-y-1">
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ wait.stepTitle || wait.stepKey }}</p>
                    <p class="text-xs text-gray-600 dark:text-gray-300">
                      <template v-if="wait.eventCode">
                        {{ eventTitle(instance.subject, wait.eventCode) }}
                        <span dir="ltr" class="font-mono text-gray-500 dark:text-gray-400">({{ wait.eventCode }})</span>
                      </template>
                      <template v-else>رویداد این مرحله مشخص نیست</template>
                    </p>
                    <p v-if="wait.since" class="text-xs text-gray-500 dark:text-gray-400">
                      از {{ formatJalali(wait.since, { withTime: true }) }}
                    </p>
                  </div>
                  <UButton
                    v-if="wait.eventCode && canMonitor"
                    color="neutral"
                    variant="outline"
                    size="sm"
                    icon="i-heroicons-bolt"
                    :disabled="Boolean(busy)"
                    @click="eventWait = wait"
                  >
                    اعلام رویداد
                  </UButton>
                </div>
              </li>
            </ul>
          </UCard>

          <!-- ===== Answers collected by system steps ===== -->
          <UCard v-if="answers.length" :ui="{ body: 'p-0' }">
            <h4 class="text-sm font-bold text-gray-900 dark:text-white px-4 sm:px-6 pt-4 pb-3">پاسخ‌های جمع‌شده</h4>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-2">مرحله</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-2">پاسخ</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-2">مقدار</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="answer in answers"
                    :key="`${answer.stepKey}.${answer.key}`"
                    class="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td class="px-4 py-3 align-top text-sm text-gray-700 dark:text-gray-300">{{ answer.stepTitle }}</td>
                    <td class="px-4 py-3 align-top">
                      <p class="text-sm text-gray-900 dark:text-white">{{ answer.title }}</p>
                      <p dir="ltr" class="text-xs font-mono text-gray-500 dark:text-gray-400 text-start">
                        step.{{ answer.stepKey }}.{{ answer.key }}
                      </p>
                    </td>
                    <td class="px-4 py-3 align-top text-sm text-gray-900 dark:text-white">
                      <span v-if="answer.value === null || answer.value === undefined" class="text-gray-500 dark:text-gray-400">
                        بی‌جواب
                      </span>
                      <UBadge v-else-if="typeof answer.value === 'boolean'" :color="answer.value ? 'success' : 'error'" variant="subtle" size="xs">
                        {{ answer.value ? 'بله' : 'خیر' }}
                      </UBadge>
                      <template v-else-if="typeof answer.value === 'number'">{{ answer.value.toLocaleString('fa-IR') }}</template>
                      <pre
                        v-else-if="typeof answer.value === 'object'"
                        dir="ltr"
                        class="text-xs font-mono whitespace-pre-wrap break-words text-start"
                      >{{ JSON.stringify(answer.value, null, 2) }}</pre>
                      <span v-else dir="auto" class="break-words">{{ answer.value }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </UCard>

          <!-- ===== Attachments of the whole run ===== -->
          <UCard v-if="attachments.length">
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">پیوست‌ها</h4>
            <ul class="divide-y divide-gray-100 dark:divide-gray-800">
              <li v-for="file in attachments" :key="file.id" class="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <UIcon name="i-heroicons-paper-clip" class="w-4 h-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                <div class="min-w-0 flex-1">
                  <p dir="auto" class="text-sm text-gray-900 dark:text-white truncate">{{ file.fileName || `#${file.id}` }}</p>
                  <p v-if="file.fileSize" class="text-xs text-gray-500 dark:text-gray-400">{{ sizeLabel(file.fileSize) }}</p>
                </div>
                <UButton
                  color="neutral"
                  variant="ghost"
                  square
                  icon="i-heroicons-arrow-down-tray"
                  aria-label="دانلود پیوست"
                  :loading="downloadingId === file.id"
                  :disabled="downloadingId !== null"
                  @click="downloadAttachment(file)"
                />
              </li>
            </ul>
          </UCard>

          <!-- ===== Decision history ===== -->
          <UCard>
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">تاریخچه‌ی تصمیم‌ها</h4>
            <TaskTimeline :timeline="detail.timeline" />
          </UCard>
        </div>
      </Transition>
    </div>

    <template v-if="detail">
      <ReassignModal
        :open="Boolean(reassignTaskId)"
        :task-id="reassignTaskId || ''"
        @update:open="(value) => { if (!value) reassignTaskId = '' }"
        @done="onReassigned"
      />

      <PanelConfirmDialog
        :open="Boolean(eventWait)"
        title="اعلام رویداد"
        :message="eventMessage"
        confirm-label="اعلام رویداد"
        :loading="busy === 'event'"
        @update:open="(value) => { if (!value) eventWait = null }"
        @confirm="publish"
      />

      <PanelConfirmDialog
        v-model:open="showCancel"
        title="لغو اجرا"
        message="اجرا متوقف می‌شود و رکورد مثل رد شدن به حالت پیش از درخواست برمی‌گردد. این کار برگشت‌پذیر نیست."
        confirm-label="لغو اجرا"
        confirm-color="error"
        note-label="دلیل لغو"
        :note-required="true"
        :note-max="500"
        :loading="busy === 'cancel'"
        @confirm="cancel"
      />
    </template>
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import TaskTimeline from '@/components/panel/workflow/TaskTimeline.vue'
import ReassignModal from '@/components/panel/workflow/ReassignModal.vue'
import { apiErrorMessage } from '~/utils/apiError.js'
import { metaOf } from '~/utils/enumMeta.js'
import { formatJalali } from '~/utils/jalali.js'
import { INSTANCE_STATUS_META, entityIdDir, entityIdLabel, entityLink } from '~/utils/workflowMeta.js'

// One workflow run (GET api/admin/workflow/instances/{id}). BACK guards this read with WORKFLOW_TASK (the list is WORKFLOW_MONITOR);
// the monitor actions below (reassign, publish event, retry, cancel) need WORKFLOW_MONITOR, which BACK checks again. A 404 here
// is «this run does not exist», not «workflow off» (the list page covers that).
const route = useRoute()
const app = useNuxtApp()
const toast = useAppToast()
const { canRead } = useModuleAccess()
const { download } = useFileDownload()
const { refresh: refreshCount } = useWorkflowTaskCount()
const { load: loadSubjects, subjectTitle, actionTitle, eventTitle } = useWorkflowSubjects()

const instanceId = Number(route.params.id)

const detail = ref(null) // WorkflowInstanceDetailDTO
const loading = ref(true)
const validId = Number.isInteger(instanceId) && instanceId > 0
const loadStatus = ref(validId ? 0 : 404) // HTTP status of a failed load

const forbidden = computed(() => loadStatus.value === 403)
const notFound = computed(() => loadStatus.value === 404)

const instance = computed(() => detail.value?.instance ?? {})
const openTasks = computed(() => detail.value?.openTasks ?? [])
const incidents = computed(() => detail.value?.incidents ?? [])
const waits = computed(() => detail.value?.waits ?? [])
const answers = computed(() => detail.value?.answers ?? [])
const attachments = computed(() => detail.value?.attachments ?? [])

const running = computed(() => instance.value.status === 'RUNNING')
const canMonitor = computed(() => canRead('WORKFLOW_MONITOR'))
const recordLink = computed(() => entityLink(instance.value.subject, instance.value.entityId))

// ---------- load ----------
async function fetchDetail() {
  try {
    const res = await app.$api.workflow.getInstance(instanceId)
    detail.value = res.data.data ?? null
    loadStatus.value = detail.value ? 0 : 404
  } catch (e) {
    detail.value = null
    loadStatus.value = e?.response?.status ?? -1
  } finally {
    loading.value = false
  }
}

const retryLoad = () => {
  loading.value = true
  fetchDetail()
}

onMounted(() => {
  if (validId) {
    fetchDetail()
    loadSubjects()
  } else {
    loading.value = false // a non-numeric id in the URL: straight to «not found»
  }
})

// ---------- monitor actions: one at a time, each answers with a fresh detail or reloads it ----------
const busy = ref('') // 'retry' | 'event' | 'cancel' while a request runs

// 409 (the run moved on meanwhile): show its real state; the toast already carries BACK's message
async function failAction(e, fallback) {
  toast.error(apiErrorMessage(e, fallback))
  if (e?.response?.status === 409) await fetchDetail()
}

async function retry() {
  if (busy.value) return
  busy.value = 'retry'
  try {
    const res = await app.$api.workflow.retryInstance(instanceId)
    detail.value = res.data.data ?? detail.value
    toast.success('مرحله‌ی خطادار دوباره در صف اجرا قرار گرفت')
  } catch (e) {
    await failAction(e, 'تلاش دوباره ناموفق بود')
  } finally {
    busy.value = ''
  }
}

// «اعلام رویداد»: BACK moves on every RUNNING run of the RECORD that waits for this event, not only this run
const eventWait = ref(null)
const eventMessage = computed(() => {
  const wait = eventWait.value
  if (!wait) return ''
  const subject = subjectTitle(instance.value.subject)
  return `رویداد «${eventTitle(instance.value.subject, wait.eventCode)}» برای ${subject} #${entityIdLabel(instance.value.entityId)} اعلام می‌شود. هر اجرای در جریان همین رکورد که منتظر این رویداد است، جلو می‌رود.`
})

async function publish() {
  const wait = eventWait.value
  if (!wait || busy.value) return
  busy.value = 'event'
  try {
    const res = await app.$api.workflow.publishEvent({
      data: { subject: instance.value.subject, entityId: String(instance.value.entityId), event: wait.eventCode },
    })
    const moved = Number(res.data.data) || 0
    if (moved > 0) toast.success(`${moved.toLocaleString('fa-IR')} مرحله جلو رفت`)
    else toast.info('مرحله‌ای منتظر نبود')
    eventWait.value = null
    refreshCount()
    await fetchDetail()
  } catch (e) {
    eventWait.value = null
    await failAction(e, 'اعلام رویداد ناموفق بود')
  } finally {
    busy.value = ''
  }
}

const showCancel = ref(false)

async function cancel(reason) {
  if (busy.value) return
  busy.value = 'cancel'
  try {
    await app.$api.workflow.cancelInstance(instanceId, { data: { reason } })
    showCancel.value = false
    toast.success('اجرا لغو شد')
    refreshCount()
    await fetchDetail()
  } catch (e) {
    showCancel.value = false
    await failAction(e, 'لغو اجرا ناموفق بود')
  } finally {
    busy.value = ''
  }
}

// ---------- reassign (the modal toasts the success itself) ----------
const reassignTaskId = ref('')

async function onReassigned() {
  refreshCount()
  await fetchDetail()
}

// ---------- attachments ----------
const downloadingId = ref(null)

async function downloadAttachment(file) {
  if (downloadingId.value !== null) return
  downloadingId.value = file.id
  await download(app.$api.workflow.instanceAttachment(instanceId, file.id), file.fileName)
  downloadingId.value = null
}

// Bytes in KB or MB with fa-IR digits (BACK `fileSize` is a byte count)
const sizeLabel = (bytes) => {
  const kb = bytes / 1024
  return kb < 1024
    ? `${Math.max(1, Math.round(kb)).toLocaleString('fa-IR')} کیلوبایت`
    : `${(kb / 1024).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} مگابایت`
}

useHead({ title: 'جزئیات اجرا | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
