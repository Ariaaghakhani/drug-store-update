<!-- components/panel/wallets/WalletAdjustModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    title="اصلاح موجودی کیف پول"
    icon="i-heroicons-banknotes"
    submit-label="ثبت اصلاح"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <UFormField label="نوع اصلاح" required>
      <URadioGroup v-model="direction" :items="DIRECTION_ITEMS" orientation="horizontal" />
    </UFormField>

    <MoneyInput
      v-model="amount"
      label="مبلغ"
      required
      :error="errors.amount"
      placeholder="۵۰۰٬۰۰۰"
    />

    <UFormField label="دلیل" required :error="errors.note" :help="`حداکثر ۵۰۰ کاراکتر (${note.length.toLocaleString('fa-IR')})`">
      <UTextarea v-model="note" :maxlength="500" :rows="3" class="w-full" />
    </UFormField>
  </PanelFormModal>
</template>

<script setup>
// Manual credit or debit of one customer's wallet. Sends a signed Rial amount (+ credit, − debit); BACK writes the reason to the ledger.
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import MoneyInput from '@/components/panel/MoneyInput.vue'
import { apiErrorMessage } from '~/utils/apiError.js'

const props = defineProps({
  open: { type: Boolean, required: true },
  personId: { type: [Number, String], required: true },
})

const emit = defineEmits(['update:open', 'saved'])

const app = useNuxtApp()
const toast = useAppToast()

const DIRECTION_ITEMS = [
  { label: 'افزایش موجودی', value: 'CREDIT' },
  { label: 'کاهش موجودی', value: 'DEBIT' },
]

const direction = ref('CREDIT')
const amount = ref(null)
const note = ref('')
const errors = ref({})
const serverError = ref('')
const saving = ref(false)

// Each open starts blank, so a previous adjustment never carries over.
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    direction.value = 'CREDIT'
    amount.value = null
    note.value = ''
    errors.value = {}
    serverError.value = ''
  }
)

const validate = () => {
  const next = {}
  if (amount.value === null || amount.value < 1) next.amount = 'مبلغ باید حداقل ۱ ریال باشد'
  if (!note.value.trim()) next.note = 'دلیل اصلاح را بنویسید'
  else if (note.value.length > 500) next.note = 'حداکثر ۵۰۰ کاراکتر'
  errors.value = next
  return Object.keys(next).length === 0
}

const submit = async () => {
  serverError.value = ''
  if (!validate()) return

  const sign = direction.value === 'DEBIT' ? -1 : 1
  saving.value = true
  try {
    await app.$api.commerceAdmin.adjustWallet(props.personId, {
      data: { amount: sign * amount.value, note: note.value.trim() },
    })
    toast.success('موجودی کیف پول اصلاح شد')
    emit('saved')
    emit('update:open', false)
  } catch (e) {
    // 409 wallet.insufficient comes back translated from BACK; shown inline so the form stays open
    serverError.value = apiErrorMessage(e, 'اصلاح موجودی ناموفق بود')
  } finally {
    saving.value = false
  }
}
</script>
