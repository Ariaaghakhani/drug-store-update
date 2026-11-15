<!-- components/panel/MoneyInput.vue -->
<template>
  <UFormField
    :label="moneyLabel(label)"
    :required="required"
    :error="errorMessage"
    :help="help || formatMoney(modelValue)"
  >
    <UInput
      v-model="text"
      inputmode="numeric"
      dir="ltr"
      class="w-full"
      :placeholder="placeholder"
      :disabled="disabled"
    />
  </UFormField>
</template>

<script setup>
// Rial amount input (CONV A). v-model is a Number or null. Shows the formatted amount under the field by default.
import { formatMoney, moneyLabel, parseMoney } from '~/utils/money.js'

const props = defineProps({
  modelValue: { type: Number, default: null },
  label: { type: String, required: true },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
  help: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const toText = (value) => (value === null || value === undefined ? '' : Number(value).toLocaleString('fa-IR'))

const text = ref(toText(props.modelValue))
const invalid = ref(false)

const errorMessage = computed(() => props.error || (invalid.value ? 'فقط عدد' : ''))

// Typing: an empty field is null, unparsable text is null with an error, otherwise the parsed number.
watch(text, (value) => {
  if (!String(value ?? '').trim()) {
    invalid.value = false
    emit('update:modelValue', null)
    return
  }
  const parsed = parseMoney(value)
  invalid.value = parsed === null
  if (parsed !== props.modelValue) emit('update:modelValue', parsed)
})

// External change: reformat, but keep the user's text while it already means the same number (no cursor jumps).
watch(
  () => props.modelValue,
  (value) => {
    if (value === parseMoney(text.value)) return
    text.value = toText(value)
    invalid.value = false
  }
)
</script>
