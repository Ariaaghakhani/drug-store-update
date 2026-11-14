<!-- pages/panel/imports/index.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader icon="i-heroicons-arrow-up-tray" title="ورود" accent="گروهی" subtitle="کالا، عکس و موجودی اولیه از فایل" />

    <p class="text-sm text-gray-600 dark:text-gray-300 leading-6">
      ترتیب: ۱ کالاها، ۲ عکس‌ها، ۳ موجودی اولیه. کالاها باید قبل از عکس و موجودی وارد شده باشند.
    </p>

    <!-- Card 1: goods Excel -->
    <UCard v-if="canGoods" :ui="{ body: 'p-0' }">
      <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <UIcon name="i-heroicons-cube" class="w-4 h-4 text-brand-500" />
        <h2 class="text-sm font-medium text-gray-900 dark:text-white">۱. ورود کالاها</h2>
      </div>
      <div class="px-4 sm:px-6 py-5 space-y-5">
        <p class="text-sm text-gray-600 dark:text-gray-300 leading-6">
          فایل قالب را پر کنید و آپلود کنید. ردیف‌های ناموفق در گزارش می‌آیند و بقیه‌ی فایل ثبت می‌شود.
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            color="neutral"
            variant="outline"
            icon="i-heroicons-arrow-down-tray"
            :loading="downloadingGoodsTemplate"
            :disabled="uploadingGoods"
            @click="downloadGoodsTemplate"
          >
            دانلود قالب
          </UButton>
          <FilePickButton
            label="انتخاب فایل اکسل"
            accept=".xlsx"
            :loading="uploadingGoods"
            @pick="uploadGoods"
          />
        </div>
        <ImportResultSummary
          v-if="goodsResult"
          :counts="goodsCounts"
          :errors="goodsResult.errors ?? []"
          :columns="GOODS_ERROR_COLUMNS"
        />
      </div>
    </UCard>

    <!-- Card 2: goods images -->
    <UCard v-if="canGoods" :ui="{ body: 'p-0' }">
      <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <UIcon name="i-heroicons-photo" class="w-4 h-4 text-brand-500" />
        <h2 class="text-sm font-medium text-gray-900 dark:text-white">۲. عکس‌های کالا</h2>
      </div>
      <div class="px-4 sm:px-6 py-5 space-y-5">
        <p class="text-sm text-gray-600 dark:text-gray-300 leading-6">
          نام هر فایل کد کالاست: <span dir="ltr" class="font-mono">12345.jpg</span> عکس اصلی و
          <span dir="ltr" class="font-mono">12345-2.jpg</span> و
          <span dir="ltr" class="font-mono">12345-3.jpg</span> عکس‌های بعدی. فایل‌ها را انتخاب کنید و بعد آپلود کنید.
        </p>

        <label class="flex items-center justify-between gap-3">
          <span class="text-sm text-gray-700 dark:text-gray-300">جایگزینی عکس‌های قبلی</span>
          <USwitch
            v-model="replaceImages"
            size="lg"
            :disabled="uploadingImages"
            :ui="{
              base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
            }"
          />
        </label>

        <div class="flex flex-wrap items-center gap-2">
          <FilePickButton
            label="انتخاب عکس‌ها"
            accept="image/*"
            multiple
            :disabled="uploadingImages"
            @pick="pickImages"
          />
          <UButton
            v-if="pendingImages.length"
            color="neutral"
            variant="ghost"
            icon="i-heroicons-x-mark"
            :disabled="uploadingImages"
            @click="pendingImages = []"
          >
            پاک کردن انتخاب
          </UButton>
        </div>

        <div v-if="pendingImages.length" class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3">
          <p class="text-sm text-gray-700 dark:text-gray-300">
            {{ pendingImages.length.toLocaleString('fa-IR') }} فایل · {{ pendingSizeLabel }}
          </p>
          <UButton
            color="primary"
            icon="i-heroicons-cloud-arrow-up"
            :loading="uploadingImages"
            @click="uploadImages"
          >
            آپلود {{ pendingImages.length.toLocaleString('fa-IR') }} عکس
          </UButton>
        </div>

        <template v-if="imagesResult">
          <ImportResultSummary :counts="imageCounts" :errors="[]" :columns="[]" />

          <div class="max-h-96 overflow-auto rounded-xl border border-gray-100 dark:border-gray-800">
            <table class="w-full">
              <thead class="sticky top-0 bg-gray-50 dark:bg-gray-800">
                <tr class="border-b border-gray-100 dark:border-gray-800">
                  <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-2">فایل</th>
                  <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-2">کالا</th>
                  <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-2">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(file, index) in imagesResult.files ?? []"
                  :key="`${file.fileName}-${index}`"
                  class="border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                  <td class="px-4 py-2 text-xs font-mono text-gray-700 dark:text-gray-300" dir="ltr">{{ file.fileName }}</td>
                  <td class="px-4 py-2 text-sm">
                    <NuxtLink
                      v-if="file.goodsId"
                      :to="`/panel/products/${file.goodsId}`"
                      class="font-mono text-brand-600 dark:text-brand-400 hover:underline"
                      dir="ltr"
                    >
                      {{ file.goodCode }}
                    </NuxtLink>
                    <span v-else dir="ltr" class="font-mono text-gray-500 dark:text-gray-400">{{ file.goodCode || '—' }}</span>
                  </td>
                  <td class="px-4 py-2">
                    <span v-if="file.error" class="text-xs text-error">{{ file.error }}</span>
                    <StatusBadge v-else :meta="imageStatusMeta(file)" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </UCard>

    <!-- Card 3: opening stock -->
    <UCard v-if="canInventory" :ui="{ body: 'p-0' }">
      <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <UIcon name="i-heroicons-archive-box" class="w-4 h-4 text-brand-500" />
        <h2 class="text-sm font-medium text-gray-900 dark:text-white">۳. موجودی اولیه</h2>
      </div>
      <div class="px-4 sm:px-6 py-5 space-y-5">
        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300 leading-6">
          <p>ستون‌های فایل اکسل (ردیف اول کلید ستون‌ها است):</p>
          <ul class="list-disc ps-5 space-y-1">
            <li><span dir="ltr" class="font-mono">good_code</span> کد کالا</li>
            <li><span dir="ltr" class="font-mono">batch_number</span> شماره بچ</li>
            <li><span dir="ltr" class="font-mono">expiry_date</span> تاریخ انقضا به میلادی، به شکل <span dir="ltr" class="font-mono">yyyy-MM-dd</span></li>
            <li><span dir="ltr" class="font-mono">quantity</span> تعداد</li>
          </ul>
          <p>برای هر ردیف یک بچ ساخته و موجودی به انبار پیش‌فرض اضافه می‌شود. کالاها باید قبلاً وارد شده باشند.</p>
        </div>

        <FilePickButton
          label="انتخاب فایل اکسل موجودی"
          accept=".xlsx"
          :loading="uploadingStock"
          @pick="uploadStock"
        />

        <ImportResultSummary
          v-if="stockResult"
          :counts="stockCounts"
          :errors="stockResult.errors ?? []"
          :columns="STOCK_ERROR_COLUMNS"
        />
      </div>
    </UCard>

    <PanelEmptyState
      v-if="!canGoods && !canInventory"
      variant="forbidden"
      title="دسترسی به ورود گروهی ندارید"
    />
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import FilePickButton from '@/components/panel/FilePickButton.vue'
import ImportResultSummary from '@/components/panel/ImportResultSummary.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import { apiErrorMessage, errorStatus } from '~/utils/apiError.js'

