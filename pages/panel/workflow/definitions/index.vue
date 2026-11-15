<!-- pages/panel/workflow/definitions/index.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader
      icon="i-heroicons-squares-2x2"
      title="طراحی"
      accent="فرایندها"
      subtitle="فرایندهای تأیید این فروشگاه: ساخت، ویرایش، انتشار و بازنشسته کردن"
    >
      <template #actions>
        <template v-if="!unavailable">
          <UButton color="neutral" variant="outline" size="lg" icon="i-heroicons-arrow-up-tray" @click="importOpen = true">
            ورود از فایل
          </UButton>
          <UButton color="primary" size="lg" icon="i-heroicons-plus" :disabled="!subjectsLoaded" @click="createOpen = true">
            فرایند جدید
          </UButton>
        </template>
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
      </div>

      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-48" />
                <USkeleton class="h-3 w-32" />
              </div>
              <USkeleton class="h-5 w-16 rounded-full" />
              <USkeleton class="h-4 w-20" />
            </div>
          </div>

          <PanelEmptyState
            v-else-if="unavailable"
            key="forbidden"
            variant="forbidden"
            title="گردش کار در دسترس نیست"
            text="یا دسترسی ندارید یا گردش کار برای این فروشگاه روشن نیست"
          />

          <PanelEmptyState v-else-if="error" key="error" variant="error" title="دریافت فرایندها ناموفق بود">
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
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">فرایند</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">موجودیت و کار</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">وضعیت</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">نسخه‌ی منتشرشده</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">آخرین تغییر</th>
                    <th class="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in items"
                    :key="row.id"
                    class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td class="px-4 py-3 align-top">
                      <NuxtLink
                        :to="editPath(row)"
                        class="text-sm font-semibold text-brand-500 dark:text-brand-400 hover:underline underline-offset-2"
                      >
                        {{ row.title || row.key }}
                      </NuxtLink>
                      <p class="text-xs text-gray-400 dark:text-gray-500 text-start" dir="ltr">{{ row.key }}</p>
                    </td>
                    <td class="px-4 py-3 align-top text-sm text-gray-700 dark:text-gray-300">
                      <p>{{ row.subjectTitle || subjectTitle(row.subject) }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ actionTitle(row.subject, row.action) }}</p>
                    </td>
                    <td class="px-4 py-3 align-top">
                      <div class="flex flex-wrap items-center gap-1">
                        <StatusBadge :meta="metaOf(DEFINITION_STATUS_META, row.status)" />
                        <UBadge v-if="row.draftChanged" color="warning" variant="subtle" size="xs">تغییر منتشرنشده</UBadge>
                      </div>
                    </td>
                    <td class="px-4 py-3 align-top text-sm text-gray-700 dark:text-gray-300">
                      <template v-if="row.publishedVersion">v{{ row.publishedVersion.toLocaleString('fa-IR') }}</template>
                      <template v-else>—</template>
                    </td>
                    <td class="px-4 py-3 align-top text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {{ formatJalali(row.updatedAt, { withTime: true }) || '—' }}
                    </td>
                    <td class="px-4 py-3 align-top text-end">
                      <UDropdownMenu :items="rowActions(row)" :ui="{ content: 'font-dana w-48' }">
                        <UButton
                          variant="ghost"
                          icon="i-heroicons-ellipsis-vertical"
                          size="xs"
                          color="neutral"
                          square
                          aria-label="عملیات فرایند"
                        />
                      </UDropdownMenu>
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
            icon="i-heroicons-squares-2x2"
            title="فرایندی پیدا نشد"
            text="با «فرایند جدید» یک فرایند تأیید بسازید یا فرایندی را از فایل وارد کنید"
          />
        </Transition>
      </div>
    </UCard>

    <DefinitionCreateModal v-model:open="createOpen" :subjects="subjects" @done="openEditor" />
    <DefinitionImportModal v-model:open="importOpen" :subjects="subjects" @done="openEditor" />
    <DefinitionVersionsModal
      :open="versionsTarget !== null"
      :definition="versionsTarget"
      @update:open="(value) => { if (!value) versionsTarget = null }"
    />

    <PanelConfirmDialog
      :open="retireTarget !== null"
      title="بازنشسته کردن فرایند"
      :message="retireMessage"
      confirm-label="بازنشسته کن"
      confirm-color="error"
      :loading="acting"
      @update:open="(value) => { if (!value) retireTarget = null }"
      @confirm="confirmRetire"
    />

    <PanelConfirmDialog
      :open="deleteTarget !== null"
      title="حذف پیش‌نویس"
      :message="deleteMessage"
      confirm-label="حذف"
      confirm-color="error"
      :loading="acting"
      @update:open="(value) => { if (!value) deleteTarget = null }"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import WorkflowTabs from '@/components/panel/workflow/WorkflowTabs.vue'
import DefinitionCreateModal from '@/components/panel/workflow/DefinitionCreateModal.vue'
import DefinitionImportModal from '@/components/panel/workflow/DefinitionImportModal.vue'
import DefinitionVersionsModal from '@/components/panel/workflow/DefinitionVersionsModal.vue'
import { apiErrorMessage } from '~/utils/apiError.js'
import { metaOf, selectItems } from '~/utils/enumMeta.js'
import { formatJalali } from '~/utils/jalali.js'
import { DEFINITION_STATUS_META, isWorkflowUnavailable } from '~/utils/workflowMeta.js'

