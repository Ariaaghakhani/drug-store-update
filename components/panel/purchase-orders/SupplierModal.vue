<!-- components/panel/purchase-orders/SupplierModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    title="تأمین‌کننده جدید"
    icon="i-heroicons-building-storefront"
    submit-label="ساخت تأمین‌کننده"
    width="lg"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UFormField label="نام تأمین‌کننده" required :error="errors.name" class="sm:col-span-2">
        <UInput v-model="form.name" :maxlength="255" class="w-full" />
      </UFormField>
      <UFormField label="نام رابط" :error="errors.contactName">
        <UInput v-model="form.contactName" :maxlength="255" class="w-full" />
      </UFormField>
      <UFormField label="تلفن" :error="errors.phone">
        <UInput v-model="form.phone" inputmode="tel" dir="ltr" :maxlength="50" class="w-full" />
      </UFormField>
      <UFormField label="ایمیل" :error="errors.email" class="sm:col-span-2">
        <UInput v-model="form.email" dir="ltr" :maxlength="255" class="w-full" />
      </UFormField>
    </div>
  </PanelFormModal>
</template>

<script setup>
// Quick-create a supplier from the purchase-order form. Emits `created` with the SupplierDTO so the form can select it.
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import { apiErrorMessage } from '~/utils/apiError.js'

const props = defineProps({
  open: { type: Boolean, required: true },
})
const emit = defineEmits(['update:open', 'created'])

const app = useNuxtApp()
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const emptyForm = () => ({ name: '', contactName: '', phone: '', email: '' })
const form = reactive(emptyForm())
const errors = ref({})
const serverError = ref('')
const saving = ref(false)

// Every open starts blank.
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    Object.assign(form, emptyForm())
    errors.value = {}
    serverError.value = ''
  }
)

const validate = () => {
  errors.value = {}
  const name = form.name.trim()
  if (!name) errors.value.name = 'نام تأمین‌کننده را وارد کنید'
  else if (name.length > 255) errors.value.name = 'حداکثر ۲۵۵ نویسه'
  if (form.contactName.trim().length > 255) errors.value.contactName = 'حداکثر ۲۵۵ نویسه'
  if (form.phone.trim().length > 50) errors.value.phone = 'حداکثر ۵۰ نویسه'
  const email = form.email.trim()
  if (email && (email.length > 255 || !EMAIL_PATTERN.test(email))) errors.value.email = 'ایمیل معتبر نیست'
  return Object.keys(errors.value).length === 0
}

const submit = async () => {
  if (saving.value || !validate()) return
  saving.value = true
  serverError.value = ''
  try {
    const res = await app.$api.organization.createSupplier({
      data: {
        name: form.name.trim(),
        contactName: form.contactName.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
      },
    })
    emit('created', res.data.data)
    emit('update:open', false)
  } catch (e) {
    serverError.value = apiErrorMessage(e, 'ثبت تأمین‌کننده ناموفق بود')
  } finally {
    saving.value = false
  }
}
</script>
