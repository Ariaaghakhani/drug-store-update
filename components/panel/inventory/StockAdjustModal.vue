<template>
  <UModal
    :open="open"
    title="تعدیل موجودی"
    :description="row ? `${row.goodsName ?? ''} · ${row.warehouseName ?? ''}` : ''"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <form v-if="row" class="space-y-4" dir="rtl" @submit.prevent="submit">
        <UFormField label="علت">
          <USelect v-model="reason" :items="reasonOptions" class="w-full" />
        </UFormField>

        <UFormField v-if="meta.direction === 'either'" label="نوع تغییر">
          <USelect v-model="direction" :items="directionOptions" class="w-full" />
        </UFormField>

        <UFormField :label="isCount ? 'موجودی شمارش‌شده' : 'تعداد'" :error="quantityError">
          <UInput v-model="quantityInput" inputmode="numeric" dir="ltr" autocomplete="off" class="w-full" />
        </UFormField>

        <div class="rounded-lg bg-gray-50 dark:bg-gray-800/50 px-4 py-3 space-y-1.5 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-gray-500 dark:text-gray-400">موجودی فعلی</span>
            <span class="tabular-nums text-gray-900 dark:text-white">{{ onHand.toLocaleString('fa-IR') }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-500 dark:text-gray-400">رزرو سفارش‌ها</span>
            <span class="tabular-nums text-gray-900 dark:text-white">{{ reserved.toLocaleString('fa-IR') }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-500 dark:text-gray-400">موجودی بعد از تعدیل</span>
            <span class="tabular-nums font-bold text-gray-900 dark:text-white">
              {{ after === null ? '—' : after.toLocaleString('fa-IR') }}
            </span>
          </div>
        </div>

        <UFormField label="یادداشت (اختیاری)">
          <UTextarea v-model="note" :rows="2" maxlength="500" class="w-full" />
        </UFormField>

        <div class="flex gap-3">
          <UButton color="neutral" variant="soft" class="flex-1 justify-center" @click="emit('update:open', false)">
            انصراف
          </UButton>
          <UButton type="submit" color="primary" class="flex-1 justify-center" :loading="saving" :disabled="!canSubmit">
            ثبت تعدیل
          </UButton>
        </div>
      </form>
    </template>
  </UModal>
</template>

<script setup>
const props = defineProps({
  open: { type: Boolean, required: true },
  row: { type: Object, default: null },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['update:open', 'submit'])

const reasonOptions = Object.entries(ADJUSTMENT_REASON_META).map(([value, { label }]) => ({ value, label }))
const directionOptions = [
  { value: 'decrease', label: 'کاهش موجودی' },
  { value: 'increase', label: 'افزایش موجودی' },
]

const reason = ref('COUNT')
const direction = ref('decrease')
const quantityInput = ref('')
const note = ref('')

const meta = computed(() => ADJUSTMENT_REASON_META[reason.value])
const isCount = computed(() => meta.value.direction === 'count')
const onHand = computed(() => props.row?.quantityOnHand ?? 0)
const reserved = computed(() => props.row?.quantityReserved ?? 0)
const quantity = computed(() => parseQuantity(quantityInput.value))

// BACK takes exactly one of newQuantity (COUNT) or a signed change (every other reason)
const change = computed(() => {
  if (isCount.value || quantity.value === null) return null
  const decreases = meta.value.direction === 'decrease' || direction.value === 'decrease'
  return decreases ? -quantity.value : quantity.value
})

const after = computed(() => {
  if (quantity.value === null) return null
  return isCount.value ? quantity.value : onHand.value + change.value
})

const quantityError = computed(() => {
  if (quantityInput.value === '') return undefined
  if (quantity.value === null) return 'یک عدد صحیح وارد کنید'
  if (!isCount.value && quantity.value === 0) return 'تعداد باید بیشتر از صفر باشد'
  if (after.value < 0) return 'موجودی نمی‌تواند منفی شود'
  if (after.value < reserved.value) return 'موجودی نمی‌تواند کمتر از مقدار رزروشده باشد'
  return undefined
})

const canSubmit = computed(() => quantity.value !== null && !quantityError.value)

// A count starts from the current figure; a change starts empty
const resetQuantity = () => {
  quantityInput.value = isCount.value ? String(onHand.value) : ''
}

watch(reason, resetQuantity)
watch(
  () => props.open,
  (open) => {
    if (!open) return
    reason.value = 'COUNT'
    direction.value = 'decrease'
    note.value = ''
    resetQuantity()
  }
)

function submit() {
  if (!canSubmit.value || props.saving) return
  emit('submit', {
    inventoryId: props.row.id,
    reason: reason.value,
    ...(isCount.value ? { newQuantity: quantity.value } : { change: change.value }),
    note: note.value.trim() || null,
  })
}
</script>
