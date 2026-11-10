<!-- pages/panel/purchase-orders/index.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader icon="i-heroicons-clipboard-document-list" title="سفارش‌های" accent="خرید">
      <template #actions>
        <UButton color="primary" icon="i-heroicons-plus" to="/panel/purchase-orders/new">سفارش خرید جدید</UButton>
        <USelect v-model="filters.status" :items="statusOptions" size="sm" class="w-44" />
        <USelect
          v-if="suppliersAvailable"
          v-model="filters.supplierId"
          :items="supplierOptions"
          size="sm"
          class="w-56"
        />
      </template>
    </PanelPageHeader>

    <UCard :ui="{ body: 'p-0' }">
      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-32" />
                <USkeleton class="h-3 w-56" />
              </div>
              <USkeleton class="h-5 w-16 rounded-full" />
            </div>
          </div>

          <PanelEmptyState
            v-else-if="forbidden"
            key="forbidden"
            variant="forbidden"
            title="دسترسی به سفارش‌های خرید ندارید"
          />

          <PanelEmptyState
            v-else-if="error"
            key="error"
            variant="error"
            title="دریافت سفارش‌های خرید ناموفق بود"
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
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">شماره</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">تأمین‌کننده</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">وضعیت</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">مبلغ</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">تاریخ ثبت</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">تاریخ مورد انتظار</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in items"
                    :key="row.id"
                    class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td class="px-6 py-3 align-top">
                      <NuxtLink
                        :to="`/panel/purchase-orders/${row.id}`"
                        class="text-sm font-semibold text-gray-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400"
                      >
                        #{{ row.id.toLocaleString('fa-IR') }}
                      </NuxtLink>
                    </td>
                    <td class="px-6 py-3 align-top text-sm text-gray-700 dark:text-gray-300">
                      {{ row.supplierName || '—' }}
                    </td>
                    <td class="px-6 py-3 align-top">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <StatusBadge :meta="poStatusMeta(row.status)" />
                        <WorkflowPendingBadge :state="row.workflow" />
                      </div>
                    </td>
                    <td class="px-6 py-3 align-top text-sm text-gray-700 dark:text-gray-300">
                      {{ formatMoney(row.totalAmount) }}
                    </td>
                    <td class="px-6 py-3 align-top text-xs text-gray-600 dark:text-gray-400">
                      {{ formatJalali(row.dateCreated) || '—' }}
                    </td>
                    <td class="px-6 py-3 align-top text-xs text-gray-600 dark:text-gray-400">
                      {{ formatJalali(row.dateExpected) || '—' }}
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
            icon="i-heroicons-clipboard-document-list"
            title="سفارش خریدی پیدا نشد"
            text="با این فیلترها سفارش خریدی ثبت نشده است"
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
import WorkflowPendingBadge from '@/components/panel/WorkflowPendingBadge.vue'
import { formatMoney } from '~/utils/money.js'
import { formatJalali } from '~/utils/jalali.js'
import { PO_STATUS_META } from '~/utils/purchaseOrderMeta.js'
import { metaOf, selectItems } from '~/utils/enumMeta.js'

const app = useNuxtApp()

const PAGE_SIZE = 20

// Filter values: 'all' means no filter. The request sends a filter only when it is set.
const filters = reactive({ status: 'all', supplierId: 'all' })

const statusOptions = selectItems(PO_STATUS_META, 'همه وضعیت‌ها')
const poStatusMeta = (status) => metaOf(PO_STATUS_META, status)

// Suppliers feed the filter only. When they fail to load (or the user cannot read them) the filter is hidden.
const suppliers = ref([])
const suppliersAvailable = ref(false)
const supplierOptions = computed(() => [
  { value: 'all', label: 'همه تأمین‌کنندگان' },
  ...suppliers.value.map((supplier) => ({ value: String(supplier.id), label: supplier.name })),
])

// BACK pages purchase orders 1-based, so the 1-based UPagination goes straight through (backendBase: 1).
const { items, total, totalPages, page, loading, error, forbidden, reload } = usePagedList(
  ({ page: backendPage, size }) => {
    const data = { page: backendPage, size }
    if (filters.status !== 'all') data.status = filters.status
    if (filters.supplierId !== 'all') data.supplierId = Number(filters.supplierId)
    return app.$api.orders.listPurchaseOrders({ data })
  },
  { size: PAGE_SIZE, filters, backendBase: 1 }
)

onMounted(async () => {
  try {
    const res = await app.$api.organization.listSuppliers()
    suppliers.value = res?.data?.data ?? []
    suppliersAvailable.value = true
  } catch {
    suppliersAvailable.value = false
  }
})

useHead({ title: 'سفارش‌های خرید | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
