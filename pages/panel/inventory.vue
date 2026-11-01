<template>
  <div class="space-y-5">
    <ProductMetrics v-if="!loadError" :metrics="metrics" />

    <UCard :ui="{ body: 'p-0' }">
      <div class="flex items-center justify-between gap-4 flex-wrap px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-100 dark:bg-brand-900/20 flex-shrink-0">
            <UIcon name="i-heroicons-archive-box" class="w-5 h-5 text-brand-500 dark:text-brand-400" />
          </div>
          <div>
            <h1 class="text-lg font-black text-gray-900 dark:text-white">
              موجودی <span class="text-brand-500">انبار</span>
            </h1>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {{ rows.length.toLocaleString('fa-IR') }} ردیف موجودی
            </p>
          </div>
        </div>
        <UButton
          color="neutral"
          variant="soft"
          size="lg"
          icon="i-heroicons-arrow-path"
          :loading="loading"
          @click="fetchStock()"
        >
          به‌روزرسانی
        </UButton>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="جستجوی نام کالا یا شماره بچ…"
          class="flex-1"
        />
        <USelect v-model="warehouseFilter" :items="warehouseOptions" class="w-full sm:w-56" />
      </div>

      <InventoryTable
        :rows="pagedRows"
        :pending="loading"
        :page-size="PAGE_SIZE"
        :can-act="canAct"
        :can-transfer="warehouses.length > 1"
        @adjust="openAdjust"
        @transfer="openTransfer"
      >
        <template #empty>
          <div class="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
            <UIcon :name="emptyState.icon" class="w-16 h-16 text-gray-300 dark:text-gray-700" />
            <p class="text-base font-bold text-gray-900 dark:text-white">{{ emptyState.title }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ emptyState.text }}</p>
            <UButton
              v-if="emptyState.action"
              color="neutral"
              variant="soft"
              size="lg"
              class="mt-2"
              @click="emptyState.onClick"
            >
              {{ emptyState.action }}
            </UButton>
          </div>
        </template>
      </InventoryTable>
    </UCard>

    <div v-if="filteredRows.length > PAGE_SIZE" class="flex justify-center">
      <UPagination v-model:page="currentPage" :total="filteredRows.length" :items-per-page="PAGE_SIZE" />
    </div>

    <StockAdjustModal v-model:open="adjustOpen" :row="activeRow" :saving="saving" @submit="submitAdjust" />
    <StockTransferModal
      v-model:open="transferOpen"
      :row="activeRow"
      :warehouses="warehouses"
      :saving="saving"
      @submit="submitTransfer"
    />
  </div>
</template>

<script setup>
import ProductMetrics from '@/components/panel/products/ProductMetrics.vue'
import InventoryTable from '@/components/panel/inventory/InventoryTable.vue'
import StockAdjustModal from '@/components/panel/inventory/StockAdjustModal.vue'
import StockTransferModal from '@/components/panel/inventory/StockTransferModal.vue'

useHead({ title: 'موجودی انبار | پنل مدیریت' })

const PAGE_SIZE = 10

const app = useNuxtApp()
const toast = useToast()

const rows = ref([])
const loading = ref(true)
const loadError = ref(null) // null | 'forbidden' | 'failed'
const searchQuery = ref('')
const warehouseFilter = ref('all')
const currentPage = ref(1)

// ---------- warehouses ----------
// /api/warehouses needs WAREHOUSE READ, /api/inventories needs INVENTORY READ, and the menu shows for either. Someone with
// only INVENTORY READ still gets the warehouses that hold stock, collected from the rows.
const fetchedWarehouses = ref([])
const warehousesFromRows = ref(new Map())

const warehouses = computed(() =>
  fetchedWarehouses.value.length ? fetchedWarehouses.value : [...warehousesFromRows.value.values()]
)

const warehouseOptions = computed(() => [
  { value: 'all', label: 'همه انبارها' },
  ...warehouses.value.map((warehouse) => ({ value: String(warehouse.id), label: warehouse.name })),
])

async function fetchWarehouses() {
  try {
    const response = await app.$api.inventory.listWarehouses()
    fetchedWarehouses.value = response.data.data ?? []
  } catch {
    fetchedWarehouses.value = []
  }
}

// ---------- stock ----------
let latestRequest = 0

// `silent` refreshes after a mutation without flashing the skeleton
async function fetchStock({ silent = false } = {}) {
  const request = ++latestRequest
  if (!silent) loading.value = true
  try {
    const response = warehouseFilter.value === 'all'
      ? await app.$api.inventory.listInventory()
      : await app.$api.inventory.listInventoryByWarehouse({ data: { warehouseId: Number(warehouseFilter.value) } })
    if (request !== latestRequest) return
    rows.value = response.data.data ?? []
    loadError.value = null
    for (const row of rows.value) {
      if (row.warehouseId != null) {
        warehousesFromRows.value.set(row.warehouseId, { id: row.warehouseId, name: row.warehouseName })
      }
    }
    warehousesFromRows.value = new Map(warehousesFromRows.value)
  } catch (error) {
    if (request !== latestRequest) return
    if (silent) {
      toast.add({ title: 'به‌روزرسانی فهرست موجودی ناموفق بود', color: 'error' })
    } else {
      rows.value = []
      loadError.value = error?.response?.status === 403 ? 'forbidden' : 'failed'
    }
  } finally {
    if (request === latestRequest) loading.value = false
  }
}

