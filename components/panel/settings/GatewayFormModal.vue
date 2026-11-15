<!-- components/panel/settings/GatewayFormModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    :title="`حساب ${gatewayLabel}`"
    icon="i-heroicons-credit-card"
    submit-label="ذخیره"
    width="lg"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <UFormField
      v-for="field in fields"
      :key="field"
      :label="GATEWAY_FIELD_LABELS[field] ?? field"
      :required="isRequired(field)"
      :error="errors[field]"
      :help="isSecret(field) && setFlag(field) ? 'خالی بماند یعنی رمز قبلی بماند' : ''"
    >
      <UInput
        v-model="form[field]"
        :type="isSecret(field) ? 'password' : 'text'"
        dir="ltr"
        autocomplete="off"
        class="w-full"
        :maxlength="FIELD_MAX[field]"
        :placeholder="isSecret(field) && setFlag(field) ? '••• بدون تغییر' : ''"
      />
    </UFormField>

    <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
      <USwitch v-model="form.active" size="lg" :ui="SWITCH_UI" />
      فعال باشد
    </label>
  </PanelFormModal>
</template>

<script setup>
// Create or edit one gateway account. The inputs are exactly the gateway's requiredFields; secrets are never shown back.
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import { apiErrorMessage, errorStatus } from '~/utils/apiError.js'
import { GATEWAY_FIELD_LABELS, GATEWAY_LABELS, SECRET_FIELDS } from '~/utils/paymentMeta.js'

const props = defineProps({
  open: { type: Boolean, required: true },
  // TenantPaymentGatewayDTO of the gateway being edited
  row: { type: Object, default: null },
})

const emit = defineEmits(['update:open', 'saved'])

const app = useNuxtApp()
const toast = useAppToast()

// Brand teal switch (DESIGN_SYSTEM "USwitch"): never color="teal"
const SWITCH_UI = {
  base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
}

// BACK's TenantPaymentGatewayRequest size caps
const FIELD_MAX = {
  merchantId: 100,
  terminalId: 100,
  username: 100,
  password: 200,
  clientId: 100,
  clientSecret: 200,
}

const form = reactive({
  merchantId: '',
  terminalId: '',
  username: '',
  password: '',
  clientId: '',
  clientSecret: '',
  active: true,
})
const errors = ref({})
const serverError = ref('')
const saving = ref(false)

const gatewayLabel = computed(() => (props.row ? GATEWAY_LABELS[props.row.gateway] ?? props.row.gateway : ''))
const fields = computed(() => props.row?.requiredFields ?? [])

const isSecret = (field) => SECRET_FIELDS.includes(field)
// The *Set flag of a secret field (passwordSet / clientSecretSet)
const setFlag = (field) => (field === 'password' ? props.row?.passwordSet === true : props.row?.clientSecretSet === true)
const isRequired = (field) => !isSecret(field) || !setFlag(field)

// Opening loads the form from the row: plain fields prefilled, secrets always empty (a blank secret keeps the stored one).
watch(
  () => [props.open, props.row],
  ([isOpen]) => {
    if (!isOpen || !props.row) return
    form.merchantId = props.row.merchantId ?? ''
    form.terminalId = props.row.terminalId ?? ''
    form.username = props.row.username ?? ''
    form.password = ''
    form.clientId = props.row.clientId ?? ''
    form.clientSecret = ''
    form.active = props.row.active !== false
    errors.value = {}
    serverError.value = ''
  },
  { immediate: true }
)

const validate = () => {
  errors.value = {}
  for (const field of fields.value) {
    const value = String(form[field] ?? '').trim()
    if (isSecret(field)) {
      if (isRequired(field) && !value) errors.value[field] = 'این فیلد لازم است'
    } else if (!value) {
      errors.value[field] = 'این فیلد لازم است'
    }
    if (value.length > FIELD_MAX[field]) errors.value[field] = `حداکثر ${FIELD_MAX[field].toLocaleString('fa-IR')} نویسه`
  }
  return Object.keys(errors.value).length === 0
}

// Full-replace body. Inputs not in requiredFields go out as null; an empty secret is left out so BACK keeps it.
const buildBody = () => {
  const body = { gateway: props.row.gateway, active: form.active }
  for (const field of ['merchantId', 'terminalId', 'username', 'clientId']) {
    const value = fields.value.includes(field) ? String(form[field]).trim() : ''
    body[field] = value || null
  }
  for (const field of SECRET_FIELDS) {
    const value = fields.value.includes(field) ? String(form[field]).trim() : ''
    if (value) body[field] = value
  }
  return body
}

const submit = async () => {
  if (saving.value || !props.row || !validate()) return
  saving.value = true
  serverError.value = ''
  try {
    const res = await app.$api.payments.adminSaveGateway({ data: buildBody() })
    toast.success('حساب درگاه ذخیره شد')
    emit('saved', res.data.data)
    emit('update:open', false)
  } catch (e) {
    // 400 messages come from BACK already translated; they stay inside the modal so the user can fix the form.
    if (errorStatus(e) === 400) serverError.value = apiErrorMessage(e, 'اطلاعات حساب درگاه نامعتبر است')
    else toast.error(apiErrorMessage(e, 'ذخیره حساب درگاه ناموفق بود'))
  } finally {
    saving.value = false
  }
}
</script>
