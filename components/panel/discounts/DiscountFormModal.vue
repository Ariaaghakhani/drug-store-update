<!-- components/panel/discounts/DiscountFormModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    :title="discount ? 'ویرایش کد تخفیف' : 'کد تخفیف جدید'"
    icon="i-heroicons-ticket"
    :submit-label="discount ? 'ذخیره' : 'ساخت کد تخفیف'"
    width="2xl"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <section class="space-y-4">
      <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">اطلاعات پایه</h4>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="کد" required :error="errors.code" help="حروف، عدد، «_» و «-»">
          <UInput v-model="form.code" dir="ltr" :maxlength="50" class="w-full font-mono" placeholder="SUMMER10" />
        </UFormField>

        <UFormField label="نوع تخفیف" required :error="errors.type">
          <USelect v-model="form.type" :items="typeItems" class="w-full" />
        </UFormField>
      </div>

      <UFormField label="توضیح" :error="errors.description">
        <UInput v-model="form.description" :maxlength="200" class="w-full" />
      </UFormField>
    </section>

    <section class="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
      <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">مقدار تخفیف</h4>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField
          v-if="form.type === 'PERCENT'"
          label="درصد تخفیف"
          required
          :error="errors.percentValue"
          help="۱ تا ۱۰۰"
        >
          <UInput v-model="form.percentValue" inputmode="numeric" dir="ltr" class="w-full" placeholder="۱۰" />
        </UFormField>

        <MoneyInput
          v-else
          v-model="form.value"
          label="مبلغ تخفیف"
          required
          :error="errors.value"
        />

        <MoneyInput
          v-if="form.type === 'PERCENT'"
          v-model="form.maxDiscountAmount"
          label="سقف تخفیف"
          :error="errors.maxDiscountAmount"
          help="خالی یعنی بدون سقف"
        />

        <MoneyInput
          v-model="form.minPurchaseAmount"
          label="حداقل مبلغ خرید"
          :error="errors.minPurchaseAmount"
          help="خالی یعنی بدون حداقل"
        />
      </div>
    </section>

    <section class="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
      <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">اعتبار و محدودیت استفاده</h4>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-1">
          <JalaliDateInput v-model="form.startsAt" label="شروع اعتبار" with-time clearable />
        </div>
        <div class="space-y-1">
          <JalaliDateInput v-model="form.endsAt" label="پایان اعتبار" with-time clearable />
          <p v-if="errors.endsAt" class="text-xs text-error">{{ errors.endsAt }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="تعداد کل استفاده" :error="errors.usageLimit" help="خالی یعنی نامحدود">
          <UInput v-model="form.usageLimit" inputmode="numeric" dir="ltr" class="w-full" />
        </UFormField>
        <UFormField label="تعداد استفاده هر مشتری" :error="errors.usageLimitPerCustomer" help="خالی یعنی نامحدود">
          <UInput v-model="form.usageLimitPerCustomer" inputmode="numeric" dir="ltr" class="w-full" />
        </UFormField>
      </div>

      <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        <USwitch v-model="form.active" size="lg" :ui="SWITCH_UI" />
        فعال باشد
      </label>
    </section>
  </PanelFormModal>
</template>

<script setup>
// Create or edit one discount code. Writes go through `app.$api.commerceAdmin`; the parent reloads on `saved`.
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import MoneyInput from '@/components/panel/MoneyInput.vue'
import JalaliDateInput from '@/components/panel/JalaliDateInput.vue'
import { apiErrorMessage, errorStatus } from '~/utils/apiError.js'
import { DISCOUNT_TYPE_LABELS } from '~/utils/discountMeta.js'
import { parseQuantity } from '~/utils/inventoryMeta.js'
import { toLatinDigits } from '~/utils/jalali.js'

const props = defineProps({
  open: { type: Boolean, required: true },
  // DiscountCodeDTO to edit, or null to create
  discount: { type: Object, default: null },
})

const emit = defineEmits(['update:open', 'saved'])

const app = useNuxtApp()
const toast = useAppToast()

const MAX_MONEY = 1_000_000_000_000
// Brand teal switch (DESIGN_SYSTEM "USwitch"): never color="teal"
const SWITCH_UI = {
  base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
}
const CODE_PATTERN = /^[\p{L}\p{N}_-]+$/u

const typeItems = Object.entries(DISCOUNT_TYPE_LABELS).map(([value, label]) => ({ value, label }))

const emptyForm = () => ({
  code: '',
  description: '',
  type: 'PERCENT',
  percentValue: '',
  value: null,
  maxDiscountAmount: null,
  minPurchaseAmount: null,
  startsAt: '',
  endsAt: '',
  usageLimit: '',
  usageLimitPerCustomer: '',
  active: true,
})

const form = reactive(emptyForm())
const errors = ref({})
const serverError = ref('')
const saving = ref(false)

// Whole-number text → number, '' → null (optional), anything else → NaN (invalid).
const parseOptionalWhole = (text) => {
  const trimmed = toLatinDigits(String(text ?? '')).trim()
  if (trimmed === '') return null
  const parsed = parseQuantity(trimmed)
  return parsed === null ? NaN : parsed
}

// Loads the form from the code being edited (or defaults for create) every time the modal opens.
const initForm = () => {
  Object.assign(form, emptyForm())
  const source = props.discount
  if (source) {
    form.code = source.code ?? ''
    form.description = source.description ?? ''
    form.type = source.type ?? 'PERCENT'
    if (form.type === 'PERCENT') form.percentValue = String(source.value ?? '')
    else form.value = source.value ?? null
    form.maxDiscountAmount = source.maxDiscountAmount ?? null
    form.minPurchaseAmount = source.minPurchaseAmount ?? null
    form.startsAt = source.startsAt ?? ''
    form.endsAt = source.endsAt ?? ''
    form.usageLimit = source.usageLimit ? String(source.usageLimit) : ''
    form.usageLimitPerCustomer = source.usageLimitPerCustomer ? String(source.usageLimitPerCustomer) : ''
    form.active = source.active !== false
  }
  errors.value = {}
  serverError.value = ''
}

watch(
  () => [props.open, props.discount],
  ([isOpen]) => {
    if (isOpen) initForm()
  },
  { immediate: true }
)

// The cap only exists for PERCENT (see buildBody), so a switch to FIXED clears it.
watch(
  () => form.type,
  (type) => {
    if (type === 'FIXED') form.maxDiscountAmount = null
  }
)

const validate = () => {
  errors.value = {}

  const code = form.code.trim()
  if (!code) errors.value.code = 'کد را وارد کنید'
  else if (code.length > 50) errors.value.code = 'حداکثر ۵۰ نویسه'
  else if (!CODE_PATTERN.test(code)) errors.value.code = 'فقط حروف، عدد، «_» و «-»'

  if (form.description.length > 200) errors.value.description = 'حداکثر ۲۰۰ نویسه'
  if (!form.type) errors.value.type = 'نوع تخفیف را انتخاب کنید'

  if (form.type === 'PERCENT') {
    const percent = parseOptionalWhole(form.percentValue)
    if (percent === null || Number.isNaN(percent) || percent < 1 || percent > 100) {
      errors.value.percentValue = 'بین ۱ تا ۱۰۰'
    }
    if (form.maxDiscountAmount !== null && form.maxDiscountAmount < 1) {
      errors.value.maxDiscountAmount = 'حداقل ۱ ریال'
    }
  } else if (form.value === null || form.value < 1) {
    errors.value.value = 'مبلغ را وارد کنید (حداقل ۱ ریال)'
  } else if (form.value > MAX_MONEY) {
    errors.value.value = 'مبلغ بیش از حد مجاز است'
  }

  if (form.minPurchaseAmount !== null && form.minPurchaseAmount < 1) {
    errors.value.minPurchaseAmount = 'حداقل ۱ ریال'
  }

  if (form.startsAt && form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt)) {
    errors.value.endsAt = 'پایان باید بعد از شروع باشد'
  }

  const usage = parseOptionalWhole(form.usageLimit)
  if (Number.isNaN(usage) || (usage !== null && usage < 1)) errors.value.usageLimit = 'عدد بزرگ‌تر از ۰'
  const perCustomer = parseOptionalWhole(form.usageLimitPerCustomer)
  if (Number.isNaN(perCustomer) || (perCustomer !== null && perCustomer < 1)) {
    errors.value.usageLimitPerCustomer = 'عدد بزرگ‌تر از ۰'
  }

  return Object.keys(errors.value).length === 0
}

