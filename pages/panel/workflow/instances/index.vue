<!-- pages/panel/workflow/instances/index.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader
      icon="i-heroicons-arrow-path-rounded-square"
      title="پایش"
      accent="اجراها"
      subtitle="اجراهای فرایند تأیید در این فروشگاه"
    >
      <template #actions>
        <UButton color="neutral" variant="soft" size="lg" icon="i-heroicons-arrow-path" :loading="loading" @click="reload">
          به‌روزرسانی
        </UButton>
      </template>
    </PanelPageHeader>

    <WorkflowTabs />

    <UCard :ui="{ body: 'p-0' }">
      <!-- Filters: hidden while the area is unavailable (nothing to filter) -->
      <div
        v-if="!unavailable"
        class="flex flex-wrap items-end gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800"
      >
        <USelect v-model="filters.status" :items="statusOptions" size="sm" class="w-44" aria-label="وضعیت" />
        <USelect
          v-if="!subjectsFailed"
          v-model="filters.subject"
          :items="subjectOptions"
          :disabled="!subjectsLoaded"
          size="sm"
          class="w-48"
          aria-label="موجودیت"
        />
        <!-- The subject list needs the designer grant; without it the code is typed (e.g. PURCHASE_ORDER) -->
        <UInput
          v-else
          v-model="subjectText"
          dir="ltr"
          size="sm"
          placeholder="کد موجودیت (مثلاً PURCHASE_ORDER)"
          class="w-60"
          aria-label="کد موجودیت"
        />
        <UInput
          v-model="entityText"
          dir="ltr"
          size="sm"
          placeholder="شناسه رکورد"
          class="w-36"
          aria-label="شناسه رکورد"
        />
        <JalaliDateInput v-model="filters.from" label="شروع از" clearable />
        <JalaliDateInput v-model="filters.to" label="شروع تا" clearable />
      </div>

      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
              <USkeleton class="h-4 w-12" />
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-48" />
                <USkeleton class="h-3 w-64" />
              </div>
              <USkeleton class="h-5 w-16 rounded-full" />
            </div>
          </div>

          <PanelEmptyState
            v-else-if="unavailable"
            key="forbidden"
            variant="forbidden"
            title="گردش کار در دسترس نیست"
            text="یا دسترسی ندارید یا گردش کار برای این فروشگاه روشن نیست"
          />

          <PanelEmptyState v-else-if="error" key="error" variant="error" title="دریافت اجراها ناموفق بود">
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
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">اجرا</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">فرایند</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">رکورد</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">اقدام</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">وضعیت</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">مرحله‌ی فعال</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">ثبت‌کننده</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">شروع و پایان</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in items"
                    :key="row.id"
                    class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td class="px-4 py-3 align-top whitespace-nowrap">
                      <!-- The run detail is a WORKFLOW_TASK read in BACK, so without that grant the number is plain text -->
                      <NuxtLink
                        v-if="canOpenRun"
                        :to="`/panel/workflow/instances/${row.id}`"
                        class="text-sm font-semibold text-brand-500 dark:text-brand-400 hover:underline underline-offset-2"
                      >
                        #{{ row.id.toLocaleString('fa-IR') }}
                      </NuxtLink>
                      <span v-else class="text-sm font-semibold text-gray-900 dark:text-white">
                        #{{ row.id.toLocaleString('fa-IR') }}
                      </span>
                    </td>
                    <td class="px-4 py-3 align-top text-sm text-gray-900 dark:text-white">
                      {{ row.definitionTitle || '—' }}
                      <span v-if="row.definitionVersion" class="text-xs text-gray-500 dark:text-gray-400">
                        · v{{ row.definitionVersion.toLocaleString('fa-IR') }}
                      </span>
                    </td>
                    <td class="px-4 py-3 align-top text-sm text-gray-700 dark:text-gray-300">
                      <p>{{ subjectTitle(row.subject) }}</p>
                      <NuxtLink
                        v-if="entityLink(row.subject, row.entityId)"
                        :to="entityLink(row.subject, row.entityId)"
                        :dir="entityIdDir(row.entityId)"
                        class="text-xs text-brand-500 dark:text-brand-400 hover:underline underline-offset-2"
                      >
                        #{{ entityIdLabel(row.entityId) }}
                      </NuxtLink>
                      <p v-else :dir="entityIdDir(row.entityId)" class="text-xs text-gray-500 dark:text-gray-400 text-start">
                        #{{ entityIdLabel(row.entityId) }}
                      </p>
                    </td>
                    <td class="px-4 py-3 align-top text-sm text-gray-700 dark:text-gray-300">
                      {{ actionTitle(row.subject, row.action) }}
                    </td>
                    <td class="px-4 py-3 align-top">
                      <StatusBadge :meta="metaOf(INSTANCE_STATUS_META, row.status)" />
                    </td>
                    <td class="px-4 py-3 align-top text-xs text-gray-700 dark:text-gray-300">
                      {{ row.activeSteps?.length ? row.activeSteps.join('، ') : '—' }}
                    </td>
                    <td class="px-4 py-3 align-top text-xs text-gray-700 dark:text-gray-300">
                      <template v-if="row.startedByName">{{ row.startedByName }}</template>
                      <span v-else-if="row.startedBy" dir="ltr">{{ row.startedBy }}</span>
                      <template v-else>سیستم</template>
                    </td>
                    <td class="px-4 py-3 align-top text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      <p>{{ formatJalali(row.startedAt, { withTime: true }) || '—' }}</p>
                      <p v-if="row.endedAt">{{ formatJalali(row.endedAt, { withTime: true }) }}</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="totalPages > 1" class="flex justify-center py-4">
              <UPagination v-model:page="page" :total="total" :items-per-page="PAGE_SIZE" />
            </div>
          </div>

          <PanelEmptyState
            v-else
            key="empty"
            icon="i-heroicons-arrow-path-rounded-square"
            title="اجرایی پیدا نشد"
            text="با این فیلترها اجرای فرایندی ثبت نشده است"
          />
        </Transition>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import JalaliDateInput from '@/components/panel/JalaliDateInput.vue'
