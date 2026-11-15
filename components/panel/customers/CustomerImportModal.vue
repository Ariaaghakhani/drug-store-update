<!-- components/panel/customers/CustomerImportModal.vue -->
<template>
  <UModal
    :open="open"
    :dismissible="!uploading"
    :title="'ورود مشتریان از اکسل'"
    :ui="{ content: 'sm:max-w-2xl' }"
    @update:open="onOpenChange"
  >
    <template #body>
      <div dir="rtl" class="space-y-5 font-dana">
        <p class="text-sm text-gray-600 dark:text-gray-300 leading-6">
          سطر اول عنوان ستون‌ها و از سطر دوم داده است: موبایل، نام، نام خانوادگی، پیامک تبلیغاتی (بله / خیر)، یادداشت.
          موبایل‌های تکراری یا موجود در باشگاه رد می‌شوند و بقیه‌ی فایل ثبت می‌شود.
        </p>

        <div class="flex flex-wrap items-center gap-2">
          <UButton
            color="neutral"
            variant="outline"
            icon="i-heroicons-arrow-down-tray"
            :loading="downloadingTemplate"
            :disabled="uploading"
            @click="downloadTemplate"
          >
            دانلود قالب
          </UButton>
          <FilePickButton
            label="انتخاب فایل اکسل"
            accept=".xlsx"
            :loading="uploading"
            @pick="upload"
          />
        </div>

        <ImportResultSummary
          v-if="result"
          :counts="resultCounts"
          :errors="result.errors ?? []"
          :columns="ERROR_COLUMNS"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex w-full items-center gap-2" dir="rtl">
        <UButton class="ms-auto" color="neutral" variant="soft" :disabled="uploading" @click="onOpenChange(false)">
          بستن
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup>
// Excel import for the store customer club. The file is uploaded on pick; the result stays in the modal.
// The parent reloads its list on `imported` once the modal closes, if at least one customer was created.
import FilePickButton from '@/components/panel/FilePickButton.vue'
import ImportResultSummary from '@/components/panel/ImportResultSummary.vue'
import { apiErrorMessage } from '~/utils/apiError.js'

const props = defineProps({
  open: { type: Boolean, required: true },
})

const emit = defineEmits(['update:open', 'imported'])

const app = useNuxtApp()
const toast = useAppToast()
const { download } = useFileDownload()

const ERROR_COLUMNS = [
  { key: 'rowNumber', label: 'سطر' },
  { key: 'phone', label: 'موبایل', ltr: true },
  { key: 'message', label: 'علت' },
]

const result = ref(null)
const uploading = ref(false)
const downloadingTemplate = ref(false)
// Set when any import in this session created customers; read on close
const createdAny = ref(false)

const resultCounts = computed(() => {
  const data = result.value
  if (!data) return []
  return [
    { label: 'کل ردیف‌ها', value: data.totalRows, color: 'neutral' },
    { label: 'ثبت‌شده', value: data.created, color: 'success' },
    { label: 'تکراری / موجود', value: data.skipped, color: 'warning' },
    { label: 'خطا', value: data.errors?.length ?? 0, color: 'error' },
  ]
})

// Every open starts clean; the created flag lives until the modal closes
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      result.value = null
      createdAny.value = false
    }
  }
)

const onOpenChange = (value) => {
  if (!value && createdAny.value) emit('imported')
  emit('update:open', value)
}

const downloadTemplate = async () => {
  downloadingTemplate.value = true
  await download(app.$api.crm.downloadCustomerTemplate(), 'store-customers-template.xlsx')
  downloadingTemplate.value = false
}

const upload = async (file) => {
  uploading.value = true
  try {
    const data = new FormData()
    data.append('file', file)
    const res = await app.$api.crm.importStoreCustomers({ data })
    result.value = res.data.data
    if ((result.value?.created ?? 0) > 0) createdAny.value = true
    toast.success(`${(result.value?.created ?? 0).toLocaleString('fa-IR')} مشتری ثبت شد`)
  } catch (e) {
    toast.error(apiErrorMessage(e, 'ورود فایل ناموفق بود'))
  } finally {
    uploading.value = false
  }
}
</script>