// Full-replace body: optional empty fields go out as null, the cap only for PERCENT.
const buildBody = () => {
  const percent = form.type === 'PERCENT'
  return {
    code: form.code.trim(),
    description: form.description.trim() || null,
    type: form.type,
    value: percent ? parseOptionalWhole(form.percentValue) : form.value,
    maxDiscountAmount: percent ? form.maxDiscountAmount : null,
    minPurchaseAmount: form.minPurchaseAmount,
    startsAt: form.startsAt || null,
    endsAt: form.endsAt || null,
    usageLimit: parseOptionalWhole(form.usageLimit),
    usageLimitPerCustomer: parseOptionalWhole(form.usageLimitPerCustomer),
    active: form.active,
  }
}

const submit = async () => {
  if (saving.value || !validate()) return
  saving.value = true
  serverError.value = ''
  try {
    const data = buildBody()
    if (props.discount) await app.$api.commerceAdmin.updateDiscountCode(props.discount.id, { data })
    else await app.$api.commerceAdmin.createDiscountCode({ data })
    toast.success('کد تخفیف ذخیره شد')
    emit('update:open', false)
    emit('saved')
  } catch (e) {
    const status = errorStatus(e)
    // A taken code is shown under the field; other 400 messages stay inside the modal.
    if (status === 409) errors.value.code = 'این کد قبلاً ثبت شده'
    else if (status === 400) serverError.value = apiErrorMessage(e, 'اطلاعات کد تخفیف نامعتبر است')
    else toast.error(apiErrorMessage(e, 'ذخیره کد تخفیف ناموفق بود'))
  } finally {
    saving.value = false
  }
}
</script>
