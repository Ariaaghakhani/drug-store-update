<!-- pages/panel/settings/organization.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader icon="i-heroicons-identification" title="اطلاعات" accent="سازمان" subtitle="مشخصات حقوقی فروشگاه برای فاکتور و گزارش‌ها" />

    <SettingsTabs />

    <div v-if="loading" class="grid gap-5 lg:grid-cols-3">
      <UCard class="lg:col-span-2">
        <div class="grid gap-4 md:grid-cols-2">
          <USkeleton v-for="i in 8" :key="i" class="h-14 w-full rounded-lg" />
        </div>
      </UCard>
      <UCard>
        <USkeleton class="h-56 w-full rounded-xl" />
      </UCard>
    </div>

    <UCard v-else-if="forbidden">
      <PanelEmptyState variant="forbidden" title="دسترسی به اطلاعات سازمان ندارید" />
    </UCard>

    <UCard v-else-if="error">
      <PanelEmptyState variant="error" title="دریافت اطلاعات سازمان ناموفق بود">
        <template #action>
          <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
            تلاش دوباره
          </UButton>
        </template>
      </PanelEmptyState>
    </UCard>

    <div v-else class="grid items-start gap-5 lg:grid-cols-3">
      <UCard :ui="{ body: 'p-0' }" class="lg:col-span-2">
        <form dir="rtl" class="font-dana" @submit.prevent="save">
          <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <UIcon name="i-heroicons-identification" class="w-4 h-4 text-brand-500 dark:text-brand-400" />
            <h2 class="text-sm font-medium text-gray-900 dark:text-white">مشخصات حقوقی</h2>
          </div>

          <div class="p-4 sm:p-6 space-y-5">
            <p v-if="!hasOrganization" class="text-sm text-gray-600 dark:text-gray-300 leading-6">
              هنوز اطلاعات سازمان ثبت نشده است؛ با ذخیره، ساخته می‌شود.
            </p>

            <div class="grid gap-4 md:grid-cols-2">
              <UFormField label="نام فروشگاه" required :error="errors.name" class="md:col-span-2">
                <UInput v-model="form.name" :maxlength="255" :disabled="saving" class="w-full" />
              </UFormField>

              <UFormField label="نوع شخص">
                <USelect v-model="form.personType" :items="PERSON_TYPE_ITEMS" :disabled="saving" class="w-full" />
              </UFormField>

              <UFormField
                :label="nationalIdLabel"
                :error="errors.nationalId"
                :help="lockedNationalId ? 'پس از ثبت قفل است' : undefined"
              >
                <UInput
                  v-model="form.nationalId"
                  dir="ltr"
                  inputmode="numeric"
                  autocomplete="off"
                  :disabled="saving || lockedNationalId"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="شماره ثبت" :error="errors.registrationNumber">
                <UInput
                  v-model="form.registrationNumber"
                  dir="ltr"
                  :maxlength="50"
                  :disabled="saving"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="کد اقتصادی (۱۰ تا ۱۴ رقم)"
                :error="errors.economicCode"
                :help="lockedEconomicCode ? 'پس از ثبت قفل است' : undefined"
              >
                <UInput
                  v-model="form.economicCode"
                  dir="ltr"
                  inputmode="numeric"
                  autocomplete="off"
                  :disabled="saving || lockedEconomicCode"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="کد پستی (۱۰ رقم)" :error="errors.postalCode">
                <UInput v-model="form.postalCode" dir="ltr" inputmode="numeric" :disabled="saving" class="w-full" />
              </UFormField>

              <UFormField label="تلفن" :error="errors.phone">
                <UInput v-model="form.phone" dir="ltr" inputmode="tel" :disabled="saving" class="w-full" />
              </UFormField>

              <UFormField label="ایمیل" :error="errors.email">
                <UInput v-model="form.email" dir="ltr" autocomplete="off" :disabled="saving" class="w-full" />
              </UFormField>

              <UFormField label="وب‌سایت" :error="errors.website">
                <UInput v-model="form.website" dir="ltr" :maxlength="255" :disabled="saving" class="w-full" />
              </UFormField>

              <div>
                <JalaliDateInput v-model="form.establishedAt" label="تاریخ تأسیس" clearable />
                <p v-if="errors.establishedAt" class="mt-1 text-xs text-error">{{ errors.establishedAt }}</p>
              </div>

              <UFormField label="نشانی" :error="errors.address" class="md:col-span-2">
                <UTextarea v-model="form.address" :rows="2" :maxlength="255" :disabled="saving" class="w-full" />
              </UFormField>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-800">
            <UButton type="submit" color="primary" :loading="saving" :disabled="saving">
              ذخیره اطلاعات سازمان
            </UButton>
          </div>
        </form>
      </UCard>

      <StoreLogoCard />
    </div>
  </div>
</template>

<script setup>
// Legal details of this store (MY_ORGANIZATION). One full PUT on save; national ID and economic code lock once set.
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import JalaliDateInput from '@/components/panel/JalaliDateInput.vue'
import SettingsTabs from '@/components/panel/settings/SettingsTabs.vue'
import StoreLogoCard from '@/components/panel/settings/StoreLogoCard.vue'
import { apiErrorMessage, errorStatus } from '~/utils/apiError.js'
import { toLatinDigits } from '~/utils/jalali.js'

useHead({ title: 'اطلاعات سازمان | تنظیمات فروشگاه' })

const app = useNuxtApp()
const toast = useAppToast()

