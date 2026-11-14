<!-- pages/panel/workflow/events.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader
      icon="i-heroicons-bolt"
      title="رویدادهای"
      accent="سفارشی"
      subtitle="رویدادهایی که فروشگاه برای مرحله‌ی انتظار تعریف می‌کند"
    >
      <template #actions>
        <UButton v-if="!unavailable" color="primary" size="lg" icon="i-heroicons-plus" @click="modalOpen = true">
          رویداد جدید
        </UButton>
      </template>
    </PanelPageHeader>

    <WorkflowTabs />

    <UAlert
      v-if="!unavailable"
      color="info"
      variant="soft"
      icon="i-heroicons-information-circle"
      description="این رویدادها در مرحله‌ی انتظار قابل انتخاب‌اند و با «اعلام رویداد» در صفحه‌ی اجرا جلو می‌روند."
    />

    <div class="relative">
      <Transition name="sk">
        <UCard v-if="loading" key="skeleton" :ui="{ body: 'p-0' }">
          <div class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
              <USkeleton class="h-4 w-36" />
              <USkeleton class="h-4 w-48" />
            </div>
          </div>
        </UCard>

        <PanelEmptyState
          v-else-if="unavailable"
          key="forbidden"
          variant="forbidden"
          title="گردش کار در دسترس نیست"
          text="یا دسترسی ندارید یا گردش کار برای این فروشگاه روشن نیست"
        />

        <PanelEmptyState v-else-if="error" key="error" variant="error" title="دریافت رویدادها ناموفق بود">
          <template #action>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">تلاش دوباره</UButton>
          </template>
        </PanelEmptyState>

        <div v-else-if="groups.length" key="content" class="space-y-4">
          <UCard v-for="group in groups" :key="group.subject" :ui="{ body: 'p-0' }">
            <template #header>
              <div class="flex items-baseline gap-2">
                <h2 class="text-sm font-bold text-gray-900 dark:text-white">{{ group.title }}</h2>
                <span class="text-xs text-gray-400 dark:text-gray-500" dir="ltr">{{ group.subject }}</span>
              </div>
            </template>
            <ul class="divide-y divide-gray-100 dark:divide-gray-800">
              <li v-for="event in group.events" :key="event.id" class="flex items-center gap-4 px-4 sm:px-6 py-3">
                <span
                  class="text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded px-2 py-1"
                  dir="ltr"
                >
                  {{ event.code }}
                </span>
                <span class="flex-1 min-w-0 text-sm text-gray-900 dark:text-white">{{ event.title }}</span>
                <UButton
                  color="error"
                  variant="ghost"
                  square
                  icon="i-heroicons-trash"
                  aria-label="حذف رویداد"
                  @click="deleteTarget = event"
                />
              </li>
            </ul>
          </UCard>
        </div>

        <UCard v-else key="empty">
          <PanelEmptyState
            icon="i-heroicons-bolt"
            title="رویدادی تعریف نشده است"
            text="رویداد سفارشی برای مرحله‌ی انتظار فرایندها اینجا تعریف می‌شود"
          />
        </UCard>
      </Transition>
    </div>

    <CustomEventModal v-model:open="modalOpen" :subjects="subjects" @done="onCreated" />

    <PanelConfirmDialog
      :open="deleteTarget !== null"
      title="حذف رویداد"
      :message="deleteMessage"
      confirm-label="حذف"
      confirm-color="error"
      :loading="deleting"
      @update:open="(value) => { if (!value) deleteTarget = null }"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import WorkflowTabs from '@/components/panel/workflow/WorkflowTabs.vue'
import CustomEventModal from '@/components/panel/workflow/CustomEventModal.vue'
import { apiErrorMessage } from '~/utils/apiError.js'
import { isWorkflowUnavailable } from '~/utils/workflowMeta.js'

// Custom events (C21c, module WORKFLOW_DESIGN): events the store defines for a subject so a waiting step can wait for them. The list
// is `listCustomEvents` (unpaged, sorted by subject then code); the subject catalog feeds the add modal and is optional (a failed
// catalog turns the subject field into a typed code instead of blocking the page).
const app = useNuxtApp()
const toast = useAppToast()

const events = ref([])
const subjects = ref([])
const loading = ref(true)
const error = ref(null)
const modalOpen = ref(false)

// 403 (no grant) or 404 (workflow not switched on) = unavailable, not an error to retry
const unavailable = computed(() => isWorkflowUnavailable(error.value))

async function load() {
  loading.value = true
  try {
    const [eventsRes, subjectsRes] = await Promise.all([
      app.$api.workflow.listCustomEvents(),
      app.$api.workflow.listSubjects().catch(() => null),
    ])
    events.value = eventsRes.data.data ?? []
    subjects.value = subjectsRes?.data?.data ?? []
    error.value = null
  } catch (e) {
    events.value = []
    error.value = e
  } finally {
    loading.value = false
  }
}

onMounted(load)

// Grouped by subject, in the order BACK sorts them
const groups = computed(() => {
  const byCode = new Map()
  for (const event of events.value) {
    if (!byCode.has(event.subject)) {
      byCode.set(event.subject, { subject: event.subject, title: event.subjectTitle || event.subject, events: [] })
    }
    byCode.get(event.subject).events.push(event)
  }
  return [...byCode.values()]
})

// The new event is in the answer: no reload needed. Keep the list sorted like BACK (subject, then code)
const onCreated = (event) => {
  if (!event) return load()
  events.value = [...events.value, event].sort(
    (a, b) => a.subject.localeCompare(b.subject) || a.code.localeCompare(b.code)
  )
  // The catalog's `events` also list custom ones, so the duplicate check of the next add must know this one too
  const subject = subjects.value.find((item) => item.code === event.subject)
  if (subject) subject.events = [...(subject.events ?? []), { code: event.code, title: event.title }]
}

// ---------- delete ----------
const deleteTarget = ref(null)
const deleting = ref(false)

const deleteMessage = computed(() => {
  const event = deleteTarget.value
  if (!event) return ''
  return `رویداد «${event.title}» حذف شود؟ مرحله‌هایی که منتظر آن هستند فقط با گذشتن مهلتشان جلو می‌روند.`
})

async function confirmDelete() {
  const event = deleteTarget.value
  if (!event) return
  deleting.value = true
  try {
    await app.$api.workflow.deleteCustomEvent(event.id)
    events.value = events.value.filter((item) => item.id !== event.id)
    const subject = subjects.value.find((item) => item.code === event.subject)
    if (subject) subject.events = (subject.events ?? []).filter((item) => item.code !== event.code)
    deleteTarget.value = null
    toast.success('رویداد حذف شد')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'حذف رویداد ناموفق بود'))
  } finally {
    deleting.value = false
  }
}

useHead({ title: 'رویدادهای سفارشی | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
