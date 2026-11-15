<!-- pages/panel/tasks/[taskId].vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader icon="i-heroicons-inbox-stack" title="جزئیات" accent="کار">
      <template #actions>
        <UButton to="/panel/tasks" color="neutral" variant="outline" icon="i-heroicons-arrow-right">
          بازگشت به کارتابل
        </UButton>
      </template>
    </PanelPageHeader>

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="space-y-4">
          <USkeleton class="h-28 w-full rounded-xl" />
          <USkeleton class="h-32 w-full rounded-xl" />
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
          icon="i-heroicons-inbox-stack"
          title="این کار پیدا نشد یا دیگر در کارتابل شما نیست"
        >
          <template #action>
            <UButton to="/panel/tasks" color="primary" icon="i-heroicons-arrow-right">بازگشت به کارتابل</UButton>
          </template>
        </PanelEmptyState>

        <PanelEmptyState v-else-if="!detail" key="error" variant="error" title="دریافت کار ناموفق بود">
          <template #action>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="retryLoad">
              تلاش دوباره
            </UButton>
          </template>
        </PanelEmptyState>

        <div v-else key="content" class="space-y-4">
          <!-- Summary of the record the task is about -->
          <UCard>
            <div class="flex items-start justify-between gap-3 flex-wrap">
              <div class="min-w-0 space-y-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <h2 class="text-base font-bold text-gray-900 dark:text-white">{{ taskTitle(task) }}</h2>
                  <StatusBadge :meta="metaOf(INSTANCE_STATUS_META, detail.instance?.status)" />
                  <UBadge v-if="task.overdue" color="error" variant="subtle" size="xs">دیرشده</UBadge>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ task.subjectTitle }}
                  <template v-if="recordLink">
                    ·
                    <NuxtLink
                      :to="recordLink"
                      class="text-brand-500 dark:text-brand-400 hover:underline underline-offset-2"
                    >
                      مشاهده {{ task.subjectTitle }} #{{ entityIdLabel(task.entityId) }}
                    </NuxtLink>
                  </template>
                </p>
              </div>
            </div>

            <dl v-if="task.summary?.lines?.length" class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4 text-sm">
              <div v-for="(line, index) in task.summary.lines" :key="index">
                <dt class="text-xs text-gray-500 dark:text-gray-400">{{ line.label }}</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ line.value }}</dd>
              </div>
            </dl>
          </UCard>

          <!-- The step waiting for a decision -->
          <UCard>
            <div class="flex items-center gap-2 flex-wrap mb-4">
              <h4 class="text-sm font-bold text-gray-900 dark:text-white">{{ task.stepTitle }}</h4>
              <UBadge :color="task.status === 'CLAIMED' ? 'info' : 'neutral'" variant="subtle" size="xs">
                {{ task.status === 'CLAIMED' ? 'برداشته‌شده' : 'برداشته‌نشده' }}
              </UBadge>
            </div>

            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">فرایند</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">
                  {{ detail.instance?.definitionTitle || '—' }}
                  <span v-if="detail.instance?.definitionVersion" class="text-xs text-gray-500 dark:text-gray-400">
                    · نسخه {{ detail.instance.definitionVersion.toLocaleString('fa-IR') }}
                  </span>
                </dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">ثبت‌کننده‌ی درخواست</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">
                  <template v-if="task.startedByName">{{ task.startedByName }}</template>
                  <span v-else-if="task.startedBy" dir="ltr">{{ task.startedBy }}</span>
                  <template v-else>سیستم</template>
                </dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">زمان ورود به این مرحله</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ formatJalali(task.createdAt, { withTime: true }) || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">مهلت</dt>
                <dd class="mt-0.5" :class="task.overdue ? 'text-error' : 'text-gray-900 dark:text-white'">
                  {{ task.dueAt ? formatJalali(task.dueAt, { withTime: true }) : 'بدون مهلت' }}
                  <template v-if="task.overdue">(دیرشده)</template>
                </dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">دارنده‌ی کار</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">
                  {{ task.mine ? 'شما' : task.assigneeName || 'هنوز کسی برنداشته است' }}
                </dd>
              </div>
              <div v-if="detail.instance?.activeSteps?.length">
                <dt class="text-xs text-gray-500 dark:text-gray-400">مرحله‌های فعال</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ detail.instance.activeSteps.join('، ') }}</dd>
              </div>
            </dl>

            <div class="flex items-center gap-2 flex-wrap mt-5">
              <UButton
                v-if="canClaim"
                color="neutral"
                variant="outline"
                icon="i-heroicons-hand-raised"
                :loading="acting === 'claim'"
                :disabled="Boolean(acting)"
                @click="claim"
              >
                برداشتن
              </UButton>
              <UButton
                v-if="canUnclaim"
                color="neutral"
                variant="outline"
                icon="i-heroicons-arrow-uturn-left"
                :loading="acting === 'unclaim'"
                :disabled="Boolean(acting)"
                @click="unclaim"
              >
                رها کردن
              </UButton>
              <UButton
                color="neutral"
                variant="outline"
                icon="i-heroicons-pencil-square"
                :disabled="Boolean(acting)"
                @click="showNote = true"
              >
                ثبت یادداشت
              </UButton>
              <UButton
                v-if="canReassign"
                color="neutral"
                variant="outline"
                icon="i-heroicons-arrow-uturn-right"
                :disabled="Boolean(acting)"
                @click="showReassign = true"
              >
                ارجاع
              </UButton>
            </div>
          </UCard>

          <!-- Decision: only for the holder, or for anyone who may still take an unclaimed task (deciding claims it) -->
          <TaskDecisionCard
            v-if="canDecide"
            :task-id="task.taskId"
            :attachments="detail.attachments"
            :attached-files="detail.attachedFiles ?? 0"
            @decided="onDecided"
          />

          <UCard>
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">تاریخچه‌ی تصمیم‌ها</h4>
            <TaskTimeline :timeline="detail.timeline" />
          </UCard>
        </div>
      </Transition>
    </div>

    <template v-if="detail">
      <PanelConfirmDialog
        v-model:open="showNote"
        title="ثبت یادداشت"
        message="یادداشت بدون تصمیم ثبت می‌شود؛ کار باز می‌ماند و مرحله‌ی بعد آن را در تاریخچه می‌بیند."
        confirm-label="ثبت یادداشت"
        note-label="یادداشت"
        :note-required="true"
        :note-max="1000"
        :loading="noting"
        @confirm="submitNote"
      />

      <ReassignModal v-model:open="showReassign" :task-id="task.taskId" @done="onReassigned" />
    </template>
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import TaskDecisionCard from '@/components/panel/workflow/TaskDecisionCard.vue'
import TaskTimeline from '@/components/panel/workflow/TaskTimeline.vue'
import ReassignModal from '@/components/panel/workflow/ReassignModal.vue'
import { apiErrorMessage } from '~/utils/apiError.js'
import { metaOf } from '~/utils/enumMeta.js'
import { formatJalali } from '~/utils/jalali.js'
import { INSTANCE_STATUS_META, entityIdLabel, entityLink, taskTitle } from '~/utils/workflowMeta.js'

