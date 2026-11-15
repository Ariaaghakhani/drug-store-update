<!-- components/panel/purchase-orders/ReceiveModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    title="دریافت کالا از سفارش خرید"
    icon="i-heroicons-archive-box-arrow-down"
    submit-label="ثبت دریافت"
    width="2xl"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <section class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="انبار مقصد" required :error="errors.warehouseId">
          <USelect
            v-model="warehouseKey"
            :items="warehouseItems"
            placeholder="انتخاب انبار"
            :disabled="!warehouses.length"
            class="w-full"
          />
        </UFormField>
        <UFormField label="یادداشت" :error="errors.note" help="تا ۵۰۰ نویسه">
          <UInput v-model="note" :maxlength="500" class="w-full" />
        </UFormField>
      </div>
      <p v-if="warehousesFailed" class="text-xs text-error" role="alert">فهرست انبارها دریافت نشد</p>
    </section>

    <section class="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
      <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">اقلام دریافتی</h4>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        تعداد صفر یا خالی یعنی آن قلم دریافت نمی‌شود. تعداد نباید از باقیمانده بیشتر باشد.
      </p>
      <p v-if="errors.lines" class="text-xs text-error" role="alert">{{ errors.lines }}</p>

      <div
        v-for="line in lines"
        :key="line.itemId"
        class="rounded-xl border border-gray-100 dark:border-gray-800 p-3 space-y-3"
      >
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <span class="text-sm font-semibold text-gray-900 dark:text-white">
            <span dir="ltr" class="font-mono">{{ line.goodsCode }}</span> · {{ line.goodsName }}
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            باقیمانده: {{ line.remaining.toLocaleString('fa-IR') }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <UFormField label="تعداد دریافتی" :error="line.error?.quantity">
            <UInput v-model="line.quantity" inputmode="numeric" dir="ltr" placeholder="۰" class="w-full" />
          </UFormField>
          <UFormField :label="batchRequired ? 'شماره بچ' : 'شماره بچ (اختیاری)'" :required="batchRequired" :error="line.error?.batchNumber">
            <UInput v-model="line.batchNumber" dir="ltr" :maxlength="255" class="w-full" />
          </UFormField>
          <div class="space-y-1">
            <JalaliDateInput v-model="line.manufactureDate" label="تاریخ تولید" clearable />
          </div>
          <div class="space-y-1">
            <JalaliDateInput
              v-model="line.expiryDate"
              :label="expiryRequired ? 'تاریخ انقضا *' : 'تاریخ انقضا (اختیاری)'"
              clearable
            />
            <p v-if="line.error?.expiryDate" class="text-xs text-error" role="alert">{{ line.error.expiryDate }}</p>
          </div>
        </div>
      </div>
    </section>
  </PanelFormModal>
</template>

<script setup>
// Receive part or all of a purchase order into one warehouse. Calls `receivePurchaseOrder` itself and emits
// `done({pending, dto})`: the page reloads on pending and takes `dto` otherwise (BACK answers with the whole PO).
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import JalaliDateInput from '@/components/panel/JalaliDateInput.vue'
import { apiErrorMessage, isPending } from '~/utils/apiError.js'
import { parseQuantity } from '~/utils/inventoryMeta.js'

const props = defineProps({
  open: { type: Boolean, required: true },
  // PurchaseOrderDTO being received
  purchaseOrder: { type: Object, default: null },
})
const emit = defineEmits(['update:open', 'done'])

const app = useNuxtApp()
const { profile, expiryRequired: expiryRequiredFlag } = useStoreProfile()

// Batch and expiry requirements come from the store profile (BACK StoreProfileDTO).
const batchRequired = computed(() => Boolean(profile.value?.batchRequired))
const expiryRequired = computed(() => Boolean(expiryRequiredFlag.value))

const warehouses = ref([])
const warehousesFailed = ref(false)
const warehouseKey = ref('')
const note = ref('')
const lines = ref([])
const errors = ref({})
const serverError = ref('')
const saving = ref(false)

const warehouseItems = computed(() =>
  warehouses.value.map((warehouse) => ({ value: String(warehouse.id), label: warehouse.name }))
)

const MAX_NOTE = 500
const MAX_TEXT = 255

// Each open starts from the order's remaining quantities and the default warehouse.
const resetForm = () => {
  note.value = ''
  errors.value = {}
  serverError.value = ''
  lines.value = (props.purchaseOrder?.items ?? [])
    .filter((item) => Number(item.remainingQuantity) > 0)
    .map((item) => ({
      itemId: item.id,
      goodsCode: item.goodsCode,
      goodsName: item.goodsName,
      remaining: Number(item.remainingQuantity),
      quantity: '',
      batchNumber: '',
      manufactureDate: '',
      expiryDate: '',
      error: {},
    }))
}

const loadWarehouses = async () => {
  warehousesFailed.value = false
  try {
    const res = await app.$api.inventory.listWarehouses()
    warehouses.value = res?.data?.data ?? []
    const preferred = warehouses.value.find((warehouse) => warehouse.isDefault) ?? warehouses.value[0]
    warehouseKey.value = preferred ? String(preferred.id) : ''
  } catch {
    warehouses.value = []
    warehousesFailed.value = true
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    resetForm()
    loadWarehouses()
  }
)

// A line counts only when its quantity is a positive whole number; empty or 0 means "not received now".
const lineQuantity = (line) => {
  const text = String(line.quantity ?? '').trim()
  if (text === '') return 0
  const parsed = parseQuantity(text)
  return parsed === null ? null : parsed
}

const validate = () => {
  errors.value = {}
  if (!warehouseKey.value) errors.value.warehouseId = 'انبار را انتخاب کنید'
  if (note.value.length > MAX_NOTE) errors.value.note = 'حداکثر ۵۰۰ نویسه'

  let received = 0
  for (const line of lines.value) {
    line.error = {}
    const quantity = lineQuantity(line)
    if (quantity === null) {
      line.error.quantity = 'عدد معتبر وارد کنید'
      continue
    }
    if (quantity === 0) continue
    received += 1
    if (quantity > line.remaining) line.error.quantity = `بیشتر از باقیمانده (${line.remaining.toLocaleString('fa-IR')})`
    const batch = line.batchNumber.trim()
    if (batchRequired.value && !batch) line.error.batchNumber = 'شماره بچ را وارد کنید'
    if (batch.length > MAX_TEXT) line.error.batchNumber = 'حداکثر ۲۵۵ نویسه'
    if (expiryRequired.value && !line.expiryDate) line.error.expiryDate = 'تاریخ انقضا را وارد کنید'
    if (line.manufactureDate && line.expiryDate && line.expiryDate < line.manufactureDate) {
      line.error.expiryDate = 'تاریخ انقضا باید بعد از تاریخ تولید باشد'
    }
  }

  if (received === 0 && !errors.value.lines) errors.value.lines = 'حداقل یک قلم با تعداد بیشتر از صفر وارد کنید'
  const hasLineError = lines.value.some((line) => Object.keys(line.error).length > 0)
  return Object.keys(errors.value).length === 0 && !hasLineError
}

const submit = async () => {
  if (saving.value || !validate()) return
  saving.value = true
  serverError.value = ''
  try {
    const body = {
      purchaseOrderId: props.purchaseOrder.id,
      warehouseId: Number(warehouseKey.value),
      note: note.value.trim() || null,
      lines: lines.value
        .filter((line) => lineQuantity(line) > 0)
        .map((line) => ({
          itemId: line.itemId,
          quantity: lineQuantity(line),
          batchNumber: line.batchNumber.trim() || null,
          manufactureDate: line.manufactureDate || null,
          expiryDate: line.expiryDate || null,
        })),
    }
    const res = await app.$api.orders.receivePurchaseOrder({ data: body })
    if (isPending(res)) {
      emit('done', { pending: true })
    } else {
      emit('done', { pending: false, dto: res.data.data })
    }
    emit('update:open', false)
  } catch (e) {
    serverError.value = apiErrorMessage(e, 'ثبت دریافت ناموفق بود')
  } finally {
    saving.value = false
  }
}
</script>