const app = useNuxtApp()
const toast = useAppToast()
const { download } = useFileDownload()
const { canRead } = useModuleAccess()

// Cards show by module: the goods and image imports need GOODS, the opening stock import needs INVENTORY
const canGoods = computed(() => canRead('GOODS'))
const canInventory = computed(() => canRead('INVENTORY'))

const GOODS_ERROR_COLUMNS = [
  { key: 'rowNumber', label: 'سطر' },
  { key: 'goodCode', label: 'کد کالا', ltr: true },
  { key: 'nameFa', label: 'نام کالا' },
  { key: 'message', label: 'علت' },
]

const STOCK_ERROR_COLUMNS = [
  { key: 'rowNumber', label: 'سطر' },
  { key: 'goodCode', label: 'کد کالا', ltr: true },
  { key: 'message', label: 'علت' },
]

const formatFileSize = (bytes) => {
  const megabytes = bytes / (1024 * 1024)
  if (megabytes >= 1) return `${megabytes.toLocaleString('fa-IR', { maximumFractionDigits: 1 })} مگابایت`
  return `${Math.max(1, Math.round(bytes / 1024)).toLocaleString('fa-IR')} کیلوبایت`
}

// ---- Card 1: goods Excel ----
const goodsResult = ref(null)
const uploadingGoods = ref(false)
const downloadingGoodsTemplate = ref(false)

