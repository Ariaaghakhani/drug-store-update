<!-- components/panel/orders/OrderRefundsCard.vue -->
<template>
  <div v-if="!forbidden" id="refunds" class="scroll-mt-4">
    <UCard :ui="{ body: 'p-0' }">
      <div class="flex items-center justify-between gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-banknotes" class="w-4 h-4 text-brand-500" />
          <h2 class="text-sm font-medium text-gray-900 dark:text-white">بازپرداخت‌های سفارش</h2>
        </div>
        <UButton color="neutral" variant="soft" size="sm" icon="i-heroicons-plus" @click="formOpen = true">
          ثبت بازپرداخت
        </UButton>
      </div>

      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-for="i in 2" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-40" />
                <USkeleton class="h-3 w-56" />
              </div>
              <USkeleton class="h-4 w-24" />
            </div>
          </div>

          <PanelEmptyState
            v-else-if="error"
            key="error"
            variant="error"
            title="دریافت بازپرداخت‌ها ناموفق بود"
          >
            <template #action>
              <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
                تلاش دوباره
              </UButton>
            </template>
          </PanelEmptyState>

          <div v-else-if="refunds.length" key="content" class="divide-y divide-gray-100 dark:divide-gray-800">
            <div
              v-for="refund in refunds"
              :key="refund.id"
              class="flex flex-wrap items-start gap-x-6 gap-y-2 px-4 sm:px-6 py-4"
            >
              <div class="flex-1 min-w-0 space-y-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ refundReasonLabel(refund.reason) }}
                  </span>
                  <StatusBadge :meta="metaOf(REFUND_STATUS_META, refund.status)" />
                  <UBadge v-if="refund.toWallet" color="info" variant="subtle" size="xs">به کیف پول</UBadge>
                  <WorkflowPendingBadge :state="refund.workflow" />
                </div>
                <p v-if="refund.reference" class="text-xs text-gray-500 dark:text-gray-400" dir="ltr">
                  شماره پیگیری: {{ refund.reference }}
                </p>
                <p v-if="refund.note" class="text-xs text-gray-500 dark:text-gray-400 whitespace-pre-line break-words">
                  {{ refund.note }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  ثبت: {{ formatJalali(refund.createdAt, { withTime: true }) }}
                  <template v-if="refund.paidAt"> · پرداخت: {{ formatJalali(refund.paidAt, { withTime: true }) }}</template>
                </p>
              </div>

              <div class="text-end space-y-2 flex-shrink-0">
                <p class="text-sm font-black text-gray-900 dark:text-white">{{ formatMoney(refund.amount) }}</p>
                <UButton
                  v-if="refund.status === 'PENDING'"
                  color="primary"
                  size="sm"
                  icon="i-heroicons-check"
                  :disabled="Boolean(refund.workflow?.pending)"
                  @click="payTarget = refund"
                >
                  پرداخت شد
                </UButton>
              </div>
            </div>
          </div>

          <PanelEmptyState
            v-else
            key="empty"
            icon="i-heroicons-banknotes"
            title="بازپرداختی برای این سفارش ثبت نشده است"
          />
        </Transition>
      </div>
    </UCard>

    <RefundFormModal v-model:open="formOpen" :order-id="orderId" @saved="load" />

    <PanelFormModal
      :open="payTarget !== null"
      title="ثبت پرداخت بازپرداخت"
      icon="i-heroicons-check-circle"
      submit-label="ثبت پرداخت"
      :loading="paying"
      @update:open="(isOpen) => { if (!isOpen) payTarget = null }"
      @submit="markPaid"
    >
      <p v-if="payError" class="text-sm text-error" role="alert">{{ payError }}</p>

      <p v-if="payTarget" class="text-sm text-gray-700 dark:text-gray-300">
        مبلغ {{ formatMoney(payTarget.amount) }} به مشتری برگردانده شد.
      </p>

      <UFormField label="شماره پیگیری واریز (اختیاری)" :help="`حداکثر ۱۰۰ نویسه`">
        <UInput v-model="reference" maxlength="100" dir="ltr" class="w-full" />
      </UFormField>

      <UFormField label="توضیح (اختیاری)" :help="`حداکثر ۵۰۰ کاراکتر (${note.length.toLocaleString('fa-IR')})`">
        <UTextarea v-model="note" :maxlength="500" :rows="2" class="w-full" />
      </UFormField>

      <label v-if="walletEnabled" class="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        <USwitch
          v-model="toWallet"
          size="lg"
          :ui="{
            base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
          }"
        />
        به کیف پول مشتری برگردد (فوری، بدون واریز بانکی)
      </label>
    </PanelFormModal>
  </div>
</template>

<script setup>
// Staff-only refunds card on the order page (`#refunds`). Lists the order's manual refunds and records «پرداخت شد»
// for the pending ones. The card hides itself on 403; load failures show the error state with a retry.
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import WorkflowPendingBadge from '@/components/panel/WorkflowPendingBadge.vue'
import RefundFormModal from '@/components/panel/orders/RefundFormModal.vue'
import { apiErrorMessage, isPending } from '~/utils/apiError.js'
import { metaOf } from '~/utils/enumMeta.js'
import { formatMoney } from '~/utils/money.js'
import { formatJalali } from '~/utils/jalali.js'

const props = defineProps({
  orderId: { type: [Number, String], required: true },
  walletEnabled: { type: Boolean, default: false },
})

const app = useNuxtApp()
const toast = useAppToast()

const refunds = ref([])
const loading = ref(true)
const error = ref(false)
const forbidden = ref(false)

const formOpen = ref(false)

// «پرداخت شد» state
const payTarget = ref(null) // the PENDING refund being paid, or null
const reference = ref('')
const note = ref('')
const toWallet = ref(false)
const payError = ref('')
const paying = ref(false)

// Every open of the paid form starts blank
watch(payTarget, (refund) => {
  if (!refund) return
  reference.value = ''
  note.value = ''
  toWallet.value = false
  payError.value = ''
})

async function load() {
  loading.value = true
  try {
    const response = await app.$api.orders.listOrderRefunds(props.orderId)
    refunds.value = response.data.data ?? []
    error.value = false
    forbidden.value = false
  } catch (e) {
    refunds.value = []
    forbidden.value = e?.response?.status === 403
    error.value = !forbidden.value
  } finally {
    loading.value = false
  }
}

async function markPaid() {
  if (!payTarget.value) return
  paying.value = true
  payError.value = ''
  const body = {
    reference: reference.value.trim() || undefined,
    note: note.value.trim() || undefined,
  }
  if (props.walletEnabled) body.toWallet = toWallet.value
  try {
    const res = await app.$api.orders.markOrderRefundPaid(payTarget.value.id, { data: body })
    payTarget.value = null
    if (!isPending(res)) toast.success('پرداخت بازپرداخت ثبت شد')
    await load()
  } catch (e) {
    payError.value = apiErrorMessage(e, 'ثبت پرداخت ناموفق بود')
  } finally {
    paying.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
