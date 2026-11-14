<!-- components/panel/returns/ReturnApproveModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    title="تأیید مرجوعی"
    icon="i-heroicons-check-circle"
    submit-label="تأیید درخواست"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <UFormField label="نحوه‌ی برگشت کالا" required :error="errors.returnMethod">
      <URadioGroup v-model="returnMethod" :items="METHOD_ITEMS" orientation="vertical" />
    </UFormField>

    <UFormField
      label="توضیح برای مشتری"
      :help="`حداکثر ۵۰۰ کاراکتر (${note.length.toLocaleString('fa-IR')})`"
    >
      <UTextarea v-model="note" :maxlength="500" :rows="3" class="w-full" />
    </UFormField>
  </PanelFormModal>
</template>

<script setup>
// Approves a REQUESTED return with the way the goods come back. The note is shown to the customer.
// Emits `done` with { pending, dto }: a workflow-pending answer has no record, so the parent reloads instead.
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import { apiErrorMessage, isPending } from '~/utils/apiError.js'

const props = defineProps({
  open: { type: Boolean, required: true },
  returnId: { type: [Number, String], required: true },
})

const emit = defineEmits(['update:open', 'done'])

const app = useNuxtApp()
const toast = useAppToast()

const METHOD_ITEMS = Object.entries(RETURN_METHOD_LABELS).map(([value, label]) => ({ value, label }))

const returnMethod = ref(null)
const note = ref('')
const errors = ref({})
const serverError = ref('')
const saving = ref(false)

// Each open starts blank, so the previous decision never carries over.
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    returnMethod.value = null
    note.value = ''
    errors.value = {}
    serverError.value = ''
  }
)

const validate = () => {
  const next = {}
  if (!returnMethod.value) next.returnMethod = 'نحوه‌ی برگشت کالا را انتخاب کنید'
  errors.value = next
  return Object.keys(next).length === 0
}

const submit = async () => {
  serverError.value = ''
  if (!validate()) return
  saving.value = true
  try {
    const res = await app.$api.returns.approveReturn(props.returnId, {
      data: { returnMethod: returnMethod.value, note: note.value.trim() || undefined },
    })
    if (isPending(res)) {
      emit('done', { pending: true })
    } else {
      toast.success('مرجوعی تأیید شد')
      emit('done', { pending: false, dto: res.data.data })
    }
    emit('update:open', false)
  } catch (e) {
    // 409 (the request moved on) comes back translated from BACK; shown inline so the modal stays open
    serverError.value = apiErrorMessage(e, 'تأیید مرجوعی ناموفق بود')
  } finally {
    saving.value = false
  }
}
</script>
