<!-- components/panel/pages/TermsTab.vue -->
<template>
  <div>
    <div class="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
      <USelect v-model="filters.type" :items="typeOptions" size="sm" class="w-44" />
      <USelect v-model="filters.status" :items="statusOptions" size="sm" class="w-44" />
      <UButton color="primary" icon="i-heroicons-plus" class="ms-auto" @click="openNew">
        نسخه‌ی جدید
      </UButton>
    </div>

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="i in 3" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-48" />
              <USkeleton class="h-3 w-32" />
            </div>
            <USkeleton class="h-5 w-16 rounded-full" />
          </div>
        </div>

        <PanelEmptyState
          v-else-if="forbidden"
          key="forbidden"
          variant="forbidden"
          title="دسترسی به قوانین ندارید"
        />

        <PanelEmptyState
          v-else-if="error"
          key="error"
          variant="error"
          title="دریافت قوانین ناموفق بود"
        >
          <template #action>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
              تلاش دوباره
            </UButton>
          </template>
        </PanelEmptyState>

        <div v-else-if="items.length" key="content" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">عنوان</th>
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">نوع</th>
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">وضعیت</th>
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">تاریخ اجرا</th>
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">انتشار</th>
                <th class="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in items"
                :key="row.id"
                class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
              >
                <td class="px-6 py-3 align-top">
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ row.title }}</p>
                  <p dir="ltr" class="text-xs font-mono text-gray-500 dark:text-gray-400 text-start">{{ row.version }}</p>
                </td>
                <td class="px-6 py-3 align-top text-sm text-gray-700 dark:text-gray-300">{{ termsTypeLabel(row.type) }}</td>
                <td class="px-6 py-3 align-top">
                  <StatusBadge :meta="termsStatusMeta(row.status)" />
                </td>
                <td class="px-6 py-3 align-top text-xs text-gray-600 dark:text-gray-400">
                  {{ formatJalali(row.effectiveDate) || '—' }}
                </td>
                <td class="px-6 py-3 align-top text-xs text-gray-600 dark:text-gray-400">
                  {{ formatJalali(row.publishedAt, { withTime: true }) || '—' }}
                </td>
                <td class="px-6 py-3 align-top text-end">
                  <UDropdownMenu :items="[rowActions(row)]" :ui="{ content: 'font-dana w-48' }">
                    <UButton
                      variant="ghost"
                      icon="i-heroicons-ellipsis-vertical"
                      size="xs"
                      color="neutral"
                      square
                      aria-label="عملیات نسخه"
                    />
                  </UDropdownMenu>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <PanelEmptyState
          v-else
          key="empty"
          icon="i-heroicons-document-text"
          title="هنوز نسخه‌ای ندارید"
          text="با این فیلترها نسخه‌ای پیدا نشد"
        />
      </Transition>
    </div>

    <TermsFormModal
      :open="formOpen"
      :terms="editing"
      :prefill="prefill"
      @update:open="(value) => { formOpen = value }"
      @saved="load"
    />

    <PanelConfirmDialog
      :open="pending !== null"
      :title="confirmCopy.title"
      :message="confirmCopy.message"
      :confirm-label="confirmCopy.label"
      :confirm-color="confirmCopy.color"
      :loading="busy"
      @update:open="(value) => { if (!value) pending = null }"
      @confirm="runPending"
    />
  </div>
</template>

<script setup>
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import TermsFormModal from '@/components/panel/pages/TermsFormModal.vue'
import { apiErrorMessage, errorStatus, isPending } from '~/utils/apiError.js'
import { selectItems } from '~/utils/enumMeta.js'
import { formatJalali } from '~/utils/jalali.js'
import { TERMS_STATUS_META, TERMS_TYPE_LABELS, termsStatusMeta, termsTypeLabel } from '~/utils/termsMeta.js'

// Terms versions of this store (TERMS): drafts are edited, a published or archived text is fixed and changing it means a
// new version. The list is unpaged; every action reloads it so the publish that archives the previous version shows at once.
const app = useNuxtApp()
const toast = useAppToast()

const typeOptions = selectItems(TERMS_TYPE_LABELS, 'همه‌ی نوع‌ها')
const statusOptions = selectItems(TERMS_STATUS_META, 'همه‌ی وضعیت‌ها')

const filters = reactive({ type: 'all', status: 'all' })
const items = ref([])
const loading = ref(true)
const error = ref(null)
const forbidden = ref(false)

