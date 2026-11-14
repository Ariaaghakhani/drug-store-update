<template>
  <form dir="rtl" class="space-y-6 font-dana" @submit.prevent="submit">
    <!-- بیمار -->
    <section class="space-y-3">
      <h4 class="text-sm font-bold text-gray-900 dark:text-white">بیمار</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="نام بیمار" required :error="errors.patientFirstName || undefined">
          <UInput v-model="form.patientFirstName" maxlength="100" class="w-full" />
        </UFormField>
        <UFormField label="نام خانوادگی بیمار" required :error="errors.patientLastName || undefined">
          <UInput v-model="form.patientLastName" maxlength="100" class="w-full" />
        </UFormField>
        <UFormField label="کد ملی بیمار" required :error="errors.patientNationalCode || undefined">
          <UInput
            v-model="form.patientNationalCode"
            inputmode="numeric"
            dir="ltr"
            autocomplete="off"
            maxlength="10"
            class="w-full"
          />
        </UFormField>
      </div>
    </section>

    <!-- نسخه: کد رهگیری یا عکس، حداقل یکی -->
    <section class="space-y-3">
      <h4 class="text-sm font-bold text-gray-900 dark:text-white">نسخه</h4>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        کد رهگیری نسخه‌ی الکترونیک را وارد کنید یا عکس (یا PDF) نسخه را بفرستید؛ حداقل یکی از این دو لازم است.
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <UFormField label="کد رهگیری نسخه" :error="errors.trackingCode || undefined">
          <UInput
            v-model="form.trackingCode"
            maxlength="30"
            dir="ltr"
            autocomplete="off"
            class="w-full"
          />
        </UFormField>

        <UFormField label="عکس یا PDF نسخه" :error="errors.image || undefined">
          <div class="space-y-2">
            <div v-if="image" class="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2">
              <UIcon name="i-heroicons-document" class="w-4 h-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
              <span dir="ltr" class="text-xs text-gray-700 dark:text-gray-300 truncate min-w-0 flex-1">{{ image.name }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{{ fileSizeLabel(image) }}</span>
              <UButton
                color="neutral"
                variant="ghost"
                square
                icon="i-heroicons-x-mark"
                aria-label="حذف فایل"
                @click="removeImage"
              />
            </div>
            <FilePickButton
              :label="image ? 'انتخاب فایل دیگر' : 'انتخاب عکس یا PDF'"
              accept="image/*,application/pdf"
              @pick="onPickImage"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400">
              حداکثر {{ IMAGE_MAX_MB.toLocaleString('fa-IR') }} مگابایت
            </p>
          </div>
        </UFormField>
      </div>
    </section>

    <!-- پزشک -->
    <section class="space-y-3">
      <h4 class="text-sm font-bold text-gray-900 dark:text-white">پزشک</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="نام پزشک" :error="errors.doctorName || undefined">
          <UInput v-model="form.doctorName" maxlength="200" class="w-full" />
        </UFormField>
        <UFormField label="شماره نظام پزشکی" :error="errors.doctorLicense || undefined">
          <UInput v-model="form.doctorLicense" maxlength="50" dir="ltr" class="w-full" />
        </UFormField>
        <JalaliDateInput
          v-model="form.dateIssued"
          label="تاریخ صدور نسخه"
          clearable
        />
        <p v-if="errors.dateIssued" class="text-xs text-error sm:col-span-2">{{ errors.dateIssued }}</p>
      </div>
    </section>

    <!-- بیمه -->
    <section class="space-y-3">
      <h4 class="text-sm font-bold text-gray-900 dark:text-white">بیمه</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="بیمه‌ی پایه">
          <USelect v-model="form.insuranceId" :items="basicItems" class="w-full" />
        </UFormField>
        <UFormField label="بیمه‌ی تکمیلی">
          <USelect v-model="form.supplementaryInsuranceId" :items="supplementaryItems" class="w-full" />
        </UFormField>
      </div>
    </section>

    <UFormField
      label="توضیحات (اختیاری)"
      :error="errors.notes || undefined"
      :help="`${form.notes.length.toLocaleString('fa-IR')} از ${MAX_NOTES.toLocaleString('fa-IR')} کاراکتر`"
    >
      <UTextarea v-model="form.notes" :rows="3" :maxlength="MAX_NOTES" class="w-full" />
    </UFormField>

    <p v-if="formError" role="alert" class="text-sm text-error">{{ formError }}</p>

    <div class="flex items-center gap-3 flex-wrap">
      <UButton to="/panel/prescriptions" color="neutral" variant="outline" class="flex-1 sm:flex-none justify-center">
        انصراف
      </UButton>
      <UButton type="submit" color="primary" :loading="submitting" :disabled="submitting" class="flex-1 sm:flex-none justify-center">
        ثبت نسخه
      </UButton>
    </div>
  </form>
</template>

<script setup>
import FilePickButton from '@/components/panel/FilePickButton.vue'
import JalaliDateInput from '@/components/panel/JalaliDateInput.vue'
import { validateIranianNationalCode } from '~/utils/validations.js'
import { toLatinDigits } from '~/utils/jalali.js'
import { apiErrorMessage, errorStatus } from '~/utils/apiError.js'

// Submit form for a prescription (POST api/prescriptions/my, multipart). FormData carries non-empty values only.
// A 400 is shown inline; a 409 (the store stopped taking prescriptions) is a toast. Success opens the detail page.
const IMAGE_MAX_MB = 10
const IMAGE_MAX_BYTES = IMAGE_MAX_MB * 1024 * 1024
const MAX_NOTES = 1000
// Sentinel for «آزاد» (no insurance). Never sent: the field is left out instead
const FREE = 'free'

const props = defineProps({
  // PrescriptionOptionsDTO from api/prescriptions/my/options
  options: { type: Object, required: true },
})

const app = useNuxtApp()
const toast = useAppToast()

const form = reactive({
  patientFirstName: '',
  patientLastName: '',
  patientNationalCode: '',
  trackingCode: '',
  doctorName: '',
  doctorLicense: '',
  dateIssued: '',
  insuranceId: FREE,
  supplementaryInsuranceId: FREE,
  notes: '',
})
const image = ref(null)
const errors = ref({})
const formError = ref('')
const submitting = ref(false)

const insuranceItems = (kind) => {
  const active = (props.options.insurances ?? [])
    .filter((insurance) => insurance.active && insurance.kind === kind)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  return [
    { label: 'آزاد', value: FREE },
    ...active.map((insurance) => ({ label: insurance.name, value: insurance.id })),
  ]
}
const basicItems = computed(() => insuranceItems('BASIC'))
const supplementaryItems = computed(() => insuranceItems('SUPPLEMENTARY'))

const fileSizeLabel = (file) => `${(file.size / (1024 * 1024)).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} مگابایت`

const onPickImage = (file) => {
  const allowed = file.type.startsWith('image/') || file.type === 'application/pdf'
  if (!allowed) {
    errors.value = { ...errors.value, image: 'فقط عکس یا فایل PDF ثبت می‌شود' }
    return
  }
  if (file.size > IMAGE_MAX_BYTES) {
    errors.value = { ...errors.value, image: `حجم فایل بیش از ${IMAGE_MAX_MB.toLocaleString('fa-IR')} مگابایت است` }
    return
  }
  errors.value = { ...errors.value, image: '' }
  image.value = file
}

const removeImage = () => {
  image.value = null
}

// The calendar day in Iran (the business calendar), as YYYY-MM-DD
const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' }).format(new Date())

const validate = () => {
  const found = {}
  const nationalCode = toLatinDigits(form.patientNationalCode).trim()
  const trackingCode = toLatinDigits(form.trackingCode).trim()

  if (!form.patientFirstName.trim()) found.patientFirstName = 'نام بیمار را وارد کنید'
  if (!form.patientLastName.trim()) found.patientLastName = 'نام خانوادگی بیمار را وارد کنید'
  if (!nationalCode) found.patientNationalCode = 'کد ملی بیمار را وارد کنید'
  else if (!validateIranianNationalCode(nationalCode)) found.patientNationalCode = 'کد ملی معتبر نیست'

  if (!image.value && !trackingCode) found.image = 'کد رهگیری یا عکس نسخه را وارد کنید'
  if (trackingCode.length > 30) found.trackingCode = `کد رهگیری حداکثر ${(30).toLocaleString('fa-IR')} نویسه است`

  if (form.doctorName.trim().length > 200) found.doctorName = 'نام پزشک بیش از حد طولانی است'
  if (form.doctorLicense.trim().length > 50) found.doctorLicense = 'شماره نظام پزشکی بیش از حد طولانی است'
  if (form.dateIssued && form.dateIssued > todayIso()) found.dateIssued = 'تاریخ صدور نمی‌تواند در آینده باشد'
  if (form.notes.length > MAX_NOTES) found.notes = 'توضیحات بیش از حد طولانی است'

  return found
}

const buildFormData = () => {
  const data = new FormData()
  const put = (key, value) => {
    if (value === null || value === undefined) return
    const text = String(value).trim()
    if (text) data.append(key, text)
  }
  put('patientFirstName', form.patientFirstName)
  put('patientLastName', form.patientLastName)
  put('patientNationalCode', toLatinDigits(form.patientNationalCode))
  put('trackingCode', toLatinDigits(form.trackingCode))
  if (image.value) data.append('image', image.value)
  put('doctorName', form.doctorName)
  put('doctorLicense', form.doctorLicense)
  put('dateIssued', form.dateIssued)
  put('notes', form.notes)
  if (form.insuranceId !== FREE) put('insuranceId', form.insuranceId)
  if (form.supplementaryInsuranceId !== FREE) put('supplementaryInsuranceId', form.supplementaryInsuranceId)
  return data
}

async function submit() {
  if (submitting.value) return
  formError.value = ''
  errors.value = validate()
  if (Object.values(errors.value).some(Boolean)) return

  submitting.value = true
  try {
    const response = await app.$api.prescription.submitPrescription({ data: buildFormData() })
    const created = response.data.data
    toast.success('نسخه ثبت شد', 'بعد از بررسی داروخانه، جواب آن را اینجا می‌بینید')
    await navigateTo(`/panel/prescriptions/${created.id}`)
  } catch (error) {
    if (errorStatus(error) === 409) toast.error(apiErrorMessage(error, 'ثبت نسخه ناموفق بود'))
    else formError.value = apiErrorMessage(error, 'ثبت نسخه ناموفق بود')
  } finally {
    submitting.value = false
  }
}
</script>
