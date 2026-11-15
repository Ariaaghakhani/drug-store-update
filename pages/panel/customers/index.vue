<!-- pages/panel/customers/index.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader icon="i-heroicons-user-group" title="باشگاه" accent="مشتریان" subtitle="مشتری‌های حضوری فروشگاه">
      <template #actions>
        <template v-if="canAdmin">
          <UButton color="neutral" variant="outline" icon="i-heroicons-arrow-up-tray" @click="importOpen = true">
            ورود از اکسل
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-heroicons-arrow-down-tray"
            :loading="exporting"
            @click="exportExcel"
          >
            خروجی اکسل
          </UButton>
        </template>
        <UButton color="primary" icon="i-heroicons-plus" @click="openCreate">ثبت مشتری</UButton>
      </template>
    </PanelPageHeader>

    <UCard :ui="{ body: 'p-0' }">
      <div class="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <UInput
          v-model="searchText"
          size="sm"
          placeholder="جستجوی نام یا موبایل"
          icon="i-heroicons-magnifying-glass"
          class="w-56"
        />
        <USelect v-model="filters.marketing" :items="marketingOptions" size="sm" class="w-44" />
        <USelect v-model="filters.source" :items="sourceOptions" size="sm" class="w-44" />
      </div>

      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-32" />
                <USkeleton class="h-3 w-40" />
              </div>
              <USkeleton class="h-5 w-16 rounded-full" />
            </div>
          </div>

          <PanelEmptyState
            v-else-if="forbidden"
            key="forbidden"
            variant="forbidden"
            title="دسترسی به باشگاه مشتریان ندارید"
          />

          <PanelEmptyState
            v-else-if="error"
            key="error"
            variant="error"
            title="دریافت مشتری‌ها ناموفق بود"
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
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">نام</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">موبایل</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">پیامک تبلیغاتی</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">منبع</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">تاریخ تولد</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">تاریخ ثبت</th>
                    <th class="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in items"
                    :key="row.id"
                    class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td class="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                      {{ fullName(row) }}
                    </td>
                    <td class="px-6 py-3 text-sm font-mono text-gray-700 dark:text-gray-300" dir="ltr">
                      {{ row.phone }}
                    </td>
                    <td class="px-6 py-3">
                      <StatusBadge :meta="marketingSmsMeta(row.marketingSms)" />
                    </td>
                    <td class="px-6 py-3">
                      <StatusBadge :meta="storeCustomerSourceMeta(row.source)" />
                    </td>
                    <td class="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {{ row.birthDate ? formatJalali(row.birthDate) : '—' }}
                    </td>
                    <td class="px-6 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {{ formatJalali(row.createdAt) }}
                    </td>
                    <td class="px-6 py-3 text-end">
                      <div class="flex items-center justify-end gap-1">
                        <UButton
                          color="neutral"
                          variant="ghost"
                          square
                          size="xs"
                          icon="i-heroicons-pencil-square"
                          aria-label="ویرایش مشتری"
                          @click="openEdit(row)"
                        />
                        <UButton
                          v-if="canAdmin"
                          color="error"
                          variant="ghost"
                          square
                          size="xs"
                          icon="i-heroicons-trash"
                          aria-label="حذف مشتری"
                          @click="deleteTarget = row"
                        />
                      </div>
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
            icon="i-heroicons-user-group"
            :title="hasFilters ? 'مشتری‌ای پیدا نشد' : 'هنوز مشتری‌ای در باشگاه ثبت نشده'"
            :text="hasFilters ? 'با این فیلترها مشتری‌ای ثبت نشده است' : 'مشتری‌های حضوری را ثبت کنید یا از فایل اکسل وارد کنید'"
          />
        </Transition>
      </div>
    </UCard>

    <StoreCustomerFormModal
      v-model:open="formOpen"
      :customer="editing"
      @saved="reload"
    />

    <CustomerImportModal
      v-if="canAdmin"
      v-model:open="importOpen"
      @imported="reload"
    />

    <PanelConfirmDialog
      :open="deleteTarget !== null"
      title="حذف مشتری"
      :message="deleteTarget ? `«${fullName(deleteTarget)}» از باشگاه مشتریان حذف شود؟` : ''"
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
import StatusBadge from '@/components/panel/StatusBadge.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import StoreCustomerFormModal from '@/components/panel/customers/StoreCustomerFormModal.vue'
import CustomerImportModal from '@/components/panel/customers/CustomerImportModal.vue'
import { apiErrorMessage } from '~/utils/apiError.js'
import { formatJalali } from '~/utils/jalali.js'
import { marketingSmsMeta, storeCustomerSourceMeta } from '~/utils/storeCustomerMeta.js'

