<!-- components/panel/reports/ReportRunModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    :title="report?.title || report?.code || 'گزارش'"
    icon="i-heroicons-chart-bar"
    submit-label="نمایش"
    width="2xl"
    :loading="loadingData"
    :submit-disabled="busy"
    @update:open="emit('update:open', $event)"
    @submit="showData"
  >
    <p v-if="!paramEntries.length" class="text-sm text-gray-500 dark:text-gray-400">
      این گزارش پارامتری ندارد.
    </p>

    <div v-else class="grid gap-4 sm:grid-cols-2">
      <template v-for="[name, param] in paramEntries" :key="name">
        <div v-if="param.type === 'date' || param.type === 'jalali-date'">
          <JalaliDateInput v-model="values[name]" :label="paramLabel(name, param)" clearable />
          <p v-if="fieldError(name, param)" role="alert" class="mt-1 text-xs text-error">
            {{ fieldError(name, param) }}
          </p>
        </div>

        <UFormField
          v-else
          :label="paramLabel(name, param)"
          :error="fieldError(name, param) || undefined"
          :help="param.type === 'select' ? SELECT_HINT : undefined"
        >
          <UInput
            v-model="values[name]"
            :inputmode="param.type === 'number' ? 'decimal' : undefined"
            :dir="param.type === 'string' ? undefined : 'ltr'"
            autocomplete="off"
            class="w-full"
          />
        </UFormField>
      </template>
    </div>

    <p v-if="dataError" role="alert" class="text-sm text-error">{{ dataError }}</p>

    <!-- Result table: cells are always rendered as text, never as HTML -->
    <div v-if="result" class="space-y-2">
      <p class="text-xs text-gray-500 dark:text-gray-400">
        {{ result.rows.length.toLocaleString('fa-IR') }} ردیف
      </p>
      <div
        v-if="result.rows.length"
        class="max-h-96 overflow-auto rounded-xl border border-gray-200 dark:border-gray-700"
      >
        <table class="w-full">
          <thead class="sticky top-0 bg-gray-50 dark:bg-gray-800">
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th
                v-for="column in result.columns"
                :key="column"
                class="px-4 py-2 text-start text-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400"
              >
                {{ column }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in result.rows"
              :key="index"
              class="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/40"
            >
              <td
                v-for="column in result.columns"
                :key="column"
                class="px-4 py-2 text-sm whitespace-nowrap text-gray-700 dark:text-gray-300"
              >
                {{ cellText(row[column]) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
        با این پارامترها ردیفی پیدا نشد.
      </p>
    </div>

    <template #footer-start>
      <UButton
        color="neutral"
        variant="outline"
        icon="i-heroicons-arrow-down-tray"
        :loading="exporting"
        :disabled="busy"
        @click="exportExcel"
      >
        اکسل
      </UButton>
      <UButton
        v-if="report?.hasTemplate"
        color="neutral"
        variant="outline"
        icon="i-heroicons-document-text"
        :loading="openingPdf"
        :disabled="busy"
        @click="openPdf"
      >
        PDF
      </UButton>
    </template>
  </PanelFormModal>
</template>

<script setup>
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import JalaliDateInput from '@/components/panel/JalaliDateInput.vue'
import { apiErrorMessage } from '~/utils/apiError.js'
import { isoToJalali, jalaliToIso, toLatinDigits } from '~/utils/jalali.js'

// Runs one report of the store (POST api/report/*). On open it builds one input per parameter by its type, then:
// «نمایش» → POST api/report/data into a scrollable table, «اکسل» → generate EXCEL as `<code>.xlsx`, «PDF» (only when the
// report has a template) → generate PDF opened in a new tab through an object URL that is revoked after 60 s, and also
// when the modal closes or the page goes away.
const PDF_URL_LIFETIME_MS = 60_000
const SELECT_HINT = 'فهرست گزینه‌ها از سرور در دسترس نیست؛ شناسه را وارد کنید'
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/

const props = defineProps({
  open: { type: Boolean, required: true },
  // ReportSummaryDTO from api/report/all
  report: { type: Object, default: null },
})
const emit = defineEmits(['update:open'])

const app = useNuxtApp()
const toast = useAppToast()
const { download, previewUrl } = useFileDownload()

const paramEntries = computed(() => Object.entries(props.report?.parameters ?? {}))

const values = reactive({})
const attempted = ref(false)
const loadingData = ref(false)
const exporting = ref(false)
const openingPdf = ref(false)
const dataError = ref('')
const result = ref(null)

const busy = computed(() => loadingData.value || exporting.value || openingPdf.value)

const paramLabel = (name, param) => param.label || name

// ---- Defaults: BACK sends them as text in the parameter's own format ----
const defaultFor = (param) => {
  const raw = param.defaultValue
  if (raw === null || raw === undefined || String(raw).trim() === '') return ''
  const text = toLatinDigits(String(raw)).trim()
  if (param.type === 'date') return ISO_DATE.test(text) ? text : ''
  if (param.type === 'jalali-date') {
    const match = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/.exec(text)
    return match ? (jalaliToIso(match[1], match[2], match[3]) ?? '') : ''
  }
  return text
}

const resetForm = () => {
  const next = {}
  for (const [name, param] of paramEntries.value) next[name] = defaultFor(param)
  // Replace every key at once: parameters of the previously opened report disappear
  for (const key of Object.keys(values)) values[key] = undefined
  Object.assign(values, next)
  attempted.value = false
  dataError.value = ''
  result.value = null
}

// ---- Validation and the request's inputParams ----
const isBlank = (name) => String(values[name] ?? '').trim() === ''

const fieldError = (name, param) => {
  if (!attempted.value) return ''
  if (isBlank(name)) return param.required ? 'این فیلد الزامی است' : ''
  if (param.type === 'number' && !NUMBER_PATTERN.test(toLatinDigits(values[name]).trim())) {
    return 'یک عدد معتبر وارد کنید'
  }
  return ''
}

// jalali-date is sent as `1403/07/08` in Latin digits; date as the ISO day; blank parameters are left out so BACK
// applies the report's own default
const buildInputParams = () => {
  const inputParams = {}
  for (const [name, param] of paramEntries.value) {
    if (isBlank(name)) continue
    const value = String(values[name]).trim()
    if (param.type === 'jalali-date') {
      const parts = isoToJalali(value)
      if (!parts) continue
      inputParams[name] = `${parts.jy}/${String(parts.jm).padStart(2, '0')}/${String(parts.jd).padStart(2, '0')}`
    } else if (param.type === 'number') {
      inputParams[name] = toLatinDigits(value)
    } else {
      inputParams[name] = value
    }
  }
  return inputParams
}

// Returns the request's inputParams, or null (after turning the errors on) when the form is not valid
const validatedParams = () => {
  attempted.value = true
  const invalid = paramEntries.value.some(([name, param]) => fieldError(name, param))
  return invalid ? null : buildInputParams()
}

// ---- Table ----
const cellText = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'number') return value.toLocaleString('fa-IR')
  if (typeof value === 'boolean') return value ? 'بله' : 'خیر'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

async function showData() {
  const inputParams = validatedParams()
  if (!inputParams || busy.value) return
  loadingData.value = true
  dataError.value = ''
  try {
    const res = await app.$api.reports.getReportData({ data: { code: props.report.code, inputParams } })
    const data = res?.data?.data
    result.value = { columns: data?.columns ?? [], rows: data?.rows ?? [] }
  } catch (e) {
    result.value = null
    dataError.value = apiErrorMessage(e, 'دریافت گزارش ناموفق بود')
  } finally {
    loadingData.value = false
  }
}

// ---- Files ----
async function exportExcel() {
  const inputParams = validatedParams()
  if (!inputParams || busy.value) return
  exporting.value = true
  try {
    await download(
      app.$api.reports.generateReport({ data: { code: props.report.code, outputType: 'EXCEL', inputParams } }),
      `${props.report.code}.xlsx`
    )
  } finally {
    exporting.value = false
  }
}

// Object URLs of opened PDFs, each with its revoke timer
const pdfUrls = new Map()

const revokePdfUrl = (url) => {
  clearTimeout(pdfUrls.get(url))
  pdfUrls.delete(url)
  URL.revokeObjectURL(url)
}
const revokeAllPdfUrls = () => {
  for (const url of [...pdfUrls.keys()]) revokePdfUrl(url)
}

async function openPdf() {
  const inputParams = validatedParams()
  if (!inputParams || busy.value) return
  openingPdf.value = true
  // The tab is opened inside the click, before the request: a window opened after an await is blocked by browsers
  const tab = window.open('', '_blank')
  try {
    const url = await previewUrl(
      app.$api.reports.generateReport({ data: { code: props.report.code, outputType: 'PDF', inputParams } })
    )
    if (!url) {
      tab?.close()
      return
    }
    pdfUrls.set(url, setTimeout(() => revokePdfUrl(url), PDF_URL_LIFETIME_MS))
    const target = tab ?? window.open(url, '_blank')
    if (!target) {
      toast.warning('مرورگر باز شدن پنجره را مسدود کرد', 'اجازه باز کردن پنجره را بدهید و دوباره امتحان کنید')
      return
    }
    target.location.href = url
  } finally {
    openingPdf.value = false
  }
}

watch(
  () => [props.open, props.report?.code],
  ([open]) => {
    if (open) resetForm()
    else revokeAllPdfUrls()
  },
  { immediate: true }
)

onBeforeUnmount(revokeAllPdfUrls)
</script>