const PERSON_TYPE_ITEMS = [
  { label: 'حقوقی', value: 'LEGAL' },
  { label: 'حقیقی', value: 'NATURAL' },
]
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const emptyForm = () => ({
  name: '',
  personType: 'LEGAL',
  nationalId: '',
  registrationNumber: '',
  economicCode: '',
  address: '',
  postalCode: '',
  phone: '',
  email: '',
  website: '',
  establishedAt: '',
})

const form = reactive(emptyForm())
// Field → message for the last validate() run; replaced as a whole, never edited key by key
const errors = ref({})
// Last saved OrganizationDTO; id null means the store has no organization yet
const stored = ref(null)
const loading = ref(true)
const error = ref(false)
const forbidden = ref(false)
const saving = ref(false)

const hasOrganization = computed(() => stored.value?.id != null)
// Once a national ID or economic code is saved it is locked: the form sends null, which BACK reads as unchanged
const lockedNationalId = computed(() => Boolean(stored.value?.nationalId))
const lockedEconomicCode = computed(() => Boolean(stored.value?.economicCode))
const nationalIdLength = computed(() => (form.personType === 'LEGAL' ? 11 : 10))
const nationalIdLabel = computed(() =>
  form.personType === 'LEGAL' ? 'شناسه ملی شرکت (۱۱ رقم)' : 'کد ملی (۱۰ رقم)'
)

const toFa = (n) => Number(n).toLocaleString('fa-IR')
// Persian digits to Latin, surrounding spaces dropped (BACK trims before it checks)
const cleanNumber = (value) => toLatinDigits(value).trim()
const nullIfEmpty = (value) => (value === '' ? null : value)
// Today in Iran's calendar date, as YYYY-MM-DD (compares as text with the ISO value)
const todayIso = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tehran' })

const applyOrganization = (dto) => {
  stored.value = dto ?? null
  Object.assign(form, {
    name: dto?.name ?? '',
    personType: dto?.personType ?? 'LEGAL',
    nationalId: dto?.nationalId ?? '',
    registrationNumber: dto?.registrationNumber ?? '',
    economicCode: dto?.economicCode ?? '',
    address: dto?.address ?? '',
    postalCode: dto?.postalCode ?? '',
    phone: dto?.phone ?? '',
    email: dto?.email ?? '',
    website: dto?.website ?? '',
    establishedAt: dto?.establishedAt ?? '',
  })
  errors.value = {}
}

const load = async () => {
  loading.value = true
  error.value = false
  forbidden.value = false
  try {
    const res = await app.$api.storeSettings.getMyOrganization()
    applyOrganization(res.data.data)
  } catch (e) {
    if (errorStatus(e) === 403) forbidden.value = true
    else error.value = true
  } finally {
    loading.value = false
  }
}

// Mirrors the BACK rules of OrganizationDTO. Returns true when the form may be sent.
const validate = () => {
  const found = {}
  const name = form.name.trim()
  if (!name) found.name = 'نام فروشگاه الزامی است'
  else if (name.length > 255) found.name = 'حداکثر ۲۵۵ کاراکتر'

  if (!lockedNationalId.value) {
    const nationalId = cleanNumber(form.nationalId)
    if (nationalId && !new RegExp(`^\\d{${nationalIdLength.value}}$`).test(nationalId)) {
      found.nationalId = `${toFa(nationalIdLength.value)} رقم وارد کنید`
    }
  }
  if (form.registrationNumber.trim().length > 50) found.registrationNumber = 'حداکثر ۵۰ کاراکتر'

  if (!lockedEconomicCode.value) {
    const economicCode = cleanNumber(form.economicCode)
    if (economicCode && !/^\d{10,14}$/.test(economicCode)) found.economicCode = 'بین ۱۰ تا ۱۴ رقم'
  }

  if (form.address.trim().length > 255) found.address = 'حداکثر ۲۵۵ کاراکتر'

  const postalCode = cleanNumber(form.postalCode)
  if (postalCode && !/^\d{10}$/.test(postalCode)) found.postalCode = '۱۰ رقم وارد کنید'

  const phone = cleanNumber(form.phone)
  if (phone && !/^[0-9+\- ]{0,20}$/.test(phone)) found.phone = 'فقط رقم، +، - و فاصله (حداکثر ۲۰ نویسه)'

  const email = form.email.trim()
  if (email && (email.length > 255 || !EMAIL_PATTERN.test(email))) found.email = 'ایمیل نامعتبر است'

  if (form.website.trim().length > 255) found.website = 'حداکثر ۲۵۵ کاراکتر'

  if (form.establishedAt && form.establishedAt > todayIso()) {
    found.establishedAt = 'تاریخ تأسیس نمی‌تواند در آینده باشد'
  }

  errors.value = found
  return Object.keys(found).length === 0
}

const buildPayload = () => ({
  name: form.name.trim(),
  personType: form.personType,
  nationalId: lockedNationalId.value ? null : nullIfEmpty(cleanNumber(form.nationalId)),
  registrationNumber: nullIfEmpty(form.registrationNumber.trim()),
  economicCode: lockedEconomicCode.value ? null : nullIfEmpty(cleanNumber(form.economicCode)),
  address: nullIfEmpty(form.address.trim()),
  postalCode: nullIfEmpty(cleanNumber(form.postalCode)),
  phone: nullIfEmpty(cleanNumber(form.phone)),
  email: nullIfEmpty(form.email.trim()),
  website: nullIfEmpty(form.website.trim()),
  establishedAt: form.establishedAt || null,
})

const save = async () => {
  if (saving.value || !validate()) return
  saving.value = true
  try {
    const res = await app.$api.storeSettings.saveMyOrganization({ data: buildPayload() })
    applyOrganization(res.data.data)
    toast.success('اطلاعات سازمان ذخیره شد')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'ذخیره اطلاعات سازمان ناموفق بود'))
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