const load = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.type !== 'all') params.type = filters.type
    if (filters.status !== 'all') params.status = filters.status
    const res = await app.$api.contentAdmin.listTermsAdmin({ params })
    items.value = res.data.data ?? []
    error.value = null
    forbidden.value = false
  } catch (e) {
    items.value = []
    forbidden.value = errorStatus(e) === 403
    error.value = forbidden.value ? null : e
  } finally {
    loading.value = false
  }
}

watch(filters, load, { deep: true })

// The form: `editing` is a fresh DRAFT read, `prefill` seeds a new version from another row
const formOpen = ref(false)
const editing = ref(null)
const prefill = ref(null)

const openNew = () => {
  editing.value = null
  prefill.value = null
  formOpen.value = true
}

const openNewFrom = (row) => {
  editing.value = null
  prefill.value = { type: row.type, title: row.title, content: row.content }
  formOpen.value = true
}

const openEdit = async (row) => {
  try {
    const res = await app.$api.contentAdmin.getTermsAdmin(row.id)
    editing.value = res.data.data
    prefill.value = null
    formOpen.value = true
  } catch (e) {
    toast.error(apiErrorMessage(e, 'دریافت پیش‌نویس ناموفق بود'))
  }
}

const rowActions = (row) => [
  ...(row.status === 'DRAFT'
    ? [{ label: 'ویرایش', icon: 'i-heroicons-pencil-square', onSelect: () => openEdit(row) }]
    : []),
  ...(row.status === 'DRAFT' || row.status === 'ARCHIVED'
    ? [{ label: 'انتشار', icon: 'i-heroicons-check-circle', onSelect: () => (pending.value = { kind: 'publish', row }) }]
    : []),
  ...(row.status === 'PUBLISHED'
    ? [{ label: 'لغو انتشار', icon: 'i-heroicons-no-symbol', onSelect: () => (pending.value = { kind: 'unpublish', row }) }]
    : []),
  { label: 'نسخه‌ی جدید', icon: 'i-heroicons-document-duplicate', onSelect: () => openNewFrom(row) },
  ...(row.status !== 'PUBLISHED'
    ? [{ label: 'حذف', icon: 'i-heroicons-trash', color: 'error', onSelect: () => (pending.value = { kind: 'delete', row }) }]
    : []),
]

// One confirm dialog for publish, unpublish and delete; `pending` says which action and row
const pending = ref(null)
const busy = ref(false)

const CONFIRM = {
  publish: {
    title: 'انتشار نسخه',
    label: 'انتشار',
    color: 'primary',
    message: (row) =>
      `نسخه‌ی «${row.title}» (${row.version}) منتشر شود؟ نسخه‌ی منتشرشده‌ی قبلی این نوع بایگانی می‌شود و کاربران باید نسخه‌ی تازه را بپذیرند.`,
    success: 'نسخه منتشر شد',
    fallback: 'انتشار نسخه ناموفق بود',
  },
  unpublish: {
    title: 'لغو انتشار',
    label: 'لغو انتشار',
    color: 'error',
    message: (row) => `انتشار «${row.title}» لغو شود؟ تا انتشار نسخه‌ی تازه، این نوع برای بازدیدکننده نسخه‌ای ندارد.`,
    success: 'انتشار لغو شد',
    fallback: 'لغو انتشار ناموفق بود',
  },
  delete: {
    title: 'حذف نسخه',
    label: 'حذف',
    color: 'error',
    message: (row) => `نسخه‌ی «${row.title}» (${row.version}) برای همیشه حذف شود؟`,
    success: 'نسخه حذف شد',
    fallback: 'حذف نسخه ناموفق بود',
  },
}

const confirmCopy = computed(() => {
  const current = pending.value
  if (!current) return { title: '', message: '', label: '', color: 'primary' }
  const copy = CONFIRM[current.kind]
  return { title: copy.title, message: copy.message(current.row), label: copy.label, color: copy.color }
})

const runPending = async () => {
  const current = pending.value
  if (!current || busy.value) return
  const copy = CONFIRM[current.kind]
  const id = current.row.id
  busy.value = true
  try {
    const api = app.$api.contentAdmin
    const res =
      current.kind === 'publish'
        ? await api.publishTerms(id)
        : current.kind === 'unpublish'
          ? await api.unpublishTerms(id)
          : await api.deleteTerms(id)
    pending.value = null
    if (!isPending(res)) toast.success(copy.success)
    load()
  } catch (e) {
    toast.error(apiErrorMessage(e, copy.fallback))
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
