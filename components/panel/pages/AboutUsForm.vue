<!-- components/panel/pages/AboutUsForm.vue -->
<template>
  <div class="relative">
    <Transition name="sk">
      <div v-if="loading" key="skeleton" class="space-y-4 p-4 sm:p-6">
        <USkeleton class="h-9 w-full rounded-lg" />
        <USkeleton class="h-48 w-full rounded-lg" />
        <USkeleton class="h-9 w-full rounded-lg" />
        <USkeleton class="h-9 w-full rounded-lg" />
      </div>

      <PanelEmptyState
        v-else-if="forbidden"
        key="forbidden"
        variant="forbidden"
        title="دسترسی به صفحه‌ی درباره ما ندارید"
      />

      <PanelEmptyState
        v-else-if="error"
        key="error"
        variant="error"
        title="دریافت صفحه‌ی درباره ما ناموفق بود"
      >
        <template #action>
          <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
            تلاش دوباره
          </UButton>
        </template>
      </PanelEmptyState>

      <form v-else key="content" dir="rtl" class="space-y-6 p-4 sm:p-6 font-dana" @submit.prevent="save">
        <UAlert
          v-if="defaultText"
          color="info"
          variant="soft"
          icon="i-heroicons-information-circle"
          title="متن پیش‌فرض نمایش داده می‌شود"
          description="فروشگاه هنوز صفحه‌ی درباره ما را ذخیره نکرده است. با ذخیره‌ی این فرم، متن شما جایگزین متن پیش‌فرض می‌شود."
        />

        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <USwitch
              v-model="form.active"
              size="lg"
              :ui="{
                base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
              }"
            />
            <span class="text-sm text-gray-900 dark:text-white">نمایش در سایت</span>
          </div>
          <UButton :to="'/about'" target="_blank" color="neutral" variant="soft" icon="i-heroicons-arrow-top-right-on-square">
            مشاهده در سایت
          </UButton>
        </div>

        <section class="grid grid-cols-1 gap-4">
          <UFormField label="عنوان" required :error="errors.title">
            <UInput v-model="form.title" :maxlength="200" class="w-full" />
          </UFormField>

          <UFormField label="متن صفحه (HTML)" required :error="errors.content">
            <UTextarea v-model="form.content" :rows="14" :maxlength="100000" dir="ltr" class="w-full font-mono" />
          </UFormField>

          <div v-if="previewText" class="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 space-y-1">
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">پیش‌نمایش متن</p>
            <p class="text-sm text-gray-700 dark:text-gray-300 leading-6 whitespace-pre-line">{{ previewText }}</p>
          </div>
        </section>

        <section class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField label="ماموریت" :error="errors.mission">
            <UTextarea v-model="form.mission" :rows="3" :maxlength="2000" class="w-full" />
          </UFormField>
          <UFormField label="چشم‌انداز" :error="errors.vision">
            <UTextarea v-model="form.vision" :rows="3" :maxlength="2000" class="w-full" />
          </UFormField>
        </section>

        <section class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField label="ایمیل تماس" :error="errors.contactEmail">
            <UInput v-model="form.contactEmail" :maxlength="255" dir="ltr" class="w-full" />
          </UFormField>
          <UFormField label="تلفن تماس" :error="errors.contactPhone">
            <UInput v-model="form.contactPhone" :maxlength="50" inputmode="tel" dir="ltr" class="w-full" />
          </UFormField>
          <UFormField label="نشانی" :error="errors.address" class="sm:col-span-2">
            <UInput v-model="form.address" :maxlength="255" class="w-full" />
          </UFormField>
          <UFormField label="آدرس تصویر لوگو" :error="errors.logoUrl" class="sm:col-span-2">
            <UInput v-model="form.logoUrl" :maxlength="255" dir="ltr" class="w-full" />
          </UFormField>
          <UFormField label="ساعات کاری" :error="errors.workingHours" class="sm:col-span-2">
            <UTextarea v-model="form.workingHours" :rows="2" :maxlength="500" class="w-full" />
          </UFormField>
        </section>

        <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <UFormField label="اینستاگرام" :error="errors.instagram">
            <UInput v-model="form.instagram" :maxlength="255" dir="ltr" class="w-full" />
          </UFormField>
          <UFormField label="تلگرام" :error="errors.telegram">
            <UInput v-model="form.telegram" :maxlength="255" dir="ltr" class="w-full" />
          </UFormField>
          <UFormField label="واتس‌اپ" :error="errors.whatsapp">
            <UInput v-model="form.whatsapp" :maxlength="255" dir="ltr" class="w-full" />
          </UFormField>
        </section>

        <section class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField label="عرض جغرافیایی (−90 تا 90)" :error="errors.latitude">
            <UInput v-model="form.latitude" inputmode="decimal" dir="ltr" autocomplete="off" class="w-full" />
          </UFormField>
          <UFormField label="طول جغرافیایی (−180 تا 180)" :error="errors.longitude">
            <UInput v-model="form.longitude" inputmode="decimal" dir="ltr" autocomplete="off" class="w-full" />
          </UFormField>
        </section>

        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <UButton
            v-if="dto?.id"
            color="error"
            variant="outline"
            icon="i-heroicons-trash"
            :disabled="saving"
            @click="deleteOpen = true"
          >
            حذف متن
          </UButton>
          <UButton type="submit" color="primary" class="ms-auto" :loading="saving" :disabled="saving">
            ذخیره
          </UButton>
        </div>
      </form>
    </Transition>

    <PanelConfirmDialog
      :open="deleteOpen"
      title="حذف صفحه‌ی درباره ما"
      message="متن ثبت‌شده‌ی درباره ما حذف شود؟ تا زمانی که دوباره ذخیره نکنید، متن پیش‌فرض نمایش داده می‌شود."
      confirm-label="حذف"
      confirm-color="error"
      :loading="deleting"
      @update:open="(value) => { if (!value) deleteOpen = false }"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import { apiErrorMessage, errorStatus, isPending } from '~/utils/apiError.js'
