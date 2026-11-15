<!-- pages/panel/workflow/bindings.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader
      icon="i-heroicons-link"
      title="اتصال"
      accent="فرایندها"
      subtitle="هر کار فروشگاه با کدام فرایند تأیید انجام می‌شود"
    >
      <template #actions>
        <UButton color="neutral" variant="soft" size="lg" icon="i-heroicons-arrow-path" :loading="loading" @click="load">
          به‌روزرسانی
        </UButton>
      </template>
    </PanelPageHeader>

    <WorkflowTabs />

    <UCard :ui="{ body: 'p-0' }">
      <div v-if="!unavailable && !error" class="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <UInput
          v-model="search"
          icon="i-heroicons-magnifying-glass"
          size="sm"
          placeholder="جستجوی موجودیت، کار یا فرایند"
          class="w-full sm:w-80"
          aria-label="جستجو"
        />
      </div>

      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
              <USkeleton class="h-4 w-4" />
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-40" />
                <USkeleton class="h-3 w-28" />
              </div>
              <USkeleton class="h-4 w-24" />
            </div>
          </div>

          <PanelEmptyState
            v-else-if="unavailable"
            key="forbidden"
            variant="forbidden"
            title="گردش کار در دسترس نیست"
            text="یا دسترسی ندارید یا گردش کار برای این فروشگاه روشن نیست"
          />

          <PanelEmptyState v-else-if="error" key="error" variant="error" title="دریافت اتصال‌ها ناموفق بود">
            <template #action>
              <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">تلاش دوباره</UButton>
            </template>
          </PanelEmptyState>

          <div v-else-if="visibleStore.length || visibleApi.length" key="content">
            <BindingSubjectSection
              v-for="entry in visibleStore"
              :key="entry.subject.code"
              :subject="entry.subject"
              :actions="entry.actions"
              :bindings="bindingsBySubject[entry.subject.code]"
              :open="isOpen(entry.subject.code)"
              @toggle="toggle(entry.subject.code)"
              @bind="(action) => openBind(entry.subject, action)"
              @unbind="(action) => askUnbind(entry.subject, action)"
            />

            <template v-if="visibleApi.length">
              <div class="px-4 sm:px-6 py-2 bg-gray-50 dark:bg-gray-800/50 border-y border-gray-100 dark:border-gray-800">
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400">درخواست‌های API</p>
              </div>
              <BindingSubjectSection
                v-for="entry in visibleApi"
                :key="entry.subject.code"
                :subject="entry.subject"
                :actions="entry.actions"
                :bindings="bindingsBySubject[entry.subject.code]"
                :open="isOpen(entry.subject.code)"
                @toggle="toggle(entry.subject.code)"
                @bind="(action) => openBind(entry.subject, action)"
                @unbind="(action) => askUnbind(entry.subject, action)"
              />
            </template>
          </div>

          <PanelEmptyState
            v-else
            key="empty"
            icon="i-heroicons-link"
            :title="search.trim() ? 'نتیجه‌ای پیدا نشد' : 'کاری برای اتصال وجود ندارد'"
            :text="search.trim() ? 'عبارت دیگری را جستجو کنید' : 'هنوز موجودیتی به گردش کار وصل نشده است'"
          />
        </Transition>
      </div>
    </UCard>

    <BindModal
      v-if="bindTarget"
      :open="bindOpen"
      :subject="bindTarget.subject.code"
      :subject-title="bindTarget.subject.title || bindTarget.subject.code"
      :action="bindTarget.action"
      :current="bindingsBySubject[bindTarget.subject.code]?.[bindTarget.action.code] ?? null"
      @update:open="bindOpen = $event"
      @done="onBound"
    />

    <PanelConfirmDialog
      :open="unbindTarget !== null"
      title="برداشتن اتصال"
      :message="unbindMessage"
      confirm-label="برداشتن اتصال"
      confirm-color="error"
      :loading="unbinding"
      @update:open="(value) => { if (!value) unbindTarget = null }"
      @confirm="confirmUnbind"
    />
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import WorkflowTabs from '@/components/panel/workflow/WorkflowTabs.vue'
import BindModal from '@/components/panel/workflow/BindModal.vue'
import BindingSubjectSection from '@/components/panel/workflow/BindingSubjectSection.vue'
import { apiErrorMessage } from '~/utils/apiError.js'
import { isWorkflowUnavailable } from '~/utils/workflowMeta.js'

