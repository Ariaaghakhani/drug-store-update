<template>
  <PanelFormModal
    :open="open"
    title="ارسال رسید کارت به کارت"
    icon="i-heroicons-arrow-up-tray"
    submit-label="ارسال رسید"
    width="md"
    :loading="submitting"
    :submit-disabled="!file"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <div
      v-if="rejectReason"
      class="rounded-xl bg-error/10 dark:bg-error/20 p-3 space-y-1"
    >
      <p class="text-xs font-bold text-error">رسید قبلی رد شد</p>
      <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ rejectReason }}</p>
    </div>

    <p class="text-sm text-gray-600 dark:text-gray-300 leading-6">
      عکس یا PDF رسید واریز را بفرستید. فروشگاه بعد از بررسی، پرداخت را تأیید می‌کند.
    </p>

    <UFormField label="فایل رسید" :error="fileError || undefined">
      <div class="space-y-2">
        <div v-if="file" class="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2">
          <UIcon name="i-heroicons-document" class="w-4 h-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
          <span dir="ltr" class="text-xs text-gray-700 dark:text-gray-300 truncate min-w-0 flex-1">{{ file.name }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{{ fileSizeLabel }}</span>
        </div>
        <FilePickButton
          :label="file ? 'انتخاب فایل دیگر' : 'انتخاب عکس یا PDF رسید'"
          accept="image/*,application/pdf"
          :disabled="submitting"
          @pick="onPick"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400">
          حداکثر {{ MAX_MB.toLocaleString('fa-IR') }} مگابایت
        </p>
      </div>
    </UFormField>

    <p v-if="formError" role="alert" class="text-sm text-error">{{ formError }}</p>
  </PanelFormModal>
</template>

<script setup>
import FilePickButton from '@/components/panel/FilePickButton.vue'
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import { apiErrorMessage } from '~/utils/apiError.js'

// Uploads one card-to-card receipt (POST api/prescriptions/my/{id}/receipt, multipart field `file`). Only valid while the
// payment waits for a receipt; 409 closes the modal and reloads the prescription. Nothing is sent before a file is picked.
const MAX_MB = 10
const MAX_BYTES = MAX_MB * 1024 * 1024

const props = defineProps({
  open: { type: Boolean, required: true },
  prescriptionId: { type: [Number, String], required: true },
  // receiptRejectReason from the last rejected receipt (empty otherwise)
  rejectReason: { type: String, default: '' },
})
const emit = defineEmits(['update:open', 'done'])

const app = useNuxtApp()
const toast = useAppToast()

const file = ref(null)
const fileError = ref('')
const formError = ref('')
const submitting = ref(false)

const fileSizeLabel = computed(() =>
  file.value ? `${(file.value.size / (1024 * 1024)).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} مگابایت` : ''
)

const onPick = (picked) => {
  formError.value = ''
  const allowed = picked.type.startsWith('image/') || picked.type === 'application/pdf'
  if (!allowed) {
    fileError.value = 'فقط عکس یا فایل PDF ثبت می‌شود'
    return
  }
  if (picked.size > MAX_BYTES) {
    fileError.value = `حجم فایل بیش از ${MAX_MB.toLocaleString('fa-IR')} مگابایت است`
    return
  }
  fileError.value = ''
  file.value = picked
}

// Reset on every open, so a previous attempt does not leak into the next one
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    file.value = null
    fileError.value = ''
    formError.value = ''
  }
)

async function submit() {
  if (submitting.value || !file.value) return
  submitting.value = true
  formError.value = ''
  try {
    const data = new FormData()
    data.append('file', file.value)
    await app.$api.prescription.uploadPrescriptionReceipt(props.prescriptionId, { data })
    toast.success('رسید ارسال شد', 'بعد از بررسی فروشگاه، نتیجه را اینجا می‌بینید')
    emit('update:open', false)
    emit('done')
  } catch (error) {
    if (error?.response?.status === 409) {
      toast.error(apiErrorMessage(error, 'ارسال رسید ناموفق بود'))
      emit('update:open', false)
      emit('done')
    } else {
      formError.value = apiErrorMessage(error, 'ارسال رسید ناموفق بود')
    }
  } finally {
    submitting.value = false
  }
}
</script>
