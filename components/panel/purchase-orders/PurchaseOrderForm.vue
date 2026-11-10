<!-- components/panel/purchase-orders/PurchaseOrderForm.vue -->
<template>
  <form id="purchase-order-form" dir="rtl" class="space-y-6 font-dana" @submit.prevent="onSubmit">
    <section class="space-y-4">
      <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">اطلاعات سفارش</h4>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="تأمین‌کننده" required :error="errors.supplierId">
          <div class="flex items-center gap-2">
            <USelectMenu
              v-model="form.supplierId"
              :items="supplierItems"
              value-key="value"
              placeholder="انتخاب تأمین‌کننده"
              class="w-full"
            />
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              icon="i-heroicons-plus"
              class="flex-shrink-0"
              @click="supplierModalOpen = true"
            >
              تأمین‌کننده جدید
            </UButton>
          </div>
        </UFormField>

        <JalaliDateInput v-model="form.dateExpected" label="تاریخ مورد انتظار" clearable />
      </div>

      <p v-if="suppliersFailed" class="text-xs text-error" role="alert">فهرست تأمین‌کنندگان دریافت نشد</p>

      <UFormField label="یادداشت" :error="errors.note" help="تا ۱۰۰۰ نویسه">
        <UTextarea v-model="form.note" :rows="2" :maxlength="1000" class="w-full" />
      </UFormField>
    </section>

    <section class="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
      <div class="flex items-center justify-between gap-3">
        <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">اقلام سفارش</h4>
        <UButton type="button" color="neutral" variant="soft" size="sm" icon="i-heroicons-plus" @click="addRow">
          افزودن کالا
        </UButton>
      </div>
      <p v-if="errors.items" class="text-xs text-error" role="alert">{{ errors.items }}</p>

      <div
        v-for="(row, index) in rows"
        :key="row.key"
        class="rounded-xl border border-gray-100 dark:border-gray-800 p-3 space-y-3"
      >
        <div class="flex items-start gap-2">
          <UFormField label="کالا" required :error="rowErrors[row.key]?.goodsId" class="flex-1 min-w-0">
            <USelectMenu
              :model-value="row.goodsId"
              :items="goodsItemsFor(row)"
              :search-term="searchTerms[row.key] ?? ''"
              ignore-filter
              value-key="value"
              placeholder="جستجوی کالا با نام فارسی"
              class="w-full"
              @update:model-value="(id) => pickGoods(row, id)"
              @update:search-term="(term) => onSearch(row, term)"
            />
          </UFormField>
          <UButton
            type="button"
            color="error"
            variant="ghost"
            square
            size="sm"
            icon="i-heroicons-trash"
            aria-label="حذف این ردیف"
            class="mt-6"
            @click="removeRow(index)"
          />
        </div>

        <p v-if="row.goodsId && duplicateGoodsIds.has(row.goodsId)" class="text-xs text-warning">
          این کالا چند بار در سفارش آمده است
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <UFormField label="تعداد" required :error="rowErrors[row.key]?.quantity">
            <UInput v-model="row.quantity" inputmode="numeric" dir="ltr" placeholder="۱" class="w-full" />
          </UFormField>
          <MoneyInput
            v-model="row.unitCost"
            label="قیمت خرید واحد"
            required
            :error="rowErrors[row.key]?.unitCost"
          />
        </div>

        <p class="text-xs text-gray-600 dark:text-gray-400">
          جمع سطر: {{ formatMoney(lineTotal(row)) }}
        </p>
      </div>

      <div
        v-if="rows.length"
        class="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3"
      >
        <span class="text-sm text-gray-600 dark:text-gray-400">جمع کل سفارش</span>
        <span class="text-base font-bold text-gray-900 dark:text-white">{{ formatMoney(grandTotal) }}</span>
      </div>
    </section>

    <SupplierModal v-model:open="supplierModalOpen" @created="onSupplierCreated" />
  </form>
</template>

<script setup>
// Create or edit a purchase order (DRAFT). The parent owns the buttons and submits with `form="purchase-order-form"`.
// Emits `submit(body)` with the create/update body (no `id`; the parent adds it for an update).
import JalaliDateInput from '@/components/panel/JalaliDateInput.vue'
import MoneyInput from '@/components/panel/MoneyInput.vue'
import SupplierModal from '@/components/panel/purchase-orders/SupplierModal.vue'
import { formatMoney } from '~/utils/money.js'
import { parseQuantity } from '~/utils/inventoryMeta.js'

const props = defineProps({
  // PurchaseOrderDTO to edit, or null to create
  initial: { type: Object, default: null },
  saving: { type: Boolean, default: false },
})
const emit = defineEmits(['submit'])

const app = useNuxtApp()

const SEARCH_DELAY = 300
const goodsLabel = (goods) => `${goods.goodCode} – ${goods.nameFa}`

// Suppliers for the select. A failed load keeps the form usable for the supplier already on the order.
const suppliers = ref([])
const suppliersFailed = ref(false)
const supplierModalOpen = ref(false)

const form = reactive({ supplierId: null, dateExpected: '', note: '' })

let rowSeq = 0
const makeRow = (data = {}) => ({
  key: ++rowSeq,
  goodsId: data.goodsId ?? null,
  goodsLabel: data.goodsLabel ?? '',
  quantity: data.quantity ?? '',
  unitCost: data.unitCost ?? null,
})
const rows = ref([])
const errors = ref({})
const rowErrors = ref({})