const goodsCounts = computed(() => {
  const data = goodsResult.value
  if (!data) return []
  return [
    { label: 'کل ردیف‌ها', value: data.totalRows, color: 'neutral' },
    { label: 'ثبت‌شده', value: data.successCount, color: 'success' },
    { label: 'خطا', value: data.errors?.length ?? 0, color: 'error' },
  ]
})

const downloadGoodsTemplate = async () => {
  downloadingGoodsTemplate.value = true
  await download(app.$api.catalogAdmin.downloadGoodsTemplate(), 'goods-template.xlsx')
  downloadingGoodsTemplate.value = false
}

// RAW endpoint: the summary is res.data. A 400 (no file) answers the same shape in error.response.data
const uploadGoods = async (file) => {
  uploadingGoods.value = true
  try {
    const data = new FormData()
    data.append('file', file)
    const res = await app.$api.catalogAdmin.importGoodsExcel({ data })
    goodsResult.value = res.data
    toast.success(`${(res.data.successCount ?? 0).toLocaleString('fa-IR')} کالا ثبت شد`)
  } catch (e) {
    if (errorStatus(e) === 400 && Array.isArray(e.response?.data?.errors)) goodsResult.value = e.response.data
    toast.error(apiErrorMessage(e, 'ورود فایل ناموفق بود'))
  } finally {
    uploadingGoods.value = false
  }
}

// ---- Card 2: goods images ----
// Picks wait here until «آپلود»; a failed upload keeps the selection so it can be retried
const pendingImages = ref([])
const replaceImages = ref(false)
const imagesResult = ref(null)
const uploadingImages = ref(false)

const pendingSizeLabel = computed(() =>
  formatFileSize(pendingImages.value.reduce((total, file) => total + file.size, 0))
)

const imageCounts = computed(() => {
  const data = imagesResult.value
  if (!data) return []
  return [
    { label: 'فایل‌ها', value: data.totalFiles, color: 'neutral' },
    { label: 'متصل‌شده', value: data.attachedCount, color: 'success' },
    { label: 'ناموفق', value: data.failedCount, color: 'error' },
  ]
})

// Primary is the main image of the product; the other files are extra photos
const imageStatusMeta = (file) =>
  file.primary ? { label: 'عکس اصلی', color: 'success' } : { label: 'عکس فرعی', color: 'neutral' }

const pickImages = (files) => {
  pendingImages.value = files
}

const uploadImages = async () => {
  if (!pendingImages.value.length) return
  uploadingImages.value = true
  try {
    const data = new FormData()
    pendingImages.value.forEach((file) => data.append('files', file))
    data.append('replaceExisting', replaceImages.value ? 'true' : 'false')
    const res = await app.$api.catalogAdmin.importGoodsImages({ data })
    imagesResult.value = res.data.data
    pendingImages.value = []
    toast.success(`${(imagesResult.value?.attachedCount ?? 0).toLocaleString('fa-IR')} عکس متصل شد`)
  } catch (e) {
    toast.error(apiErrorMessage(e, 'آپلود عکس‌ها ناموفق بود'))
  } finally {
    uploadingImages.value = false
  }
}

// ---- Card 3: opening stock ----
const stockResult = ref(null)
const uploadingStock = ref(false)

const stockCounts = computed(() => {
  const data = stockResult.value
  if (!data) return []
  return [
    { label: 'کل ردیف‌ها', value: data.totalRows, color: 'neutral' },
    { label: 'ثبت‌شده', value: data.successCount, color: 'success' },
    { label: 'خطا', value: data.errors?.length ?? 0, color: 'error' },
  ]
})

const uploadStock = async (file) => {
  uploadingStock.value = true
  try {
    const data = new FormData()
    data.append('file', file)
    const res = await app.$api.catalogAdmin.importOpeningStock({ data })
    stockResult.value = res.data
    toast.success(`${(res.data.successCount ?? 0).toLocaleString('fa-IR')} ردیف موجودی ثبت شد`)
  } catch (e) {
    if (errorStatus(e) === 400 && Array.isArray(e.response?.data?.errors)) stockResult.value = e.response.data
    toast.error(apiErrorMessage(e, 'ورود فایل موجودی ناموفق بود'))
  } finally {
    uploadingStock.value = false
  }
}

useHead({ title: 'ورود گروهی | پنل مدیریت' })
</script>