import WorkflowTabs from '@/components/panel/workflow/WorkflowTabs.vue'
import { metaOf, selectItems } from '~/utils/enumMeta.js'
import { formatJalali, toLatinDigits } from '~/utils/jalali.js'
import {
  INSTANCE_STATUS_META,
  entityIdDir,
  entityIdLabel,
  entityLink,
  isWorkflowUnavailable,
} from '~/utils/workflowMeta.js'

const PAGE_SIZE = 20
const TEXT_DEBOUNCE_MS = 400

// ---------- list: every run of the store, newest first (GET api/admin/workflow/instances, module WORKFLOW_MONITOR) ----------
const app = useNuxtApp()
const { canRead } = useModuleAccess()
const canOpenRun = computed(() => canRead('WORKFLOW_TASK'))

const {
  subjects,
  loaded: subjectsLoaded,
  failed: subjectsFailed,
  load: loadSubjects,
  subjectTitle,
  actionTitle,
} = useWorkflowSubjects()

// 'all' = no filter (an empty value is not allowed on a select item). Dates are ISO `YYYY-MM-DD`, which is what BACK expects.
const filters = reactive({ status: 'all', subject: 'all', entityId: '', from: '', to: '' })

const statusOptions = selectItems(INSTANCE_STATUS_META, 'همه وضعیت‌ها')
const subjectOptions = computed(() => [
  { value: 'all', label: 'همه موجودیت‌ها' },
  ...subjects.value.map((subject) => ({ value: subject.code, label: subject.title || subject.code })),
])

// Only the filters that are set are sent; BACK rejects an unknown `status` with a 400, the select only offers known ones
const { items, total, totalPages, page, loading, error, reload } = usePagedList(
  ({ page: backendPage, size }) => {
    const params = { page: backendPage, size }
    if (filters.status !== 'all') params.status = filters.status
    if (filters.subject !== 'all') params.subject = filters.subject
    if (filters.entityId) params.entityId = filters.entityId
    if (filters.from) params.from = filters.from
    if (filters.to) params.to = filters.to
    return app.$api.workflow.listInstances({ params })
  },
  { size: PAGE_SIZE, filters }
)

// 403 (no grant) or 404 (workflow not switched on for this store) = unavailable, not an error to retry
const unavailable = computed(() => isWorkflowUnavailable(error.value))

// The two text filters are debounced into `filters`, so typing does not fire a request per keystroke
const entityText = ref('')
const subjectText = ref('')
let textTimer = null
watch([entityText, subjectText], () => {
  clearTimeout(textTimer)
  textTimer = setTimeout(() => {
    filters.entityId = toLatinDigits(entityText.value).trim()
    if (subjectsFailed.value) filters.subject = subjectText.value.trim() || 'all'
  }, TEXT_DEBOUNCE_MS)
})
onBeforeUnmount(() => clearTimeout(textTimer))

onMounted(loadSubjects)

useHead({ title: 'پایش اجراها | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