const filteredRows = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return rows.value
  return rows.value.filter(
    (row) => row.goodsName?.toLowerCase().includes(query) || row.batchNumber?.toLowerCase().includes(query)
  )
})

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredRows.value.slice(start, start + PAGE_SIZE)
})

const metrics = computed(() => [
  {
    label: 'ردیف موجودی',
    value: rows.value.length,
    icon: 'i-heroicons-archive-box',
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    iconClass: 'text-gray-500 dark:text-gray-400',
  },
  {
    label: 'قابل فروش',
    value: rows.value.reduce((sum, row) => sum + Math.max(row.availableQuantity ?? 0, 0), 0),
    icon: 'i-heroicons-check-circle',
    bgClass: 'bg-success/10 dark:bg-success/20',
    iconClass: 'text-success',
  },
  {
    label: 'رزرو سفارش‌ها',
    value: rows.value.reduce((sum, row) => sum + (row.quantityReserved ?? 0), 0),
    icon: 'i-heroicons-clock',
    bgClass: 'bg-info/10 dark:bg-info/20',
    iconClass: 'text-info',
  },
  {
    label: 'کم‌موجود',
    value: rows.value.filter(isLowStock).length,
    icon: 'i-heroicons-exclamation-triangle',
    bgClass: 'bg-warning/10 dark:bg-warning/20',
    iconClass: 'text-warning',
  },
])

const emptyState = computed(() => {
  if (loadError.value === 'forbidden') {
    return {
      icon: 'i-heroicons-lock-closed',
      title: 'دسترسی به موجودی ندارید',
      text: 'برای مشاهده موجودی انبار، مجوز آن را از مدیر فروشگاه بگیرید',
    }
  }
  if (loadError.value === 'failed') {
    return {
      icon: 'i-heroicons-exclamation-triangle',
      title: 'دریافت موجودی ناموفق بود',
      text: 'اتصال را بررسی کنید و دوباره تلاش کنید',
      action: 'تلاش دوباره',
      onClick: () => fetchStock(),
    }
  }
  if (searchQuery.value.trim()) {
    return {
      icon: 'i-heroicons-magnifying-glass',
      title: 'نتیجه‌ای یافت نشد',
      text: 'نام کالا یا شماره بچ را بررسی کنید',
      action: 'پاک کردن جستجو',
      onClick: () => { searchQuery.value = '' },
    }
  }
  if (warehouseFilter.value !== 'all') {
    return {
      icon: 'i-heroicons-archive-box',
      title: 'این انبار موجودی ندارد',
      text: 'انبار دیگری را انتخاب کنید یا همه انبارها را ببینید',
      action: 'نمایش همه انبارها',
      onClick: () => { warehouseFilter.value = 'all' },
    }
  }
  return {
    icon: 'i-heroicons-archive-box',
    title: 'هنوز موجودی ثبت نشده است',
    text: 'موجودی با رسید خرید یا ورود کالا از فایل اکسل اضافه می‌شود',
  }
})

watch(warehouseFilter, () => {
  currentPage.value = 1
  fetchStock()
})
watch(searchQuery, () => {
  currentPage.value = 1
})
// A refresh can leave fewer rows than the current page needs
watch(filteredRows, (list) => {
  const lastPage = Math.max(Math.ceil(list.length / PAGE_SIZE), 1)
  if (currentPage.value > lastPage) currentPage.value = lastPage
})

// ---------- adjust / transfer ----------
// Row actions need INVENTORY ACTION, which the READ-only grants in userStore don't carry. If the check fails the actions
// stay visible and BACK has the final word.
const canAct = ref(true)

async function fetchActionGrant() {
  try {
    const response = await app.$api.auth.getMyPermissions({
      data: { allowed: true, modules: ['INVENTORY'], actions: ['ACTION'] },
    })
    canAct.value = (response.data.data ?? []).some((grant) => grant.allowed !== false)
  } catch {
    canAct.value = true
  }
}

const activeRow = ref(null)
const adjustOpen = ref(false)
const transferOpen = ref(false)
const saving = ref(false)

function openAdjust(row) {
  activeRow.value = row
  adjustOpen.value = true
}

function openTransfer(row) {
  activeRow.value = row
  transferOpen.value = true
}

async function mutate(call, successTitle, failureTitle, close) {
  saving.value = true
  try {
    await call()
    toast.add({ title: successTitle, color: 'success' })
    close()
    await fetchStock({ silent: true })
  } catch (error) {
    toast.add({ title: failureTitle, description: error?.response?.data?.message, color: 'error' })
  } finally {
    saving.value = false
  }
}

const submitAdjust = (data) =>
  mutate(
    () => app.$api.inventory.adjustInventory({ data }),
    'موجودی تعدیل شد',
    'تعدیل موجودی ناموفق بود',
    () => { adjustOpen.value = false }
  )

const submitTransfer = (data) =>
  mutate(
    () => app.$api.inventory.transferStock({ data }),
    'موجودی منتقل شد',
    'انتقال موجودی ناموفق بود',
    () => { transferOpen.value = false }
  )

onMounted(() => {
  fetchWarehouses()
  fetchActionGrant()
  fetchStock()
})
</script>
