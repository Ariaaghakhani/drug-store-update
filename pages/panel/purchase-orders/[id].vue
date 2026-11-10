<!-- pages/panel/purchase-orders/[id].vue -->
<template>
  <div class="space-y-5">
    <UButton to="/panel/purchase-orders" color="neutral" variant="outline" icon="i-heroicons-arrow-right">
      بازگشت به سفارش‌های خرید
    </UButton>

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="space-y-4">
          <USkeleton class="h-24 w-full rounded-xl" />
          <USkeleton class="h-48 w-full rounded-xl" />
        </div>

        <PanelEmptyState
          v-else-if="forbidden"
          key="forbidden"
          variant="forbidden"
          title="دسترسی به این سفارش خرید ندارید"
        />

        <PanelEmptyState
          v-else-if="notFound"
          key="not-found"
          icon="i-heroicons-clipboard-document-list"
          title="سفارش خرید پیدا نشد"
        />

        <PanelEmptyState
          v-else-if="error"
          key="error"
          variant="error"
          title="دریافت سفارش خرید ناموفق بود"
        >
          <template #action>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
              تلاش دوباره
            </UButton>
          </template>
        </PanelEmptyState>

        <div v-else-if="po" key="content" class="space-y-4">
          <PanelPageHeader
            icon="i-heroicons-clipboard-document-list"
            title="سفارش خرید"
            :accent="`#${po.id.toLocaleString('fa-IR')}`"
          >
            <template #actions>
              <UButton
                v-if="canEdit && !editing"
                color="neutral"
                variant="outline"
                icon="i-heroicons-pencil-square"
                :disabled="actionsDisabled"
                @click="editing = true"
              >
                ویرایش
              </UButton>
              <UButton
                v-if="canSubmit && !editing"
                color="primary"
                icon="i-heroicons-paper-airplane"
                :disabled="actionsDisabled"
                @click="confirmKey = 'submit'"
              >
                ثبت نهایی
              </UButton>
              <UButton
                v-if="canReceive && !editing"
                color="primary"
                icon="i-heroicons-archive-box-arrow-down"
                :disabled="actionsDisabled"
                @click="receiveOpen = true"
              >
                دریافت کالا
              </UButton>
              <UButton
                v-if="canCancel"
                color="error"
                variant="outline"
                icon="i-heroicons-x-circle"
                :disabled="actionsDisabled"
                @click="confirmKey = 'cancel'"
              >
                لغو
              </UButton>
              <UButton
                v-if="canClose"
                color="neutral"
                variant="outline"
                icon="i-heroicons-lock-closed"
                :disabled="actionsDisabled"
                @click="confirmKey = 'close'"
              >
                بستن سفارش
              </UButton>
              <UButton
                v-if="canDelete && !editing"
                color="error"
                variant="outline"
                icon="i-heroicons-trash"
                :disabled="actionsDisabled"
                @click="confirmKey = 'delete'"
              >
                حذف
              </UButton>
            </template>
          </PanelPageHeader>

          <UCard>
            <div class="flex items-center gap-2 flex-wrap">
              <StatusBadge :meta="poStatusMeta(po.status)" size="sm" />
              <WorkflowPendingBadge :state="po.workflow" />
            </div>

            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4 text-sm">
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">تأمین‌کننده</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ po.supplierName || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">ثبت‌کننده</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ po.createdBy || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">تاریخ ثبت</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ formatJalali(po.dateCreated) || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">تاریخ مورد انتظار</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ formatJalali(po.dateExpected) || '—' }}</dd>
              </div>
              <div v-if="po.note" class="sm:col-span-2">
                <dt class="text-xs text-gray-500 dark:text-gray-400">یادداشت</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5 whitespace-pre-line">{{ po.note }}</dd>
              </div>
            </dl>
          </UCard>

          <UCard v-if="editing">
            <PurchaseOrderForm :initial="po" :saving="saving" @submit="saveEdit" />
            <div class="flex items-center justify-end gap-2 mt-6">
              <UButton color="neutral" variant="soft" :disabled="saving" @click="editing = false">انصراف</UButton>
              <UButton type="submit" form="purchase-order-form" color="primary" :loading="saving" :disabled="saving">
                ذخیره تغییرات
              </UButton>
            </div>
          </UCard>

          <UCard v-else :ui="{ body: 'p-0' }">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">کد کالا</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">نام کالا</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">سفارش</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">رسیده</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">باقیمانده</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">پیشرفت</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">قیمت واحد</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">جمع سطر</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in po.items"
                    :key="item.id"
                    class="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td class="px-6 py-3 align-top">
                      <span dir="ltr" class="text-sm font-mono text-gray-900 dark:text-white">{{ item.goodsCode }}</span>
                    </td>
                    <td class="px-6 py-3 align-top text-sm text-gray-700 dark:text-gray-300">{{ item.goodsName }}</td>
                    <td class="px-6 py-3 align-top text-sm text-gray-700 dark:text-gray-300">
                      {{ (item.quantityOrdered ?? 0).toLocaleString('fa-IR') }}
                    </td>
                    <td class="px-6 py-3 align-top text-sm text-gray-700 dark:text-gray-300">
                      {{ (item.quantityReceived ?? 0).toLocaleString('fa-IR') }}
                    </td>
                    <td class="px-6 py-3 align-top text-sm text-gray-700 dark:text-gray-300">
                      {{ (item.remainingQuantity ?? 0).toLocaleString('fa-IR') }}
                    </td>
                    <td class="px-6 py-3 align-top">
                      <div class="flex items-center gap-2">
                        <div class="h-1.5 w-24 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div
                            class="h-full rounded-full bg-brand-500 dark:bg-brand-400"
                            :style="{ width: `${receivedPercent(item)}%` }"
                          />
                        </div>
                        <span class="text-xs text-gray-500 dark:text-gray-400">
                          {{ receivedPercent(item).toLocaleString('fa-IR') }}٪
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-3 align-top text-sm text-gray-700 dark:text-gray-300">
                      {{ formatMoney(item.unitCost) }}
                    </td>
                    <td class="px-6 py-3 align-top text-sm text-gray-900 dark:text-white">
                      {{ formatMoney(item.lineTotal) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="bg-gray-50 dark:bg-gray-800/50">
                    <td colspan="7" class="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">جمع کل سفارش</td>
                    <td class="px-6 py-3 text-sm font-bold text-gray-900 dark:text-white">
                      {{ formatMoney(po.totalAmount) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </UCard>
        </div>
      </Transition>
    </div>

    <ReceiveModal v-if="po" v-model:open="receiveOpen" :purchase-order="po" @done="onReceived" />

    <PanelConfirmDialog
      :open="confirmMeta !== null"
      :title="confirmMeta?.title ?? ''"
      :message="confirmMeta?.message ?? ''"
      :confirm-label="confirmMeta?.label ?? 'تأیید'"
      :confirm-color="confirmMeta?.color ?? 'primary'"
      :loading="busy"
      @update:open="(value) => { if (!value) confirmKey = null }"
      @confirm="onConfirm"
    />
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import WorkflowPendingBadge from '@/components/panel/WorkflowPendingBadge.vue'
import PurchaseOrderForm from '@/components/panel/purchase-orders/PurchaseOrderForm.vue'
import ReceiveModal from '@/components/panel/purchase-orders/ReceiveModal.vue'
import { formatMoney } from '~/utils/money.js'
import { formatJalali } from '~/utils/jalali.js'
import { apiErrorMessage, isPending } from '~/utils/apiError.js'
import { PO_STATUS_META } from '~/utils/purchaseOrderMeta.js'
import { metaOf } from '~/utils/enumMeta.js'

const app = useNuxtApp()
const route = useRoute()
const toast = useAppToast()

const id = Number(route.params.id)
const poStatusMeta = (status) => metaOf(PO_STATUS_META, status)

// Unpaged detail: local loading/error/forbidden/not-found states (same render order as the lists)
const po = ref(null)
const loading = ref(true)
const error = ref(null)
const forbidden = ref(false)
const notFound = ref(false)

const editing = ref(false)
const saving = ref(false)
const busy = ref(false)
const confirmKey = ref(null)
const receiveOpen = ref(false)

// Status gates: DRAFT edit/submit/delete, ORDERED cancel, PARTIALLY_RECEIVED close, CANCELLED delete
const status = computed(() => po.value?.status)
const canEdit = computed(() => status.value === 'DRAFT')
const canSubmit = computed(() => status.value === 'DRAFT')
const canCancel = computed(() => status.value === 'ORDERED')
const canClose = computed(() => status.value === 'PARTIALLY_RECEIVED')
const canDelete = computed(() => status.value === 'DRAFT' || status.value === 'CANCELLED')
const canReceive = computed(() => status.value === 'ORDERED' || status.value === 'PARTIALLY_RECEIVED')
// Every action waits while a workflow approval is pending on this order
const actionsDisabled = computed(() => busy.value || saving.value || po.value?.workflow?.pending === true)

const CONFIRMS = {
  submit: {
    title: 'ثبت نهایی سفارش خرید',
    message: 'پس از ثبت، سفارش به تأمین‌کننده ارسال می‌شود و دیگر قابل ویرایش نیست.',
    label: 'ثبت نهایی',
    color: 'primary',
  },
  cancel: {
    title: 'لغو سفارش خرید',
    message: 'این سفارش لغو شود؟',
    label: 'لغو سفارش',
    color: 'error',
  },
  close: {
    title: 'بستن سفارش خرید',
    message: 'باقیمانده دیگر دریافت نمی‌شود. سفارش بسته شود؟',
    label: 'بستن سفارش',
    color: 'warning',
  },
  delete: {
    title: 'حذف سفارش خرید',
    message: 'این سفارش خرید حذف شود؟ این کار برگشت‌پذیر نیست.',
    label: 'حذف',
    color: 'error',
  },
}
const confirmMeta = computed(() => (confirmKey.value ? CONFIRMS[confirmKey.value] : null))

const receivedPercent = (item) => {
  const ordered = Number(item.quantityOrdered) || 0
  if (ordered <= 0) return 0
  return Math.min(100, Math.round(((Number(item.quantityReceived) || 0) / ordered) * 100))
}

const load = async () => {
  loading.value = true
  if (!Number.isInteger(id) || id < 1) {
    notFound.value = true
    loading.value = false
    return
  }
  try {
    const res = await app.$api.orders.getPurchaseOrder({ data: { id } })
    po.value = res.data.data
    error.value = null
    forbidden.value = false
    notFound.value = false
  } catch (e) {
    po.value = null
    const httpStatus = e?.response?.status
    forbidden.value = httpStatus === 403
    notFound.value = httpStatus === 404
    error.value = forbidden.value || notFound.value ? null : e
  } finally {
    loading.value = false
  }
}

// Shared shape for the state actions: a pending workflow closes the dialog and reloads; otherwise the response is the new DTO.
const runAction = async (call, successText) => {
  busy.value = true
  try {
    const res = await call()
    if (isPending(res)) {
      await load()
      return
    }
    po.value = res.data.data
    toast.success(successText)
  } catch (e) {
    toast.error(apiErrorMessage(e, 'عملیات ناموفق بود'))
  } finally {
    busy.value = false
  }
}

const removePo = async () => {
  busy.value = true
  try {
    const res = await app.$api.orders.deletePurchaseOrder({ data: { id } })
    if (isPending(res)) {
      await load()
      return
    }
    toast.success('سفارش خرید حذف شد')
    await navigateTo('/panel/purchase-orders')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'حذف سفارش خرید ناموفق بود'))
  } finally {
    busy.value = false
  }
}

const onConfirm = async () => {
  const key = confirmKey.value
  if (!key) return
  // Close the dialog up front; the run keeps `busy` for the spinner
  confirmKey.value = null
  if (key === 'submit') {
    await runAction(() => app.$api.orders.submitPurchaseOrder({ data: { id } }), 'سفارش خرید ثبت نهایی شد')
  } else if (key === 'cancel') {
    await runAction(() => app.$api.orders.cancelPurchaseOrder({ data: { id } }), 'سفارش خرید لغو شد')
  } else if (key === 'close') {
    await runAction(() => app.$api.orders.closePurchaseOrder({ data: { id } }), 'سفارش خرید بسته شد')
  } else if (key === 'delete') {
    await removePo()
  }
}

// ReceiveModal saved: a pending workflow reloads; otherwise the response is the whole order again
const onReceived = async ({ pending, dto }) => {
  if (pending) {
    await load()
    return
  }
  po.value = dto
  toast.success('کالا در انبار ثبت شد')
}

// DRAFT edit: PUT with the id added to the form body
const saveEdit = async (body) => {
  if (saving.value) return
  saving.value = true
  try {
    const res = await app.$api.orders.updatePurchaseOrder({ data: { id, ...body } })
    editing.value = false
    if (isPending(res)) {
      await load()
      return
    }
    po.value = res.data.data
    toast.success('تغییرات سفارش خرید ذخیره شد')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'ذخیره تغییرات ناموفق بود'))
  } finally {
    saving.value = false
  }
}

onMounted(load)

useHead({ title: 'جزئیات سفارش خرید | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
