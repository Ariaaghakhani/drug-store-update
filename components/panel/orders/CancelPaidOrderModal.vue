<!-- components/panel/orders/CancelPaidOrderModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    title="لغو سفارش پرداخت‌شده"
    icon="i-heroicons-x-circle"
    submit-label="لغو سفارش"
    submit-color="error"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <div class="flex items-start gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3">
      <UIcon name="i-heroicons-information-circle" class="w-5 h-5 mt-0.5 flex-shrink-0 text-info" />
      <p class="text-sm text-gray-700 dark:text-gray-300">
        سفارش لغو می‌شود و مشتری پیامک «لغو شد» می‌گیرد. مبلغ بازپرداخت در بخش بازپرداخت‌های سفارش در انتظار پرداخت ثبت
        می‌شود.
      </p>
    </div>

    <MoneyInput
      v-model="refundAmount"
      label="مبلغ بازپرداخت"
      help="خالی = کل مبلغ پرداخت‌شده، ۰ = بدون بازپرداخت"
      placeholder="خالی = کل مبلغ"
    />

    <label class="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
      <USwitch
        v-model="restock"
        size="lg"
        class="mt-0.5"
        :ui="{
          base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
        }"
      />
      <span>
        کالا به موجودی برگردد
        <span class="block text-xs text-gray-500 dark:text-gray-400">
          برای مرسوله‌ی گم‌شده یا خراب خاموش کنید
        </span>
      </span>
    </label>

    <UFormField label="توضیح (اختیاری)" :help="`حداکثر ۵۰۰ کاراکتر (${note.length.toLocaleString('fa-IR')})`">
      <UTextarea v-model="note" :maxlength="500" :rows="2" class="w-full" />
    </UFormField>
  </PanelFormModal>
</template>

<script setup>
// Cancels a PAID order that has not left the store (BACK rejects shipped or delivered orders with 409).
// Empty refund amount = the full paid amount; 0 = no refund. Restock is on by default.
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

const refundAmount = ref(null)
const restock = ref(true)
const note = ref('')
const serverError = ref('')
const saving = ref(false)

// Each open starts from the defaults, so a previous cancellation never carries over.
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    refundAmount.value = null
    restock.value = true
    note.value = ''
    serverError.value = ''
  }
)

const submit = async () => {
  serverError.value = ''
  if (note.value.length > 500) {
    serverError.value = 'توضیح حداکثر ۵۰۰ کاراکتر است'
    return
  }
  const body = { restock: restock.value }
  if (refundAmount.value !== null) body.refundAmount = refundAmount.value
  if (note.value.trim()) body.note = note.value.trim()

  saving.value = true
  try {
    await app.$api.orders.cancelPaidOrder(props.orderId, { data: body })
    toast.success('سفارش لغو شد')
    emit('saved')
    emit('update:open', false)
  } catch (e) {
    // 409 (shipped, delivered or not paid any more) comes back translated from BACK; shown inline
    serverError.value = apiErrorMessage(e, 'لغو سفارش ناموفق بود')
  } finally {
    saving.value = false
  }
}
</script>
