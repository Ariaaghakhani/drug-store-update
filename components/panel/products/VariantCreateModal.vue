<!-- components/panel/products/VariantCreateModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    title="تنوع جدید"
    icon="i-heroicons-plus"
    submit-label="ساخت تنوع"
    width="lg"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UFormField
        v-for="axis in axes"
        :key="axis.attributeId"
        :label="axis.attributeName"
        required
        :error="errors[axis.attributeId]"
      >
        <USelect
          v-model="picked[axis.attributeId]"
          :items="optionItems(axis)"
          placeholder="انتخاب گزینه"
          class="w-full"
        />
      </UFormField>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800 pt-4">
      <UFormField label="کد کالا" :error="errors.goodCode" help="خالی یعنی کد مدل + شماره">
        <UInput v-model="form.goodCode" :maxlength="255" dir="ltr" class="w-full" />
      </UFormField>

      <UFormField label="بارکد" :error="errors.barcode" help="اختیاری">
        <UInput v-model="form.barcode" :maxlength="255" dir="ltr" class="w-full" />
      </UFormField>

      <MoneyInput
        v-model="form.price"
        label="قیمت"
        :error="errors.price"
        placeholder="خالی یعنی قیمت مدل"
      />

      <MoneyInput
        v-model="form.purchasePrice"
        label="قیمت خرید"
        :error="errors.purchasePrice"
        placeholder="اختیاری"
      />
    </div>
  </PanelFormModal>
</template>

<script setup>
// Create one variant of a model with one option per axis. Empty code/price fall back to the model's on BACK.
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import MoneyInput from '@/components/panel/MoneyInput.vue'
import { apiErrorMessage, errorStatus, isPending } from '~/utils/apiError.js'

const props = defineProps({
  open: { type: Boolean, required: true },
  // The model GoodsDTO (uses id)
  model: { type: Object, required: true },
  // [{attributeId, attributeName, options: [{id, value}]}] from the category axes
  axes: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:open', 'saved'])

const app = useNuxtApp()
const toast = useAppToast()

const MAX_TEXT = 255

// Per axis: the chosen option id as a string (USelect value)
const picked = reactive({})
const form = reactive({ goodCode: '', barcode: '', price: null, purchasePrice: null })
const errors = ref({})
const serverError = ref('')
const saving = ref(false)

const optionItems = (axis) => axis.options.map((option) => ({ label: option.value, value: String(option.id) }))

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    Object.assign(picked, Object.fromEntries(props.axes.map((axis) => [axis.attributeId, ''])))
    Object.assign(form, { goodCode: '', barcode: '', price: null, purchasePrice: null })
    errors.value = {}
    serverError.value = ''
  }
)

const validate = () => {
  errors.value = {}
  for (const axis of props.axes) {
    if (!picked[axis.attributeId]) errors.value[axis.attributeId] = 'گزینه را انتخاب کنید'
  }
  if (form.goodCode.trim().length > MAX_TEXT) errors.value.goodCode = `حداکثر ${MAX_TEXT.toLocaleString('fa-IR')} نویسه`
  if (form.barcode.trim().length > MAX_TEXT) errors.value.barcode = `حداکثر ${MAX_TEXT.toLocaleString('fa-IR')} نویسه`
  if (form.price !== null && form.price < 0) errors.value.price = 'نمی‌تواند منفی باشد'
  if (form.purchasePrice !== null && form.purchasePrice < 0) errors.value.purchasePrice = 'نمی‌تواند منفی باشد'
  return Object.keys(errors.value).length === 0
}

const submit = async () => {
  if (saving.value || !validate()) return
  saving.value = true
  serverError.value = ''
  try {
    const res = await app.$api.catalogAdmin.createVariant({
      data: {
        modelId: props.model.id,
        goodCode: form.goodCode.trim() || undefined,
        barcode: form.barcode.trim() || undefined,
        price: form.price ?? undefined,
        purchasePrice: form.purchasePrice ?? undefined,
        axes: props.axes.map((axis) => ({
          attributeId: axis.attributeId,
          optionId: Number(picked[axis.attributeId]),
        })),
      },
    })
    if (isPending(res)) {
      emit('update:open', false)
      emit('saved')
      return
    }
    toast.success('تنوع ساخته شد')
    emit('update:open', false)
    emit('saved')
  } catch (e) {
    // 400 and 409 (for example a combination that already exists) stay inside the modal
    const status = errorStatus(e)
    if (status === 400 || status === 409) serverError.value = apiErrorMessage(e, 'تنوع ساخته نشد')
    else toast.error(apiErrorMessage(e, 'ساخت تنوع ناموفق بود'))
  } finally {
    saving.value = false
  }
}
</script>
