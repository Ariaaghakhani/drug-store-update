<!-- components/panel/products/GenerateVariantsModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    title="ساخت گروهی تنوع‌ها"
    icon="i-heroicons-squares-2x2"
    submit-label="ساخت تنوع‌ها"
    width="lg"
    :loading="saving"
    :submit-disabled="combinations === 0"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <p class="text-xs text-gray-500 dark:text-gray-400">
      برای هر محور، گزینه‌های مورد نظر را انتخاب کنید. همه‌ی ترکیب‌های تازه ساخته می‌شوند؛ ترکیب‌های موجود دوباره ساخته نمی‌شوند.
    </p>

    <UFormField
      v-for="axis in axes"
      :key="axis.attributeId"
      :label="axis.attributeName"
      required
      :error="errors[axis.attributeId]"
    >
      <USelectMenu
        v-model="selected[axis.attributeId]"
        :items="optionItems(axis)"
        multiple
        value-key="value"
        placeholder="انتخاب گزینه‌ها"
        class="w-full"
      />
    </UFormField>

    <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-1">
      <p class="text-xs text-gray-500 dark:text-gray-400">تعداد ترکیب‌ها</p>
      <p class="text-xl font-black text-gray-900 dark:text-white">{{ combinations.toLocaleString('fa-IR') }}</p>
      <p v-if="combinations > WARN_ABOVE" class="text-xs text-warning" role="status">
        بیش از {{ WARN_ABOVE.toLocaleString('fa-IR') }} ترکیب؛ مطمئن شوید همه‌ی این تنوع‌ها لازم است.
      </p>
    </div>
  </PanelFormModal>
</template>

<script setup>
// Create every new combination of the chosen options for a model. Existing combinations are skipped by BACK.
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
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

// Above this many combinations the modal warns (the count is still allowed)
const WARN_ABOVE = 100

// Per axis: the chosen option ids as strings (USelectMenu value-key)
const selected = reactive({})
const errors = ref({})
const serverError = ref('')
const saving = ref(false)

const optionItems = (axis) => axis.options.map((option) => ({ label: option.value, value: String(option.id) }))

// Product of the chosen counts; 0 while any axis has nothing picked
const combinations = computed(() => {
  if (!props.axes.length) return 0
  return props.axes.reduce((total, axis) => total * (selected[axis.attributeId]?.length ?? 0), 1)
})

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    Object.assign(selected, Object.fromEntries(props.axes.map((axis) => [axis.attributeId, []])))
    errors.value = {}
    serverError.value = ''
  }
)

const validate = () => {
  errors.value = {}
  for (const axis of props.axes) {
    if (!selected[axis.attributeId]?.length) errors.value[axis.attributeId] = 'حداقل یک گزینه را انتخاب کنید'
  }
  return Object.keys(errors.value).length === 0
}

const submit = async () => {
  if (saving.value || !validate()) return
  saving.value = true
  serverError.value = ''
  try {
    const res = await app.$api.catalogAdmin.generateVariants({
      data: {
        modelId: props.model.id,
        axes: props.axes.map((axis) => ({
          attributeId: axis.attributeId,
          optionIds: selected[axis.attributeId].map(Number),
        })),
      },
    })
    if (isPending(res)) {
      emit('update:open', false)
      emit('saved')
      return
    }
    const created = res.data.data?.length ?? 0
    toast.success(
      created ? `${created.toLocaleString('fa-IR')} تنوع ساخته شد` : 'همه‌ی این ترکیب‌ها از قبل وجود داشتند'
    )
    emit('update:open', false)
    emit('saved')
  } catch (e) {
    if (errorStatus(e) === 400) serverError.value = apiErrorMessage(e, 'انتخاب‌ها نامعتبر است')
    else toast.error(apiErrorMessage(e, 'ساخت تنوع‌ها ناموفق بود'))
  } finally {
    saving.value = false
  }
}
</script>
