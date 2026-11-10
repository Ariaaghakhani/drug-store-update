<!-- components/panel/orders/RefundFormModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    title="ثبت بازپرداخت"
    icon="i-heroicons-banknotes"
    submit-label="ثبت بازپرداخت"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <MoneyInput
      v-model="amount"
      label="مبلغ بازپرداخت"
      required
      :error="errors.amount"
      placeholder="۵۰۰٬۰۰۰"
    />

    <UFormField label="دلیل" required :error="errors.reason">
      <USelect v-model="reason" :items="REASON_ITEMS" placeholder="انتخاب دلیل" class="w-full" />
    </UFormField>

    <UFormField label="توضیح (اختیاری)" :help="`حداکثر ۵۰۰ کاراکتر (${note.length.toLocaleString('fa-IR')})`">
      <UTextarea v-model="note" :maxlength="500" :rows="2" class="w-full" />
    </UFormField>
  </PanelFormModal>
</template>

<script setup>
// Manual refund of part or all of a paid order (e.g. a damaged item). Pending until «پرداخت شد» is recorded.
// The total of all refunds of the order cannot exceed the paid amount; BACK answers 409 when it would.
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import MoneyInput from '@/components/panel/MoneyInput.vue'
import { apiErrorMessage } from '~/utils/apiError.js'

const props = defineProps({
  open: { type: Boolean, required: true },
  orderId: { type: [Number, String], required: true },
})

const emit = defineEmits(['update:open', 'saved'])

const app = useNuxtApp()
const toast = useAppToast()

// RETURN belongs to a return's refund step, so this form does not offer it
const REASON_ITEMS = Object.entries(REFUND_REASON_LABELS)
  .filter(([value]) => value !== 'RETURN')
  .map(([value, label]) => ({ value, label }))

const amount = ref(null)
const reason = ref(null)
const note = ref('')
const errors = ref({})
const serverError = ref('')
const saving = ref(false)

// Each open starts blank, so a previous refund never carries over.
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    amount.value = null
    reason.value = null
    note.value = ''
    errors.value = {}
    serverError.value = ''
  }
)

const validate = () => {
  const next = {}
  if (amount.value === null || amount.value < 1) next.amount = 'مبلغ باید حداقل ۱ ریال باشد'
  if (!reason.value) next.reason = 'دلیل بازپرداخت را انتخاب کنید'
  if (note.value.length > 500) next.note = 'حداکثر ۵۰۰ کاراکتر'
  errors.value = next
  return Object.keys(next).length === 0
}

const submit = async () => {
  serverError.value = ''
  if (!validate()) return
  saving.value = true
  try {
    await app.$api.orders.createOrderRefund(props.orderId, {
      data: { amount: amount.value, reason: reason.value, note: note.value.trim() || undefined },
    })
    toast.success('بازپرداخت ثبت شد', 'تا زمان ثبت «پرداخت شد»، در انتظار پرداخت است')
    emit('saved')
    emit('update:open', false)
  } catch (e) {
    // 409 when the total of refunds would pass the paid amount: BACK's message, shown inline
    serverError.value = apiErrorMessage(e, 'ثبت بازپرداخت ناموفق بود')
  } finally {
    saving.value = false
  }
}
</script>
