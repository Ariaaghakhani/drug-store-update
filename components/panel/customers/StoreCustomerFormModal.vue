<!-- components/panel/customers/StoreCustomerFormModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    :title="customer ? 'ویرایش مشتری' : 'ثبت مشتری جدید'"
    icon="i-heroicons-user-plus"
    :submit-label="customer ? 'ذخیره' : 'ثبت مشتری'"
    width="lg"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UFormField label="نام" required :error="errors.firstName">
        <UInput v-model="form.firstName" :maxlength="100" class="w-full" />
      </UFormField>

      <UFormField label="نام خانوادگی" :error="errors.lastName">
        <UInput v-model="form.lastName" :maxlength="100" class="w-full" />
      </UFormField>
    </div>

    <UFormField label="موبایل" required :error="errors.phone" help="مثال: ۰۹۱۲۳۴۵۶۷۸۹">
      <UInput v-model="form.phone" inputmode="tel" dir="ltr" class="w-full" placeholder="09123456789" />
    </UFormField>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
      <div class="space-y-1">
        <JalaliDateInput v-model="form.birthDate" label="تاریخ تولد" clearable />
        <p v-if="errors.birthDate" class="text-xs text-error">{{ errors.birthDate }}</p>
      </div>

      <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer pt-7">
        <USwitch v-model="form.marketingSms" size="lg" :ui="SWITCH_UI" />
        دریافت پیامک تبلیغاتی
      </label>
    </div>

    <UFormField label="یادداشت فروشگاه" :error="errors.description">
      <UTextarea v-model="form.description" :rows="3" :maxlength="500" class="w-full" />
    </UFormField>
  </PanelFormModal>
</template>

<script setup>
// Create or edit one store customer. Writes go through `app.$api.crm`; the parent reloads on `saved`.
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import JalaliDateInput from '@/components/panel/JalaliDateInput.vue'
import { apiErrorMessage, errorStatus } from '~/utils/apiError.js'
import { isValidPhoneNumber, normalizeIranianMobile } from '~/utils/validations.js'

const props = defineProps({
  open: { type: Boolean, required: true },
  // StoreCustomerDTO to edit, or null to create
  customer: { type: Object, default: null },
})

const emit = defineEmits(['update:open', 'saved'])

const app = useNuxtApp()
const toast = useAppToast()

// Brand teal switch (DESIGN_SYSTEM "USwitch"): never color="teal"
const SWITCH_UI = {
  base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
}

const emptyForm = () => ({
  firstName: '',
  lastName: '',
  phone: '',
  marketingSms: true,
  birthDate: '',
  description: '',
})

const form = reactive(emptyForm())
const errors = ref({})
const serverError = ref('')
const saving = ref(false)

// Loads the form from the customer being edited (or defaults for create) every time the modal opens.
const initForm = () => {
  Object.assign(form, emptyForm())
  const source = props.customer
  if (source) {
    form.firstName = source.firstName ?? ''
    form.lastName = source.lastName ?? ''
    form.phone = source.phone ?? ''
    form.marketingSms = source.marketingSms !== false
    form.birthDate = source.birthDate ?? ''
    form.description = source.description ?? ''
  }
  errors.value = {}
  serverError.value = ''
}

watch(
  () => [props.open, props.customer],
  ([isOpen]) => {
    if (isOpen) initForm()
  },
  { immediate: true }
)

// Today's date as YYYY-MM-DD in the browser's local calendar; ISO dates compare correctly as strings
const todayIso = () => {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const validate = () => {
  errors.value = {}

  const firstName = form.firstName.trim()
  if (!firstName) errors.value.firstName = 'نام را وارد کنید'
  else if (firstName.length > 100) errors.value.firstName = 'حداکثر ۱۰۰ نویسه'

  if (form.lastName.trim().length > 100) errors.value.lastName = 'حداکثر ۱۰۰ نویسه'

  const phone = normalizeIranianMobile(form.phone)
  if (!phone) errors.value.phone = 'شماره موبایل را وارد کنید'
  else if (!isValidPhoneNumber(phone)) errors.value.phone = 'شماره موبایل معتبر نیست'

  if (form.birthDate && form.birthDate > todayIso()) {
    errors.value.birthDate = 'تاریخ تولد نمی‌تواند در آینده باشد'
  }

  if (form.description.length > 500) errors.value.description = 'حداکثر ۵۰۰ نویسه'

  return Object.keys(errors.value).length === 0
}

// Full-replace body: optional empty text goes out as null.
const buildBody = () => ({
  firstName: form.firstName.trim(),
  lastName: form.lastName.trim() || null,
  phone: normalizeIranianMobile(form.phone),
  marketingSms: form.marketingSms,
  birthDate: form.birthDate || null,
  description: form.description.trim() || null,
})

const submit = async () => {
  if (saving.value || !validate()) return
  saving.value = true
  serverError.value = ''
  try {
    const data = buildBody()
    if (props.customer) await app.$api.crm.updateStoreCustomer(props.customer.id, { data })
    else await app.$api.crm.createStoreCustomer({ data })
    toast.success('مشتری ذخیره شد')
    emit('update:open', false)
    emit('saved')
  } catch (e) {
    const status = errorStatus(e)
    // A phone already in the club is shown under the field; other 400 messages stay inside the modal.
    if (status === 409) errors.value.phone = 'این شماره موبایل قبلاً در باشگاه ثبت شده'
    else if (status === 400) serverError.value = apiErrorMessage(e, 'اطلاعات مشتری نامعتبر است')
    else toast.error(apiErrorMessage(e, 'ذخیره مشتری ناموفق بود'))
  } finally {
    saving.value = false
  }
}
</script>
