<!-- pages/panel/contact/index.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader icon="i-heroicons-envelope" title="پیام‌های" accent="تماس" subtitle="پیام‌های فرم تماس با ما">
      <template #actions>
        <UButton color="neutral" variant="outline" size="lg" icon="i-heroicons-bell-alert" @click="showSettings = true">
          تنظیمات اطلاع‌رسانی
        </UButton>
      </template>
    </PanelPageHeader>

    <UCard :ui="{ body: 'p-0' }">
      <div class="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <UInput
          v-model="searchText"
          :maxlength="100"
          icon="i-heroicons-magnifying-glass"
          placeholder="جستجو در موضوع، نام، ایمیل یا تلفن"
          class="w-72"
        />
        <USelect v-model="filters.status" :items="statusOptions" size="sm" class="w-44" />
      </div>

      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-40" />
                <USkeleton class="h-3 w-56" />
              </div>
              <USkeleton class="h-5 w-16 rounded-full" />
            </div>
          </div>

          <PanelEmptyState
            v-else-if="forbidden"
            key="forbidden"
            variant="forbidden"
            title="دسترسی به پیام‌های تماس ندارید"
          />

          <PanelEmptyState
            v-else-if="error"
            key="error"
            variant="error"
            title="دریافت پیام‌ها ناموفق بود"
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
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">فرستنده</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">موضوع</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">وضعیت</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in items"
                    :key="row.id"
                    :class="[
                      'border-b border-gray-100 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40',
                      row.status === 'NEW' && 'bg-brand-50/50 dark:bg-brand-900/10',
                    ]"
                  >
                    <td class="px-6 py-3 align-top">
                      <button
                        type="button"
                        class="text-start text-sm font-semibold text-gray-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400"
                        @click="openRow(row)"
                      >
                        {{ row.fullName }}
                      </button>
                      <p dir="ltr" class="text-xs text-gray-500 dark:text-gray-400 text-start">
                        {{ row.phone || row.email || '—' }}
                      </p>
                    </td>
                    <td class="px-6 py-3 align-top">
                      <p class="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">{{ row.subject }}</p>
                    </td>
                    <td class="px-6 py-3 align-top">
                      <StatusBadge :meta="contactStatusMeta(row.status)" />
                    </td>
                    <td class="px-6 py-3 align-top text-xs text-gray-600 dark:text-gray-400">
                      {{ formatJalali(row.createdAt, { withTime: true }) || '—' }}
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
            icon="i-heroicons-envelope"
            title="هنوز پیامی ندارید"
            text="با این فیلترها پیامی پیدا نشد"
          />
        </Transition>
      </div>
    </UCard>

    <ContactMessageModal
      :open="selected !== null"
      :message="selected"
      @update:open="(value) => { if (!value) selected = null }"
      @changed="applyRow"
      @stale="closeAndReload"
      @delete="requestDelete"
    />

    <ContactSettingsModal v-model:open="showSettings" />

    <PanelConfirmDialog
      :open="deleteTarget !== null"
      title="حذف پیام تماس"
      :message="deleteTarget ? `پیام «${deleteTarget.subject}» از ${deleteTarget.fullName} برای همیشه حذف شود؟` : ''"
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
import StatusBadge from '@/components/panel/StatusBadge.vue'
import ContactMessageModal from '@/components/panel/contact/ContactMessageModal.vue'
import ContactSettingsModal from '@/components/panel/contact/ContactSettingsModal.vue'
import { apiErrorMessage } from '~/utils/apiError.js'
import { CONTACT_STATUS_META, contactStatusMeta } from '~/utils/contactMeta.js'
import { selectItems } from '~/utils/enumMeta.js'
import { formatJalali } from '~/utils/jalali.js'

const app = useNuxtApp()
const toast = useAppToast()

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

// 'all' means no filter. The search box is debounced into `filters.q`, so typing does not fire a request per keystroke
const filters = reactive({ status: 'all', q: '' })
const searchText = ref('')
let searchTimer = null
watch(searchText, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    filters.q = value.trim()
  }, SEARCH_DEBOUNCE_MS)
})
onBeforeUnmount(() => clearTimeout(searchTimer))

const statusOptions = selectItems(CONTACT_STATUS_META, 'همه وضعیت‌ها')

// 0-based BACK paging behind the 1-based UPagination; a filter change jumps back to page 1
const { items, total, totalPages, page, loading, error, forbidden, reload } = usePagedList(
  ({ page: backendPage, size }) => {
    const params = { page: backendPage, size }
    if (filters.status !== 'all') params.status = filters.status
    if (filters.q) params.q = filters.q
    return app.$api.contentAdmin.listContactMessages({ params })
  },
  { size: PAGE_SIZE, filters }
)

const showSettings = ref(false)

// The open message. Opening a NEW one marks it READ, so the list and the detail agree
const selected = ref(null)

// Keeps the list row and the open detail in step with a saved DTO
const applyRow = (dto) => {
  if (!dto) return
  items.value = items.value.map((row) => (row.id === dto.id ? dto : row))
  if (selected.value?.id === dto.id) selected.value = dto
}

const openRow = async (row) => {
  selected.value = row
  if (row.status !== 'NEW') return
  try {
    const res = await app.$api.contentAdmin.setContactMessageStatus(row.id, { data: { status: 'READ' } })
    applyRow(res.data.data)
  } catch (e) {
    toast.error(apiErrorMessage(e, 'علامت‌گذاری پیام ناموفق بود'))
  }
}

// A write that landed behind a workflow answers pending: close the detail and re-read the list
const closeAndReload = () => {
  selected.value = null
  reload()
}

const deleteTarget = ref(null)
const deleting = ref(false)

const requestDelete = (row) => {
  selected.value = null
  deleteTarget.value = row
}

// Last row of a later page: step back, so the list is not left on an empty page
const afterRemoval = () => {
  if (items.value.length === 1 && page.value > 1) page.value -= 1
  else reload()
}

const confirmDelete = async () => {
  const row = deleteTarget.value
  if (!row) return
  deleting.value = true
  try {
    await app.$api.contentAdmin.deleteContactMessage(row.id)
    deleteTarget.value = null
    toast.success('پیام حذف شد')
    afterRemoval()
  } catch (e) {
    toast.error(apiErrorMessage(e, 'حذف پیام ناموفق بود'))
  } finally {
    deleting.value = false
  }
}

useHead({ title: 'پیام‌های تماس | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
