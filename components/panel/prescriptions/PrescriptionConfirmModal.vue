<template>
  <PanelFormModal
    :open="open"
    title="تأیید تحویل و پرداخت"
    icon="i-heroicons-check-circle"
    submit-label="تأیید"
    width="lg"
    :loading="submitting"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p class="text-sm text-gray-600 dark:text-gray-300 leading-6">
      روش تحویل و پرداخت را انتخاب کنید. بعد از تأیید، لغو نسخه با شما نیست.
    </p>

    <!-- Delivery -->
    <UFormField label="روش تحویل" :error="errors.deliveryMethod || undefined">
      <URadioGroup v-model="form.deliveryMethod" :items="deliveryItems" orientation="vertical" />
    </UFormField>

    <UFormField
      v-if="form.deliveryMethod === 'STORE_COURIER'"
      label="آدرس تحویل"
      required
      :error="errors.addressId || undefined"
    >
      <USelect
        v-model="form.addressId"
        :items="addressItems"
        :loading="addressesLoading"
        placeholder="انتخاب آدرس"
        class="w-full"
      />
      <p v-if="!addressesLoading && !addressItems.length" class="text-xs text-gray-500 dark:text-gray-400 mt-2">
        آدرسی برای تحویل ندارید. ابتدا
        <NuxtLink to="/panel/address" class="text-brand-500 dark:text-brand-400 hover:underline">آدرس</NuxtLink>
        ثبت کنید.
      </p>
    </UFormField>

    <div v-if="form.deliveryMethod === 'CUSTOMER_COURIER'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UFormField label="نام پیک (اختیاری)">
        <UInput v-model="form.courierName" maxlength="100" class="w-full" />
      </UFormField>
      <UFormField label="موبایل پیک (اختیاری)" :error="errors.courierPhone || undefined">
        <UInput
          v-model="form.courierPhone"
          inputmode="numeric"
          dir="ltr"
          autocomplete="off"
          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
          class="w-full"
        />
      </UFormField>
    </div>

    <!-- Payment -->
    <UFormField label="روش پرداخت" :error="errors.paymentMethod || undefined">
      <URadioGroup v-model="form.paymentMethod" :items="paymentItems" orientation="vertical" />
    </UFormField>

    <div
      v-if="form.paymentMethod === 'CARD_TO_CARD' && options?.cardNumber"
      class="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 space-y-2"
    >
      <p class="text-xs text-gray-500 dark:text-gray-400">شماره کارت</p>
      <div class="flex items-center gap-2">
        <span dir="ltr" class="font-mono text-sm font-bold text-gray-900 dark:text-white">{{ options.cardNumber }}</span>
        <UButton
          color="neutral"
          variant="ghost"
          square
          icon="i-heroicons-clipboard-document"
          aria-label="کپی شماره کارت"
          @click="copyCardNumber"
        />
      </div>
      <p v-if="options.cardHolder" class="text-xs text-gray-700 dark:text-gray-300">
        به نام: {{ options.cardHolder }}
      </p>
      <p class="text-xs text-gray-500 dark:text-gray-400">بعد از تأیید، رسید پرداخت را در همین صفحه ارسال کنید.</p>
    </div>

    <!-- Estimate -->
    <div class="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
      <span class="text-sm text-gray-700 dark:text-gray-300">مبلغ قابل پرداخت</span>
      <span class="text-sm font-bold text-gray-900 dark:text-white">{{ estimateLabel }}</span>
    </div>

    <p v-if="formError" role="alert" class="text-sm text-error">{{ formError }}</p>
  </PanelFormModal>
</template>

<script setup>
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import { apiErrorMessage } from '~/utils/apiError.js'
import { normalizeIranianMobile, isValidPhoneNumber } from '~/utils/validations.js'
import { DELIVERY_METHOD_LABELS, PAYMENT_METHOD_LABELS } from '~/utils/prescriptionMeta.js'

// Confirm step after the store's answer (AVAILABLE or PARTIALLY_AVAILABLE): the delivery method, the payment method and
// the address for a store courier. Body: {deliveryMethod, addressId?, courierName?, courierPhone?, paymentMethod}.
// 409 closes the modal and reloads the prescription (its state moved on); 400 is shown inline.
const props = defineProps({
  open: { type: Boolean, required: true },
  prescription: { type: Object, required: true },
  // PrescriptionOptionsDTO, or null when the options call failed (then only the always-on choices are offered)
  options: { type: Object, default: null },
})
const emit = defineEmits(['update:open', 'done'])

const app = useNuxtApp()
const toast = useAppToast()
const { formatPrice } = useFormat()
const userStore = useUserStore()

const form = reactive({
  deliveryMethod: 'PICKUP',
  addressId: null,
  courierName: '',
  courierPhone: '',
  paymentMethod: 'ON_DELIVERY',
})
const errors = ref({})
const formError = ref('')
const submitting = ref(false)
const addresses = ref([])
const addressesLoading = ref(false)

