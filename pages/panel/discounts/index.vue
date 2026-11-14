<!-- pages/panel/discounts/index.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader icon="i-heroicons-ticket" title="کدهای" accent="تخفیف">
      <template #actions>
        <UButton color="primary" size="lg" icon="i-heroicons-plus" @click="openCreate">کد تخفیف جدید</UButton>
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
            title="دسترسی به کدهای تخفیف ندارید"
          />

          <PanelEmptyState
            v-else-if="error"
            key="error"
            variant="error"
            title="دریافت کدهای تخفیف ناموفق بود"
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
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">کد</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">نوع / مقدار</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">حداقل خرید</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">اعتبار</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">استفاده</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">وضعیت</th>
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
                      <p dir="ltr" class="text-sm font-mono font-semibold text-gray-900 dark:text-white text-start">
                        {{ row.code }}
                      </p>
                      <p v-if="row.description" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {{ row.description }}
                      </p>
                    </td>
                    <td class="px-6 py-3 align-top">
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ DISCOUNT_TYPE_LABELS[row.type] ?? row.type }}</p>
                      <p class="text-sm text-gray-700 dark:text-gray-300">{{ discountValueText(row) }}</p>
                    </td>
                    <td class="px-6 py-3 align-top text-sm text-gray-700 dark:text-gray-300">
                      {{ row.minPurchaseAmount ? formatMoney(row.minPurchaseAmount) : '—' }}
                    </td>
                    <td class="px-6 py-3 align-top text-xs text-gray-600 dark:text-gray-400">
                      {{ validityText(row) }}
                    </td>
                    <td class="px-6 py-3 align-top text-sm text-gray-700 dark:text-gray-300">
                      {{ (row.usedCount ?? 0).toLocaleString('fa-IR') }}
                      /
                      {{ row.usageLimit ? row.usageLimit.toLocaleString('fa-IR') : '∞' }}
                    </td>
                    <td class="px-6 py-3 align-top">
                      <StatusBadge :meta="discountState(row)" />
                    </td>
                    <td class="px-6 py-3 align-top text-end">
                      <UDropdownMenu :items="[rowActions(row)]" :ui="{ content: 'font-dana w-44' }">
                        <UButton
                          variant="ghost"
                          icon="i-heroicons-ellipsis-vertical"
                          size="xs"
                          color="neutral"
                          square
                          aria-label="عملیات کد تخفیف"
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
            icon="i-heroicons-ticket"
            title="هنوز کد تخفیفی ندارید"
          />
        </Transition>
      </div>
    </UCard>

    <DiscountFormModal
      v-model:open="formOpen"
      :discount="editing"
      @saved="reload"
    />

    <PanelConfirmDialog
      :open="deleteTarget !== null"
      title="حذف کد تخفیف"
      :message="deleteTarget ? `کد «${deleteTarget.code}» حذف شود؟ سفارش‌های قبلی دست نمی‌خورند.` : ''"
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
import DiscountFormModal from '@/components/panel/discounts/DiscountFormModal.vue'
import { formatMoney } from '~/utils/money.js'
import { apiErrorMessage } from '~/utils/apiError.js'
import { DISCOUNT_TYPE_LABELS, discountState, discountValueText } from '~/utils/discountMeta.js'
import { formatJalali } from '~/utils/jalali.js'

const app = useNuxtApp()
const toast = useAppToast()

const PAGE_SIZE = 20

const deleteTarget = ref(null)
const deleting = ref(false)

// 0-based BACK paging behind the 1-based UPagination; newest first comes from the server.
const { items, total, totalPages, page, loading, error, forbidden, reload } = usePagedList(
  ({ page: backendPage, size }) => app.$api.commerceAdmin.listDiscountCodes({ params: { page: backendPage, size } }),
  { size: PAGE_SIZE }
)

// «از ۱۴۰۵/۰۱/۰۱ ۰۰:۰۰ تا …»; no dates at all = «بدون محدودیت»
const validityText = (row) => {
  if (!row.startsAt && !row.endsAt) return 'بدون محدودیت'
  const from = row.startsAt ? formatJalali(row.startsAt, { withTime: true }) : null
  const to = row.endsAt ? formatJalali(row.endsAt, { withTime: true }) : null
  if (from && to) return `${from} تا ${to}`
  return from ? `از ${from}` : `تا ${to}`
}

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

const rowActions = (row) => [
  { label: 'ویرایش', icon: 'i-heroicons-pencil-square', onSelect: () => openEdit(row) },
  { label: 'حذف', icon: 'i-heroicons-trash', color: 'error', onSelect: () => (deleteTarget.value = row) },
]

const confirmDelete = async () => {
  deleting.value = true
  try {
    await app.$api.commerceAdmin.deleteDiscountCode(deleteTarget.value.id)
    deleteTarget.value = null
    toast.success('کد تخفیف حذف شد')
    await reload()
  } catch (e) {
    toast.error(apiErrorMessage(e, 'حذف کد تخفیف ناموفق بود'))
  } finally {
    deleting.value = false
  }
}

useHead({ title: 'کدهای تخفیف | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