// Bindings (C21a, module WORKFLOW_DESIGN): which published process gates which action of which subject. Loads the subject catalog
// (`listSubjects`, the actions to show) and the bindings (`listBindings`) together; an action without a binding row is not bound.
const API_PREFIX = 'API_'

const app = useNuxtApp()
const toast = useAppToast()

const subjects = ref([])
const bindings = ref([])
const loading = ref(true)
const error = ref(null)
const search = ref('')
const openCodes = ref([])

// 403 (no grant) or 404 (workflow not switched on for this store) on either call = unavailable, not an error to retry
const unavailable = computed(() => isWorkflowUnavailable(error.value))

async function load() {
  loading.value = true
  try {
    const [subjectsRes, bindingsRes] = await Promise.all([
      app.$api.workflow.listSubjects(),
      app.$api.workflow.listBindings(),
    ])
    subjects.value = subjectsRes.data.data ?? []
    bindings.value = bindingsRes.data.data ?? []
    error.value = null
    // Store subjects start open, the (long) API groups start closed
    openCodes.value = subjects.value.filter((subject) => !subject.code.startsWith(API_PREFIX)).map((subject) => subject.code)
  } catch (e) {
    subjects.value = []
    bindings.value = []
    error.value = e
  } finally {
    loading.value = false
  }
}

onMounted(load)

// subject code → action code → binding
const bindingsBySubject = computed(() => {
  const map = {}
  for (const binding of bindings.value) {
    if (!map[binding.subject]) map[binding.subject] = {}
    map[binding.subject][binding.action] = binding
  }
  return map
})

// ---------- search: subject / action / process title or code; matching groups open on their own ----------
const query = computed(() => search.value.trim().toLowerCase())

const matches = (...texts) => texts.some((text) => String(text ?? '').toLowerCase().includes(query.value))

const entries = computed(() =>
  subjects.value
    .map((subject) => {
      const bound = bindingsBySubject.value[subject.code] ?? {}
      const subjectHit = !query.value || matches(subject.title, subject.code)
      const actions = (subject.actions ?? []).filter(
        (action) =>
          subjectHit ||
          matches(action.title, action.code, bound[action.code]?.definitionTitle, bound[action.code]?.definitionKey)
      )
      return { subject: { ...subject, actions: subject.actions ?? [] }, actions }
    })
    .filter((entry) => entry.actions.length)
)

const visibleStore = computed(() => entries.value.filter((entry) => !entry.subject.code.startsWith(API_PREFIX)))
const visibleApi = computed(() => entries.value.filter((entry) => entry.subject.code.startsWith(API_PREFIX)))

const isOpen = (code) => Boolean(query.value) || openCodes.value.includes(code)
const toggle = (code) => {
  // While a search is active every match is open, so there is nothing to toggle
  if (query.value) return
  openCodes.value = openCodes.value.includes(code)
    ? openCodes.value.filter((item) => item !== code)
    : [...openCodes.value, code]
}

// ---------- bind / change ----------
const bindTarget = ref(null) // { subject, action }
const bindOpen = ref(false)

const openBind = (subject, action) => {
  bindTarget.value = { subject, action }
  bindOpen.value = true
}

// The answer is the saved row: put it in place of the old one, no reload needed
const onBound = (binding) => {
  if (!binding) return load()
  bindings.value = [
    ...bindings.value.filter((item) => !(item.subject === binding.subject && item.action === binding.action)),
    binding,
  ]
}

// ---------- unbind ----------
const unbindTarget = ref(null) // { subject, action }
const unbinding = ref(false)

const askUnbind = (subject, action) => {
  unbindTarget.value = { subject, action }
}

const unbindMessage = computed(() => {
  if (!unbindTarget.value) return ''
  const { subject, action } = unbindTarget.value
  return `اتصال کار «${action.title || action.code}» از «${subject.title || subject.code}» برداشته شود؟ اجراهای در جریان تمام می‌شوند و کارهای بعدی بدون تأیید انجام می‌شوند.`
})

async function confirmUnbind() {
  const target = unbindTarget.value
  if (!target) return
  unbinding.value = true
  try {
    await app.$api.workflow.unbindWorkflow(target.subject.code, target.action.code)
    bindings.value = bindings.value.filter(
      (item) => !(item.subject === target.subject.code && item.action === target.action.code)
    )
    unbindTarget.value = null
    toast.success('اتصال برداشته شد')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'برداشتن اتصال ناموفق بود'))
  } finally {
    unbinding.value = false
  }
}

useHead({ title: 'اتصال فرایندها | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