const storeCourierOn = computed(() => Boolean(props.options?.storeCourierEnabled))
// Card-to-card needs the store's card and an amount the store has named
const cardToCardOn = computed(() => Boolean(props.options?.cardToCardEnabled) && props.prescription.drugPrice != null)

const deliveryItems = computed(() => {
  const methods = ['PICKUP', ...(storeCourierOn.value ? ['STORE_COURIER'] : []), 'CUSTOMER_COURIER']
  return methods.map((value) => ({ label: DELIVERY_METHOD_LABELS[value], value }))
})
const paymentItems = computed(() => {
  const methods = ['ON_DELIVERY', ...(cardToCardOn.value ? ['CARD_TO_CARD'] : [])]
  return methods.map((value) => ({ label: PAYMENT_METHOD_LABELS[value], value }))
})

const addressItems = computed(() =>
  addresses.value.map((address) => ({ label: address.fullAddress, value: address.id }))
)

// Estimate = drugPrice + store courier fee (only when the store courier is chosen)
const estimate = computed(() => {
  const drug = props.prescription.drugPrice
  if (drug == null) return null
  const courier = form.deliveryMethod === 'STORE_COURIER' ? Number(props.prescription.courierFee ?? 0) : 0
  return Number(drug) + courier
})
const estimateLabel = computed(() => (estimate.value === null ? 'هنوز اعلام نشده' : formatPrice(estimate.value)))

// The chosen method must still be offered: a switch turned off in between falls back to the default
watch(deliveryItems, (items) => {
  if (!items.some((item) => item.value === form.deliveryMethod)) form.deliveryMethod = 'PICKUP'
})
watch(paymentItems, (items) => {
  if (!items.some((item) => item.value === form.paymentMethod)) form.paymentMethod = 'ON_DELIVERY'
})

async function loadAddresses() {
  const personId = userStore.currentUser?.person?.id
  addresses.value = []
  if (!personId) return
  addressesLoading.value = true
  try {
    const response = await app.$api.address.getAddresses({ data: { personId } })
    addresses.value = response.data.data ?? []
    const fallback = addresses.value.find((address) => address.isDefault) ?? addresses.value[0] ?? null
    form.addressId = form.addressId ?? fallback?.id ?? null
  } catch {
    addresses.value = []
  } finally {
    addressesLoading.value = false
  }
}

// Every open starts from the defaults; the store courier list is loaded only when that choice exists
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    form.deliveryMethod = 'PICKUP'
    form.addressId = null
    form.courierName = ''
    form.courierPhone = ''
    form.paymentMethod = 'ON_DELIVERY'
    errors.value = {}
    formError.value = ''
    if (storeCourierOn.value) loadAddresses()
  }
)

const copyCardNumber = async () => {
  try {
    await navigator.clipboard.writeText(props.options.cardNumber)
    toast.success('شماره کارت کپی شد')
  } catch {
    toast.error('کپی شماره کارت ناموفق بود')
  }
}

const validate = () => {
  const found = {}
  if (form.deliveryMethod === 'STORE_COURIER' && !form.addressId) found.addressId = 'آدرس تحویل را انتخاب کنید'
  if (form.deliveryMethod === 'CUSTOMER_COURIER' && form.courierPhone.trim()) {
    const phone = normalizeIranianMobile(form.courierPhone.trim())
    if (!isValidPhoneNumber(phone)) found.courierPhone = 'شماره موبایل معتبر نیست'
  }
  if (form.paymentMethod === 'CARD_TO_CARD' && !cardToCardOn.value) found.paymentMethod = 'این روش پرداخت در دسترس نیست'
  return found
}

const buildBody = () => {
  const body = { deliveryMethod: form.deliveryMethod, paymentMethod: form.paymentMethod }
  if (form.deliveryMethod === 'STORE_COURIER') body.addressId = form.addressId
  if (form.deliveryMethod === 'CUSTOMER_COURIER') {
    if (form.courierName.trim()) body.courierName = form.courierName.trim()
    if (form.courierPhone.trim()) body.courierPhone = normalizeIranianMobile(form.courierPhone.trim())
  }
  return body
}

async function submit() {
  if (submitting.value) return
  formError.value = ''
  errors.value = validate()
  if (Object.keys(errors.value).length) return

  submitting.value = true
  try {
    await app.$api.prescription.confirmPrescription(props.prescription.id, { data: buildBody() })
    toast.success('نسخه تأیید شد')
    emit('update:open', false)
    emit('done')
  } catch (error) {
    if (error?.response?.status === 409) {
      // The state moved on (e.g. the store changed the answer): show why, then reload the prescription
      toast.error(apiErrorMessage(error, 'تأیید نسخه ناموفق بود'))
      emit('update:open', false)
      emit('done')
    } else {
      formError.value = apiErrorMessage(error, 'تأیید نسخه ناموفق بود')
    }
  } finally {
    submitting.value = false
  }
}
</script>