const app = useNuxtApp()
const toast = useAppToast()
const { download } = useFileDownload()

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

// 'all' means no filter. The query string carries a filter only when it is set.
const filters = reactive({ q: '', marketing: 'all', source: 'all' })

// The search box is debounced into `filters.q`, so typing does not fire a request per keystroke
const searchText = ref('')
let searchTimer = null
watch(searchText, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    filters.q = value.trim()
  }, SEARCH_DEBOUNCE_MS)
})
onBeforeUnmount(() => clearTimeout(searchTimer))

const marketingOptions = [
  { value: 'all', label: 'همه پیامک‌ها' },
  { value: 'true', label: 'دریافت می‌کنند' },
  { value: 'false', label: 'لغو کرده‌اند' },
]
const sourceOptions = [
  { value: 'all', label: 'همه منابع' },
  { value: 'IN_STORE', label: 'ثبت در فروشگاه' },
  { value: 'IMPORT', label: 'فایل اکسل' },
]

const hasFilters = computed(() => Boolean(filters.q) || filters.marketing !== 'all' || filters.source !== 'all')

// 0-based BACK paging behind the 1-based UPagination; newest first comes from the server.
const { items, total, totalPages, page, loading, error, forbidden, reload } = usePagedList(
  ({ page: backendPage, size }) => {
    const params = { page: backendPage, size }
    if (filters.q) params.q = filters.q
    if (filters.marketing !== 'all') params.marketingSms = filters.marketing === 'true'
    if (filters.source !== 'all') params.source = filters.source
    return app.$api.crm.listStoreCustomers({ params })
  },
  { size: PAGE_SIZE, filters }
)

const fullName = (row) => [row.firstName, row.lastName].filter(Boolean).join(' ')

// ---------- create / edit ----------
const formOpen = ref(false)
const editing = ref(null)

const openCreate = () => {
  editing.value = null
  formOpen.value = true
}

const openEdit = (row) => {
  editing.value = row
  formOpen.value = true
}

// ---------- delete, import and export (STORE_CUSTOMER_ADMIN; BACK decides, the buttons only hide when the grant is known to be missing) ----------
const { canRead } = useModuleAccess()
const canAdmin = computed(() => canRead('STORE_CUSTOMER_ADMIN'))

const importOpen = ref(false)
const exporting = ref(false)

const exportExcel = async () => {
  exporting.value = true
  await download(app.$api.crm.exportStoreCustomers(), 'store-customers.xlsx')
  exporting.value = false
}

const deleteTarget = ref(null)
const deleting = ref(false)

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await app.$api.crm.deleteStoreCustomer(deleteTarget.value.id)
    deleteTarget.value = null
    toast.success('مشتری حذف شد')
    // Last row of a later page: step back, so the list is not left on an empty page
    if (items.value.length === 1 && page.value > 1) page.value -= 1
    else reload()
  } catch (e) {
    toast.error(apiErrorMessage(e, 'حذف مشتری ناموفق بود'))
  } finally {
    deleting.value = false
  }
}

useHead({ title: 'باشگاه مشتریان | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