// One task of the approval inbox (GET api/admin/workflow/tasks/{taskId}). `taskId` is a string; the router decodes it and
// the wrappers encode it again. 404 here means «gone or not yours» (not «workflow off»), so it gets its own text.
const route = useRoute()
const app = useNuxtApp()
const toast = useAppToast()
const { canRead } = useModuleAccess()
const { refresh: refreshCount } = useWorkflowTaskCount()

const taskId = String(route.params.taskId)

const detail = ref(null) // WorkflowTaskDetailDTO
const loading = ref(true)
const loadStatus = ref(0) // HTTP status of a failed load

const forbidden = computed(() => loadStatus.value === 403)
const notFound = computed(() => loadStatus.value === 404)

const task = computed(() => detail.value?.task ?? {})
const recordLink = computed(() => entityLink(task.value.subject, task.value.entityId))

const canClaim = computed(() => task.value.status === 'OPEN' && !task.value.mine)
const canUnclaim = computed(() => task.value.status === 'CLAIMED' && task.value.mine)
const canDecide = computed(() => task.value.mine || task.value.status === 'OPEN')
const canReassign = computed(() => canRead('WORKFLOW_MONITOR'))

async function fetchDetail() {
  try {
    const res = await app.$api.workflow.getTask(taskId)
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

onMounted(fetchDetail)

// ---------- claim / unclaim (each answers the updated task) ----------
const acting = ref('') // 'claim' | 'unclaim' while a request runs

async function runTaskAction(name, request, successText, failText) {
  if (acting.value) return
  acting.value = name
  try {
    const res = await request()
    detail.value = { ...detail.value, task: res.data.data }
    toast.success(successText)
    refreshCount()
  } catch (e) {
    toast.error(apiErrorMessage(e, failText))
    // 409: someone else moved the task meanwhile, so show its real state
    if (e?.response?.status === 409) await fetchDetail()
  } finally {
    acting.value = ''
  }
}

const claim = () => runTaskAction('claim', () => app.$api.workflow.claimTask(taskId), 'کار برداشته شد', 'برداشتن کار ناموفق بود')
const unclaim = () =>
  runTaskAction('unclaim', () => app.$api.workflow.unclaimTask(taskId), 'کار رها شد', 'رها کردن کار ناموفق بود')

// ---------- note (no decision; answers the task detail with the fresh timeline) ----------
const showNote = ref(false)
const noting = ref(false)

async function submitNote(text) {
  noting.value = true
  try {
    const res = await app.$api.workflow.commentTask(taskId, { data: { comment: text } })
    detail.value = res.data.data ?? detail.value
    showNote.value = false
    toast.success('یادداشت ثبت شد')
  } catch (e) {
    showNote.value = false
    toast.error(apiErrorMessage(e, 'ثبت یادداشت ناموفق بود'))
  } finally {
    noting.value = false
  }
}

// ---------- decision / reassign: the task leaves this user's inbox, so go back to the list ----------
const showReassign = ref(false)

async function onDecided() {
  toast.success('تصمیم شما ثبت شد')
  refreshCount()
  await navigateTo('/panel/tasks')
}

async function onReassigned() {
  refreshCount()
  await navigateTo('/panel/tasks')
}

useHead({ title: 'جزئیات کار | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
