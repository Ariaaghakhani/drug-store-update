<!-- components/panel/prescriptions/PrescriptionRespondModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    title="پاسخ به نسخه"
    icon="i-heroicons-chat-bubble-left-ellipsis"
    submit-label="ثبت پاسخ"
    width="lg"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <UFormField label="وضعیت داروها" required :error="errors.status">
      <URadioGroup v-model="form.status" :items="STATUS_ITEMS" orientation="vertical" />
    </UFormField>

    <UFormField
      label="توضیح برای مشتری"
      :help="`حداکثر ۱۰۰۰ کاراکتر (${form.note.length.toLocaleString('fa-IR')})`"
      :error="errors.note"
    >
      <UTextarea v-model="form.note" :maxlength="1000" :rows="3" class="w-full" placeholder="مثلاً: آموکسی‌سیلین نداریم، بقیه آماده است" />
    </UFormField>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <MoneyInput
        v-model="form.drugPrice"
        label="قیمت داروها"
        :error="errors.drugPrice"
      />
      <MoneyInput
        v-model="form.courierFee"
        label="هزینه‌ی پیک داروخانه"
        :error="errors.courierFee"
        help="فقط برای پیک داروخانه؛ اگر مشتری این روش را انتخاب کند به مبلغ قابل پرداخت اضافه می‌شود"
      />
    </div>
  </PanelFormModal>
</template>

<script setup>
// Staff answer to a prescription (module PRESCRIPTION). A new answer replaces the earlier one until the customer confirms.
// Emits `done` with { pending, dto }: a workflow-pending answer has no record, so the parent reloads instead.
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import MoneyInput from '@/components/panel/MoneyInput.vue'
import { apiErrorMessage, isPending } from '~/utils/apiError.js'

const props = defineProps({
  open: { type: Boolean, required: true },
  prescription: { type: Object, required: true },
})

const emit = defineEmits(['update:open', 'done'])

const app = useNuxtApp()
const toast = useAppToast()

// The four answers BACK accepts (PrescriptionStatus.RESPONSES)
const RESPONSE_STATUSES = ['AVAILABLE', 'PARTIALLY_AVAILABLE', 'UNAVAILABLE', 'INVALID']
const STATUS_ITEMS = [
  { value: 'AVAILABLE', label: 'همه‌ی داروها موجود است' },
  { value: 'PARTIALLY_AVAILABLE', label: 'بخشی از داروها موجود است' },
  { value: 'UNAVAILABLE', label: 'داروها موجود نیست' },
  { value: 'INVALID', label: 'نسخه ناخوانا یا نامعتبر است' },
]

const form = reactive({ status: null, note: '', drugPrice: null, courierFee: null })
const errors = ref({})
const serverError = ref('')
const saving = ref(false)

// Each open starts from the stored answer (a re-answer edits it), or blank when the prescription has none yet
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    const rx = props.prescription
    form.status = RESPONSE_STATUSES.includes(rx.status) ? rx.status : null
    form.note = rx.responseNote ?? ''
    form.drugPrice = rx.drugPrice ?? null
    form.courierFee = rx.courierFee ?? null
    errors.value = {}
    serverError.value = ''
  }
)

const validate = () => {
  const next = {}
  if (!form.status) next.status = 'وضعیت داروها را انتخاب کنید'
  if (form.note.length > 1000) next.note = 'حداکثر ۱۰۰۰ کاراکتر'
  errors.value = next
  return Object.keys(next).length === 0
}

const submit = async () => {
  serverError.value = ''
  if (!validate()) return
  saving.value = true
  try {
    const res = await app.$api.prescription.respondPrescription(props.prescription.id, {
      data: {
        status: form.status,
        note: form.note.trim() || null,
        drugPrice: form.drugPrice,
        courierFee: form.courierFee,
      },
    })
    if (isPending(res)) {
      emit('done', { pending: true })
    } else {
      toast.success('پاسخ ثبت شد')
      emit('done', { pending: false, dto: res.data.data })
    }
    emit('update:open', false)
  } catch (e) {
    // 409 (the customer already confirmed, or the prescription is cancelled) is shown inline; the modal stays open
    serverError.value = apiErrorMessage(e, 'ثبت پاسخ ناموفق بود')
  } finally {
    saving.value = false
  }
}
</script>