import { htmlToText } from '~/utils/storefrontGoods.js'
import { toLatinDigits } from '~/utils/jalali.js'

// The About us page of this store (ABOUT_US). Loads its own copy on mount; a save replaces it, so the form is
// rebuilt from the response. Empty optional fields go out as null.
const app = useNuxtApp()
const toast = useAppToast()

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[0-9+\- ]{0,50}$/

const loading = ref(true)
const error = ref(null)
const forbidden = ref(false)
const dto = ref(null)
const defaultText = computed(() => Boolean(dto.value?.defaultText))

const emptyForm = () => ({
  title: '',
  content: '',
  mission: '',
  vision: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  logoUrl: '',
  workingHours: '',
  instagram: '',
  telegram: '',
  whatsapp: '',
  latitude: '',
  longitude: '',
  active: true,
})

const form = reactive(emptyForm())
const errors = ref({})
const previewText = computed(() => htmlToText(form.content))

const hydrate = (data) => {
  Object.assign(form, emptyForm(), {
    title: data.title ?? '',
    content: data.content ?? '',
    mission: data.mission ?? '',
    vision: data.vision ?? '',
    contactEmail: data.contactEmail ?? '',
    contactPhone: data.contactPhone ?? '',
    address: data.address ?? '',
    logoUrl: data.logoUrl ?? '',
    workingHours: data.workingHours ?? '',
    instagram: data.instagram ?? '',
    telegram: data.telegram ?? '',
    whatsapp: data.whatsapp ?? '',
    latitude: data.latitude == null ? '' : String(data.latitude),
    longitude: data.longitude == null ? '' : String(data.longitude),
    active: data.active !== false,
  })
}

const load = async () => {
  loading.value = true
  try {
    const res = await app.$api.contentAdmin.getAboutUsAdmin()
    dto.value = res.data.data
    hydrate(dto.value)
    error.value = null
    forbidden.value = false
  } catch (e) {
    forbidden.value = errorStatus(e) === 403
    error.value = forbidden.value ? null : e
  } finally {
    loading.value = false
  }
}