const supplierItems = computed(() => {
  const items = suppliers.value.map((supplier) => ({ value: supplier.id, label: supplier.name }))
  // The order's own supplier stays selectable even when it is missing from the list
  if (form.supplierId && !items.some((item) => item.value === form.supplierId)) {
    items.unshift({ value: form.supplierId, label: props.initial?.supplierName || '—' })
  }
  return items
})

const onSupplierCreated = (supplier) => {
  suppliers.value = [...suppliers.value, supplier]
  form.supplierId = supplier.id
}

// ---- goods search (debounced; a stale response never overwrites a newer one) ----
const searchTerms = reactive({})
const searchResults = reactive({})
const searchTokens = {}
const timers = new Map()

const runSearch = async (key, term) => {
  const token = (searchTokens[key] = (searchTokens[key] ?? 0) + 1)
  try {
    const res = await app.$api.goods.filterGoods({ data: { page: 1, size: 20, nameFa: term } })
    if (searchTokens[key] !== token) return
    searchResults[key] = res?.data?.data?.content ?? []
  } catch {
    if (searchTokens[key] === token) searchResults[key] = []
  }
}

const onSearch = (row, term) => {
  searchTerms[row.key] = term
  clearTimeout(timers.get(row.key))
  const query = String(term ?? '').trim()
  if (!query) {
    searchResults[row.key] = []
    return
  }
  timers.set(row.key, setTimeout(() => runSearch(row.key, query), SEARCH_DELAY))
}

// The selected goods stays in the options even after the search results change
const goodsItemsFor = (row) => {
  const items = (searchResults[row.key] ?? []).map((goods) => ({ value: goods.id, label: goodsLabel(goods) }))
  if (row.goodsId && !items.some((item) => item.value === row.goodsId)) {
    items.unshift({ value: row.goodsId, label: row.goodsLabel || String(row.goodsId) })
  }
  return items
}

const pickGoods = (row, id) => {
  const hit = (searchResults[row.key] ?? []).find((goods) => goods.id === id)
  row.goodsId = id
  if (hit) row.goodsLabel = goodsLabel(hit)
  searchTerms[row.key] = ''
  searchResults[row.key] = []
}

// ---- rows ----
const addRow = () => rows.value.push(makeRow())

const removeRow = (index) => {
  const [removed] = rows.value.splice(index, 1)
  if (!removed) return
  clearTimeout(timers.get(removed.key))
  timers.delete(removed.key)
  rowErrors.value = Object.fromEntries(Object.entries(rowErrors.value).filter(([key]) => Number(key) !== removed.key))
}

const lineTotal = (row) => {
  const quantity = parseQuantity(row.quantity)
  if (quantity === null || row.unitCost === null) return null
  return quantity * row.unitCost
}

const grandTotal = computed(() => rows.value.reduce((sum, row) => sum + (lineTotal(row) ?? 0), 0))

// Warning only: the same goods on two rows is allowed, but usually a mistake
const duplicateGoodsIds = computed(() => {
  const seen = new Set()
  const duplicates = new Set()
  for (const row of rows.value) {
    if (!row.goodsId) continue
    if (seen.has(row.goodsId)) duplicates.add(row.goodsId)
    seen.add(row.goodsId)
  }
  return duplicates
})

// ---- validation and submit ----
const validate = () => {
  errors.value = {}
  rowErrors.value = {}
  if (!form.supplierId) errors.value.supplierId = 'تأمین‌کننده را انتخاب کنید'
  if (!rows.value.length) errors.value.items = 'حداقل یک کالا اضافه کنید'
  if (form.note.length > 1000) errors.value.note = 'حداکثر ۱۰۰۰ نویسه'

  for (const row of rows.value) {
    const rowError = {}
    if (!row.goodsId) rowError.goodsId = 'کالا را انتخاب کنید'
    const quantity = parseQuantity(row.quantity)
    if (quantity === null || quantity < 1) rowError.quantity = 'عدد بزرگ‌تر از ۰'
    if (row.unitCost === null || row.unitCost < 0) rowError.unitCost = 'قیمت خرید را وارد کنید'
    if (Object.keys(rowError).length) rowErrors.value[row.key] = rowError
  }
  return Object.keys(errors.value).length === 0 && Object.keys(rowErrors.value).length === 0
}

const onSubmit = () => {
  if (props.saving || !validate()) return
  emit('submit', {
    supplierId: form.supplierId,
    dateExpected: form.dateExpected || null,
    note: form.note.trim() || null,
    items: rows.value.map((row) => ({
      goodsId: row.goodsId,
      quantityOrdered: parseQuantity(row.quantity),
      unitCost: row.unitCost,
    })),
  })
}

// ---- initial values (create = blank with one row; edit = from the DTO) ----
const initForm = () => {
  form.supplierId = props.initial?.supplierId ?? null
  form.dateExpected = props.initial?.dateExpected ?? ''
  form.note = props.initial?.note ?? ''
  rows.value = (props.initial?.items ?? []).map((item) =>
    makeRow({
      goodsId: item.goodsId,
      goodsLabel: `${item.goodsCode} – ${item.goodsName}`,
      quantity: String(item.quantityOrdered),
      unitCost: Number(item.unitCost),
    })
  )
  if (!rows.value.length) rows.value = [makeRow()]
  errors.value = {}
  rowErrors.value = {}
}

watch(() => props.initial, initForm, { immediate: true })

onMounted(async () => {
  try {
    const res = await app.$api.organization.listSuppliers()
    suppliers.value = res?.data?.data ?? []
  } catch {
    suppliersFailed.value = true
  }
})

onBeforeUnmount(() => timers.forEach((timer) => clearTimeout(timer)))
</script>
