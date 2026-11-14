<!-- pages/panel/stock-movements/index.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader icon="i-heroicons-arrows-right-left" title="کاردکس" accent="موجودی" subtitle="حرکت‌های ورود و خروج انبار" />

    <UCard :ui="{ body: 'p-0' }">
      <div class="flex flex-wrap items-end gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <USelect v-model="filters.type" :items="typeOptions" size="sm" class="w-44" />
        <USelect v-model="filters.warehouseId" :items="warehouseOptions" size="sm" class="w-44" />
        <USelectMenu
          :model-value="filters.goodsId"
          :items="goodsOptions"
          :search-term="goodsSearchTerm"
          ignore-filter
          value-key="value"
          placeholder="کالا: جستجو با نام فارسی"
          class="w-64"
          @update:model-value="(value) => (filters.goodsId = value)"
          @update:search-term="onGoodsSearch"
        />
        <JalaliDateInput v-model="filters.fromDate" label="از تاریخ" clearable />
        <JalaliDateInput v-model="filters.toDate" label="تا تاریخ" clearable />
      </div>

      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-40" />
                <USkeleton class="h-3 w-64" />
              </div>
              <USkeleton class="h-5 w-16 rounded-full" />
            </div>
          </div>

          <PanelEmptyState
            v-else-if="forbidden"
            key="forbidden"
            variant="forbidden"
            title="دسترسی به کاردکس ندارید"
          />

          <PanelEmptyState
            v-else-if="error"
            key="error"
            variant="error"
            title="دریافت کاردکس ناموفق بود"
          >
            <template #action>
              <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="reload">
                تلاش دوباره
              </UButton>
            </template>
          </PanelEmptyState>

          <div v-else-if="items.length" key="content">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">زمان</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">کالا</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">انبار و بچ</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">نوع</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">مقدار</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">مانده</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">علت و مرجع</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">بهای واحد</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">ثبت‌کننده</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in items"
                    :key="row.id"
                    class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td class="px-6 py-3 align-top text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {{ formatJalali(row.createdAt, { withTime: true }) || '—' }}
                    </td>
                    <td class="px-6 py-3 align-top">
                      <NuxtLink
                        v-if="row.goodsId"
                        :to="`/panel/products/${row.goodsId}`"
                        class="text-sm font-semibold text-gray-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400"
                      >
                        {{ row.goodsName }}
                      </NuxtLink>
                      <p dir="ltr" class="text-xs font-mono text-gray-500 dark:text-gray-400 text-start">{{ row.goodsCode }}</p>
                    </td>
                    <td class="px-6 py-3 align-top text-sm text-gray-700 dark:text-gray-300">
                      <p>{{ row.warehouseName || '—' }}</p>
                      <p v-if="row.batchNumber" dir="ltr" class="text-xs font-mono text-gray-500 dark:text-gray-400 text-start">
                        بچ {{ row.batchNumber }}
                      </p>
                    </td>
                    <td class="px-6 py-3 align-top">
                      <StatusBadge :meta="movementTypeMeta(row.type)" />
                    </td>
                    <td class="px-6 py-3 align-top text-sm font-black whitespace-nowrap" :class="quantityTone(row.quantity)" dir="ltr">
                      {{ signedQuantity(row.quantity) }}
                    </td>
                    <td class="px-6 py-3 align-top text-sm text-gray-700 dark:text-gray-300">
                      {{ (row.balanceAfter ?? 0).toLocaleString('fa-IR') }}
                    </td>
                    <td class="px-6 py-3 align-top text-xs text-gray-600 dark:text-gray-400 max-w-64">
                      <p v-if="row.reason" class="text-gray-800 dark:text-gray-200">{{ reasonLabel(row.reason) }}</p>
                      <p v-if="row.note" class="leading-5">{{ row.note }}</p>
                      <NuxtLink
                        v-if="referenceLink(row)"
                        :to="referenceLink(row)"
                        class="text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        {{ referenceText(row) }}
                      </NuxtLink>
                      <p v-else-if="row.referenceType" class="text-gray-500 dark:text-gray-400">{{ referenceText(row) }}</p>
                      <p v-if="!row.reason && !row.note && !row.referenceType">—</p>
                    </td>
                    <td class="px-6 py-3 align-top text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {{ row.unitCost != null ? formatMoney(row.unitCost) : '—' }}
                    </td>
                    <td class="px-6 py-3 align-top text-xs text-gray-600 dark:text-gray-400">
                      {{ row.createdBy || '—' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="totalPages > 1" class="flex justify-center py-4">
              <UPagination v-model:page="page" :total="total" :items-per-page="PAGE_SIZE" />
            </div>
          </div>

          <PanelEmptyState
            v-else
            key="empty"
            icon="i-heroicons-arrows-right-left"
            title="حرکتی پیدا نشد"
            text="با این فیلترها حرکت موجودی ثبت نشده است"
          />
        </Transition>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import JalaliDateInput from '@/components/panel/JalaliDateInput.vue'
import { formatMoney } from '~/utils/money.js'
import { formatJalali } from '~/utils/jalali.js'
import { ADJUSTMENT_REASON_META, MOVEMENT_TYPE_META } from '~/utils/inventoryMeta.js'
import { metaOf, selectItems, labelOf } from '~/utils/enumMeta.js'

const app = useNuxtApp()
const route = useRoute()

const PAGE_SIZE = 20
const GOODS_SEARCH_DELAY = 300

// Filter values: 'all' means no filter. Dates are ISO yyyy-MM-dd from JalaliDateInput, '' means none.
const filters = reactive({
  type: 'all',
  warehouseId: 'all',
  goodsId: 'all',
  fromDate: '',
  toDate: '',
})

// Opening from a product page: ?goodsId= presets the goods filter
const presetGoodsId = Number(route.query.goodsId)
if (Number.isInteger(presetGoodsId) && presetGoodsId > 0) filters.goodsId = String(presetGoodsId)

const typeOptions = selectItems(MOVEMENT_TYPE_META, 'همه نوع‌ها')
const movementTypeMeta = (type) => metaOf(MOVEMENT_TYPE_META, type)
const reasonLabel = (reason) => labelOf(ADJUSTMENT_REASON_META, reason)

// ---- Warehouses (a failed load leaves only the 'all' option) ----
const warehouses = ref([])
const warehouseOptions = computed(() => [
  { value: 'all', label: 'همه انبارها' },
  ...warehouses.value.map((warehouse) => ({ value: String(warehouse.id), label: warehouse.name })),
])

onMounted(async () => {
  syncSelectedGoods(filters.goodsId)
  try {
    const res = await app.$api.inventory.listWarehouses()
    warehouses.value = res?.data?.data ?? []
  } catch {
    warehouses.value = []
  }
})

// ---- Goods picker: debounced search, the selected goods stays in the options ----
const goodsLabel = (goods) => `${goods.goodCode} – ${goods.nameFa}`
const goodsSearchTerm = ref('')
const goodsResults = ref([])
const selectedGoods = ref(null)
let goodsTimer = null
let goodsToken = 0

const runGoodsSearch = async (term) => {
  const token = ++goodsToken
  try {
    const res = await app.$api.goods.filterGoods({ data: { page: 1, size: 20, nameFa: term } })
    if (token !== goodsToken) return
    goodsResults.value = res?.data?.data?.content ?? []
  } catch {
    if (token === goodsToken) goodsResults.value = []
  }
}

const onGoodsSearch = (term) => {
  goodsSearchTerm.value = term
  clearTimeout(goodsTimer)
  const query = String(term ?? '').trim()
  if (!query) {
    goodsResults.value = []
    return
  }
  goodsTimer = setTimeout(() => runGoodsSearch(query), GOODS_SEARCH_DELAY)
}

const goodsOptions = computed(() => {
  const options = [{ value: 'all', label: 'همه کالاها' }]
  const seen = new Set(['all'])
  if (selectedGoods.value) {
    options.push(selectedGoods.value)
    seen.add(selectedGoods.value.value)
  }
  for (const goods of goodsResults.value) {
    const value = String(goods.id)
    if (seen.has(value)) continue
    seen.add(value)
    options.push({ value, label: goodsLabel(goods) })
  }
  return options
})

// Keeps the label of the goods the filter currently holds (the preset from the URL, or a pick)
const syncSelectedGoods = async (value) => {
  if (value === 'all') {
    selectedGoods.value = null
    return
  }
  if (selectedGoods.value?.value === value) return
  const found = goodsResults.value.find((goods) => String(goods.id) === value)
  if (found) {
    selectedGoods.value = { value, label: goodsLabel(found) }
    return
  }
  try {
    const res = await app.$api.goods.getGoods({ data: { id: Number(value) } })
    const goods = res?.data?.data
    selectedGoods.value = { value, label: goods ? goodsLabel(goods) : value }
  } catch {
    selectedGoods.value = { value, label: value }
  }
}

watch(() => filters.goodsId, syncSelectedGoods)

onBeforeUnmount(() => clearTimeout(goodsTimer))

// ---- Rows ----
// BACK pages the kardex 1-based, so the 1-based UPagination goes straight through (backendBase: 1).
const { items, total, totalPages, page, loading, error, forbidden, reload } = usePagedList(
  ({ page: backendPage, size }) => {
    const data = { page: backendPage, size }
    if (filters.type !== 'all') data.type = filters.type
    if (filters.warehouseId !== 'all') data.warehouseId = Number(filters.warehouseId)
    if (filters.goodsId !== 'all') data.goodsId = Number(filters.goodsId)
    if (filters.fromDate) data.fromDate = filters.fromDate
    if (filters.toDate) data.toDate = filters.toDate
    return app.$api.catalogAdmin.listStockMovements({ data })
  },
  { size: PAGE_SIZE, filters, backendBase: 1 }
)

const signedQuantity = (quantity) => {
  const value = Number(quantity ?? 0)
  return `${value > 0 ? '+' : ''}${value.toLocaleString('fa-IR')}`
}

const quantityTone = (quantity) => {
  const value = Number(quantity ?? 0)
  if (value > 0) return 'text-success dark:text-success'
  if (value < 0) return 'text-error dark:text-error'
  return 'text-gray-500 dark:text-gray-400'
}

// Order and purchase-order references open their page; a transfer only names its pair movement
const referenceLink = (row) => {
  if (!row.referenceId) return null
  if (row.referenceType === 'ORDER') return `/panel/orders/${row.referenceId}`
  if (row.referenceType === 'PURCHASE_ORDER') return `/panel/purchase-orders/${row.referenceId}`
  return null
}

const referenceText = (row) => {
  if (!row.referenceId) return ''
  if (row.referenceType === 'ORDER') return `سفارش #${row.referenceId.toLocaleString('fa-IR')}`
  if (row.referenceType === 'PURCHASE_ORDER') return `سفارش خرید #${row.referenceId.toLocaleString('fa-IR')}`
  if (row.referenceType === 'TRANSFER') return `انتقال #${row.referenceId.toLocaleString('fa-IR')}`
  return ''
}

useHead({ title: 'کاردکس موجودی | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
