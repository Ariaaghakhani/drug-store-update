<template>
  <UModal
    :open="open"
    title="انتقال موجودی"
    :description="row ? `${row.goodsName ?? ''} · از ${row.warehouseName ?? ''}` : ''"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <form v-if="row" class="space-y-4" dir="rtl" @submit.prevent="submit">
        <UFormField label="انبار مقصد">
          <USelect
            v-model="toWarehouseId"
            :items="destinationOptions"
            placeholder="انتخاب انبار"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="تعداد"
          :help="`حداکثر ${available.toLocaleString('fa-IR')} عدد؛ موجودی رزروشده منتقل نمی‌شود`"
          :error="quantityError"
        >
          <UInput v-model="quantityInput" inputmode="numeric" dir="ltr" autocomplete="off" class="w-full" />
        </UFormField>

        <UFormField label="یادداشت (اختیاری)">
          <UTextarea v-model="note" :rows="2" maxlength="500" class="w-full" />
        </UFormField>

        <div class="flex gap-3">
          <UButton color="neutral" variant="soft" class="flex-1 justify-center" @click="emit('update:open', false)">
            انصراف
          </UButton>
          <UButton type="submit" color="primary" class="flex-1 justify-center" :loading="saving" :disabled="!canSubmit">
            ثبت انتقال
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
  warehouses: { type: Array, required: true },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['update:open', 'submit'])

const toWarehouseId = ref(undefined)
const quantityInput = ref('')
const note = ref('')

const available = computed(() => props.row?.availableQuantity ?? 0)
const quantity = computed(() => parseQuantity(quantityInput.value))

const destinationOptions = computed(() =>
  props.warehouses
    .filter((warehouse) => warehouse.id !== props.row?.warehouseId)
    .map((warehouse) => ({ value: String(warehouse.id), label: warehouse.name }))
)

const quantityError = computed(() => {
  if (quantityInput.value === '') return undefined
  if (quantity.value === null) return 'یک عدد صحیح وارد کنید'
  if (quantity.value === 0) return 'تعداد باید بیشتر از صفر باشد'
  if (quantity.value > available.value) return 'بیشتر از موجودی قابل انتقال است'
  return undefined
})

const canSubmit = computed(() => Boolean(toWarehouseId.value) && quantity.value !== null && !quantityError.value)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    toWarehouseId.value = undefined
    quantityInput.value = ''
    note.value = ''
  }
)

function submit() {
  if (!canSubmit.value || props.saving) return
  emit('submit', {
    fromInventoryId: props.row.id,
    toWarehouseId: Number(toWarehouseId.value),
    quantity: quantity.value,
    note: note.value.trim() || null,
  })
}
</script>
