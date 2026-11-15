<!-- components/panel/returns/ReturnRefundModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    title="بازپرداخت مرجوعی"
    icon="i-heroicons-banknotes"
    submit-label="ثبت بازپرداخت"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <div class="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3 text-sm">
      <p class="text-xs text-gray-500 dark:text-gray-400">مبلغ پیشنهادی بازپرداخت</p>
      <p class="font-semibold text-gray-900 dark:text-white mt-0.5">{{ formatMoney(ret?.suggestedRefund ?? 0) }}</p>
    </div>

    <MoneyInput
      v-model="amount"
      label="مبلغ بازپرداخت"
      help="خالی = مبلغ پیشنهادی، ۰ = بدون بازپرداخت"
      placeholder="خالی = پیشنهادی"
    />

    <UFormField label="توضیح (اختیاری)" :help="`حداکثر ۵۰۰ کاراکتر (${note.length.toLocaleString('fa-IR')})`">
      <UTextarea v-model="note" :maxlength="500" :rows="2" class="w-full" />
    </UFormField>
  </PanelFormModal>
</template>

<script setup>
// Records the refund of a RECEIVED return and closes it. Empty amount = suggestedRefund (omitted from the body), 0 = no refund.
// BACK records the refund as PENDING (reason RETURN); it is paid from the order's refunds card.
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import MoneyInput from '@/components/panel/MoneyInput.vue'
import { formatMoney } from '~/utils/money.js'
import { apiErrorMessage, isPending } from '~/utils/apiError.js'

const props = defineProps({
  open: { type: Boolean, required: true },
  ret: { type: Object, default: null },
})

const emit = defineEmits(['update:open', 'done'])

const app = useNuxtApp()
const toast = useAppToast()

const amount = ref(null)
const note = ref('')
const serverError = ref('')
const saving = ref(false)

// Each open starts with an empty amount (= the suggested one), so a previous entry never carries over.
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    amount.value = null
    note.value = ''
    serverError.value = ''
  }
)

const submit = async () => {
  serverError.value = ''
  const body = {}
  if (amount.value !== null) body.amount = amount.value
  if (note.value.trim()) body.note = note.value.trim()

  saving.value = true
  try {
    const res = await app.$api.returns.refundReturn(props.ret.id, { data: body })
    if (isPending(res)) {
      emit('done', { pending: true })
    } else {
      toast.success('بازپرداخت ثبت شد', 'در بخش بازپرداخت‌های سفارش، پس از پرداخت به مشتری علامت بزنید')
      emit('done', { pending: false, dto: res.data.data })
    }
    emit('update:open', false)
  } catch (e) {
    serverError.value = apiErrorMessage(e, 'ثبت بازپرداخت ناموفق بود')
  } finally {
    saving.value = false
  }
}
</script>
