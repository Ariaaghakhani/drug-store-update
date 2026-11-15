<template>
  <UFormField :label="label" :error="error || undefined">
    <div class="flex items-center gap-2">
      <UInput
        v-model="text"
        inputmode="numeric"
        dir="ltr"
        autocomplete="off"
        :placeholder="withTime ? '۱۴۰۵/۰۱/۰۱ ۱۲:۰۰' : '۱۴۰۵/۰۱/۰۱'"
        class="w-full"
        @blur="commit"
        @keyup.enter="commit"
      />
      <UButton
        v-if="clearable && modelValue"
        icon="i-heroicons-x-mark"
        color="neutral"
        variant="ghost"
        square
        aria-label="پاک کردن تاریخ"
        @click="clear"
      />
    </div>
  </UFormField>
</template>

<script setup>
import { ref, watch } from 'vue'
import { isoToJalali, jalaliToIso, toLatinDigits, toPersianTwoDigits } from '@/utils/jalali.js'

// Jalali date input for the panel. `modelValue` is an ISO string (`YYYY-MM-DD`, or
// `YYYY-MM-DDTHH:mm:ss` with `withTime`); the user types `۱۴۰۵/۰۱/۰۱` (Persian or Latin digits).
// The value is only emitted on blur/Enter, and an invalid entry shows the error without emitting.
const ERROR_TEXT = 'تاریخ نامعتبر'
const INPUT_PATTERN = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?$/

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  clearable: { type: Boolean, default: false },
  withTime: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const text = ref('')
const error = ref('')

const toDisplay = (iso) => {
  const parts = isoToJalali(iso)
  if (!parts) return ''
  const date = `${toPersianTwoDigits(parts.jy)}/${toPersianTwoDigits(parts.jm)}/${toPersianTwoDigits(parts.jd)}`
  if (!props.withTime || !/T\d{2}:\d{2}/.test(iso)) return date
  return `${date} ${toPersianTwoDigits(iso.slice(11, 13))}:${toPersianTwoDigits(iso.slice(14, 16))}`
}

watch(
  () => props.modelValue,
  (value) => {
    text.value = toDisplay(value)
    error.value = ''
  },
  { immediate: true },
)

// Clearing the text (or the X button) is a valid "no date" and emits ''.
const emitValue = (value) => {
  error.value = ''
  if (value !== props.modelValue) emit('update:modelValue', value)
}

const commit = () => {
  const raw = toLatinDigits(text.value).trim()
  if (!raw) return emitValue('')

  const match = INPUT_PATTERN.exec(raw)
  const hasTime = Boolean(match?.[4])
  if (!match || (hasTime && !props.withTime)) {
    error.value = ERROR_TEXT
    return
  }

  const date = jalaliToIso(match[1], match[2], match[3])
  const hours = hasTime ? Number(match[4]) : 0
  const minutes = hasTime ? Number(match[5]) : 0
  if (!date || hours > 23 || minutes > 59) {
    error.value = ERROR_TEXT
    return
  }

  const value = props.withTime
    ? `${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
    : date
  text.value = toDisplay(value)
  emitValue(value)
}

const clear = () => {
  text.value = ''
  emitValue('')
}
</script>