// Process definitions of the store (C22a/C22b, module WORKFLOW_DESIGN): `GET api/admin/workflow/definitions` through `usePagedList`
// (0-based, last changed first; `steps` is empty in the list). The route name of this file is `panel-workflow-definitions`
// (BindModal links to it by that name). Row menu: edit, versions + BPMN, export JSON, retire (PUBLISHED), delete (DRAFT, never published).
const PAGE_SIZE = 20

const app = useNuxtApp()
const toast = useAppToast()
const { download } = useFileDownload()

const {
  subjects,
  loaded: subjectsLoaded,
  failed: subjectsFailed,
  load: loadSubjects,
  subjectTitle,
  actionTitle,
} = useWorkflowSubjects()

// 'all' = no filter (an empty value is not allowed on a select item)
const filters = reactive({ status: 'all', subject: 'all' })

const statusOptions = selectItems(DEFINITION_STATUS_META, 'همه وضعیت‌ها')
const subjectOptions = computed(() => [
  { value: 'all', label: 'همه موجودیت‌ها' },
  ...subjects.value.map((subject) => ({ value: subject.code, label: subject.title || subject.code })),
])

const { items, total, totalPages, page, loading, error, reload } = usePagedList(
  ({ page: backendPage, size }) => {
    const params = { page: backendPage, size }
    if (filters.status !== 'all') params.status = filters.status
    if (filters.subject !== 'all') params.subject = filters.subject
    return app.$api.workflow.listDefinitions({ params })
  },
  { size: PAGE_SIZE, filters }
)

// 403 (no grant) or 404 (workflow not switched on for this store) = unavailable, not an error to retry
const unavailable = computed(() => isWorkflowUnavailable(error.value))

onMounted(loadSubjects)

const editPath = (row) => `/panel/workflow/definitions/${row.id}`
const openEditor = (definition) => navigateTo(editPath(definition))

// ---------- modals ----------
const createOpen = ref(false)
const importOpen = ref(false)
const versionsTarget = ref(null)

// ---------- export JSON ----------
// The body of BACK's export is the create body, so a file saved here can be imported again. `download` (useFileDownload) makes the
// object URL, clicks the link and revokes it.
async function exportJson(row) {
  try {
    const res = await app.$api.workflow.exportDefinition(row.id)
    const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' })
    await download(Promise.resolve({ data: blob }), `${row.key}.json`)
  } catch (e) {
    toast.error(apiErrorMessage(e, 'دریافت خروجی فرایند ناموفق بود'))
  }
}

// ---------- row menu ----------
const rowActions = (row) => {
  const main = [
    {
      label: row.status === 'RETIRED' ? 'مشاهده' : 'ویرایش',
      icon: row.status === 'RETIRED' ? 'i-heroicons-eye' : 'i-heroicons-pencil-square',
      onSelect: () => navigateTo(editPath(row)),
    },
  ]
  if (row.publishedVersion) {
    main.push({ label: 'نسخه‌ها و BPMN', icon: 'i-heroicons-rectangle-stack', onSelect: () => (versionsTarget.value = row) })
  }
  main.push({ label: 'خروجی JSON', icon: 'i-heroicons-arrow-down-tray', onSelect: () => exportJson(row) })

  // BACK: retire = PUBLISHED only; delete = a definition that was never published (status DRAFT)
  const danger = []
  if (row.status === 'PUBLISHED') {
    danger.push({
      label: 'بازنشسته کردن',
      icon: 'i-heroicons-archive-box',
      color: 'error',
      onSelect: () => (retireTarget.value = row),
    })
  }
  if (row.status === 'DRAFT') {
    danger.push({ label: 'حذف', icon: 'i-heroicons-trash', color: 'error', onSelect: () => (deleteTarget.value = row) })
  }
  return danger.length ? [main, danger] : [main]
}

// ---------- retire (not reversible) ----------
const acting = ref(false)
const retireTarget = ref(null)
const retireMessage = computed(() =>
  retireTarget.value
    ? `فرایند «${retireTarget.value.title}» بازنشسته شود؟ این کار برگشت‌پذیر نیست: فرایند شروع تازه نمی‌گیرد و فقط اجراهای در جریان ادامه می‌دهند. برای ادامه باید فرایند تازه بسازید. اگر کاری به این فرایند متصل باشد، اول اتصال را بردارید.`
    : ''
)

async function confirmRetire() {
  const row = retireTarget.value
  if (!row || acting.value) return
  acting.value = true
  try {
    await app.$api.workflow.retireDefinition(row.id)
    retireTarget.value = null
    toast.success('فرایند بازنشسته شد')
    await reload()
  } catch (e) {
    // 409: not published any more, or still bound to an action (BACK's message says which)
    toast.error(apiErrorMessage(e, 'بازنشسته کردن فرایند ناموفق بود'))
  } finally {
    acting.value = false
  }
}

// ---------- delete (a draft that was never published) ----------
const deleteTarget = ref(null)
const deleteMessage = computed(() =>
  deleteTarget.value ? `پیش‌نویس «${deleteTarget.value.title}» حذف شود؟ این کار برگشت‌پذیر نیست.` : ''
)

async function confirmDelete() {
  const row = deleteTarget.value
  if (!row || acting.value) return
  acting.value = true
  try {
    await app.$api.workflow.deleteDefinition(row.id)
    const lastOnPage = items.value.length === 1 && page.value > 1
    deleteTarget.value = null
    toast.success('پیش‌نویس حذف شد')
    // The last row of a later page: step back (the page watcher loads); otherwise reload this page
    if (lastOnPage) page.value -= 1
    else await reload()
  } catch (e) {
    toast.error(apiErrorMessage(e, 'حذف پیش‌نویس ناموفق بود'))
  } finally {
    acting.value = false
  }
}

useHead({ title: 'طراحی فرایندها | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
