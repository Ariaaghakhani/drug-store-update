<!-- components/panel/shipping/PickupHoursField.vue -->
<template>
  <div class="space-y-3">
    <div v-for="(row, index) in modelValue" :key="index" class="flex flex-col sm:flex-row gap-3 sm:items-start">
      <UFormField class="sm:flex-1 min-w-0" label="روز" required :error="rowError(index, 'dayOfWeek')">
        <USelect
          :model-value="row.dayOfWeek"
          :items="dayItems"
          placeholder="انتخاب روز"
          class="w-full"
          @update:model-value="patch(index, { dayOfWeek: $event })"
        />
      </UFormField>

      <UFormField class="sm:flex-1 min-w-0" label="از ساعت" required :error="rowError(index, 'opensAt')">
        <UInput
          :model-value="row.opensAt"
          type="time"
          dir="ltr"
          class="w-full"
          @update:model-value="patch(index, { opensAt: $event })"
        />
      </UFormField>

      <UFormField class="sm:flex-1 min-w-0" label="تا ساعت" required :error="rowError(index, 'closesAt')">
        <UInput
          :model-value="row.closesAt"
          type="time"
          dir="ltr"
          class="w-full"
          @update:model-value="patch(index, { closesAt: $event })"
        />
      </UFormField>

      <UButton
        class="self-end sm:self-start sm:mt-6 flex-shrink-0"
        color="error"
        variant="ghost"
        square
        icon="i-heroicons-trash"
        aria-label="حذف این بازه"
        @click="remove(index)"
      />
    </div>

    <p v-if="error" class="text-xs text-error">{{ error }}</p>

    <UButton
      color="neutral"
      variant="outline"
      size="sm"
      icon="i-heroicons-plus"
      :disabled="modelValue.length >= MAX_HOURS"
      @click="add"
    >
      افزودن بازه‌ی ساعت کاری
    </UButton>
  </div>
</template>

<script setup>
// Weekly pickup hours of a shipping method (v-model = [{dayOfWeek, opensAt, closesAt}], times as HH:mm).
import { WEEKDAYS } from '~/utils/weekdays.js'

const MAX_HOURS = 50

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  // Whole-field message (e.g. no range at all)
  error: { type: String, default: '' },
  // One object per row: {dayOfWeek?, opensAt?, closesAt?} with a message each
  rowErrors: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

const dayItems = WEEKDAYS.map((day) => ({ label: day.label, value: day.value }))

const rowError = (index, field) => props.rowErrors[index]?.[field] ?? ''

const patch = (index, changes) => {
  emit('update:modelValue', props.modelValue.map((row, i) => (i === index ? { ...row, ...changes } : row)))
}

const add = () => emit('update:modelValue', [...props.modelValue, { dayOfWeek: null, opensAt: '', closesAt: '' }])

const remove = (index) => emit('update:modelValue', props.modelValue.filter((_, i) => i !== index))
</script>