// '' → null; Persian/Arabic digits are read as Latin, so a numeric field keeps its sign and dot
const orNull = (value) => {
  const text = String(value ?? '').trim()
  return text ? text : null
}

const parseCoordinate = (value) => {
  const text = toLatinDigits(String(value ?? '')).trim()
  if (!text) return null
  return /^-?\d+(\.\d+)?$/.test(text) ? Number(text) : NaN
}

const validate = () => {
  // Built fresh on every submit; the first failing rule per field wins
  const next = {}
  const check = (ok, key, message) => {
    if (!ok && !next[key]) next[key] = message
  }

  check(form.title.trim().length > 0, 'title', 'عنوان را وارد کنید')
  check(form.title.trim().length <= 200, 'title', 'عنوان نباید بیشتر از ۲۰۰ نویسه باشد')
  check(form.content.trim().length > 0, 'content', 'متن صفحه را وارد کنید')
  check(form.mission.length <= 2000, 'mission', 'حداکثر ۲۰۰۰ نویسه')
  check(form.vision.length <= 2000, 'vision', 'حداکثر ۲۰۰۰ نویسه')

  const email = form.contactEmail.trim()
  check(!email || (EMAIL_PATTERN.test(email) && email.length <= 255), 'contactEmail', 'ایمیل معتبر نیست')

  const phone = toLatinDigits(form.contactPhone).trim()
  check(PHONE_PATTERN.test(phone), 'contactPhone', 'فقط عدد، + و - مجاز است')

  check(form.address.length <= 255, 'address', 'حداکثر ۲۵۵ نویسه')
  check(form.logoUrl.trim().length <= 255, 'logoUrl', 'حداکثر ۲۵۵ نویسه')
  check(form.workingHours.length <= 500, 'workingHours', 'حداکثر ۵۰۰ نویسه')
  ;['instagram', 'telegram', 'whatsapp'].forEach((key) => {
    check(form[key].trim().length <= 255, key, 'حداکثر ۲۵۵ نویسه')
  })

  const latitude = parseCoordinate(form.latitude)
  check(latitude === null || (!Number.isNaN(latitude) && latitude >= -90 && latitude <= 90), 'latitude', 'بین −90 و 90')
  const longitude = parseCoordinate(form.longitude)
  check(longitude === null || (!Number.isNaN(longitude) && longitude >= -180 && longitude <= 180), 'longitude', 'بین −180 و 180')

  errors.value = next
  return Object.keys(next).length === 0
}

const saving = ref(false)

const save = async () => {
  if (saving.value || !validate()) return
  saving.value = true
  try {
    const res = await app.$api.contentAdmin.saveAboutUs({
      data: {
        title: form.title.trim(),
        content: form.content.trim(),
        mission: orNull(form.mission),
        vision: orNull(form.vision),
        contactEmail: orNull(form.contactEmail),
        contactPhone: orNull(toLatinDigits(form.contactPhone)),
        address: orNull(form.address),
        logoUrl: orNull(form.logoUrl),
        workingHours: orNull(form.workingHours),
        instagram: orNull(form.instagram),
        telegram: orNull(form.telegram),
        whatsapp: orNull(form.whatsapp),
        latitude: parseCoordinate(form.latitude),
        longitude: parseCoordinate(form.longitude),
        active: form.active,
      },
    })
    if (isPending(res)) return load()
    dto.value = res.data.data
    hydrate(dto.value)
    toast.success('صفحه‌ی درباره ما ذخیره شد')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'ذخیره‌ی صفحه ناموفق بود'))
  } finally {
    saving.value = false
  }
}

const deleteOpen = ref(false)
const deleting = ref(false)

const confirmDelete = async () => {
  deleting.value = true
  try {
    await app.$api.contentAdmin.deleteAboutUs()
    deleteOpen.value = false
    toast.success('متن درباره ما حذف شد')
    await load()
  } catch (e) {
    toast.error(apiErrorMessage(e, 'حذف متن ناموفق بود'))
  } finally {
    deleting.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
