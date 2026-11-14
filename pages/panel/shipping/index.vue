<!-- pages/panel/shipping/index.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader icon="i-heroicons-truck" title="روش‌های" accent="ارسال">
      <template #actions>
        <UButton color="primary" size="lg" icon="i-heroicons-plus" @click="openCreate">روش ارسال جدید</UButton>
      </template>
    </PanelPageHeader>

    <UCard :ui="{ body: 'p-0' }">
      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-for="i in 3" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
              <USkeleton class="w-10 h-10 rounded-xl flex-shrink-0" />
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-40" />
                <USkeleton class="h-3 w-56" />
              </div>
              <USkeleton class="h-6 w-11 rounded-full" />
            </div>
          </div>

          <PanelEmptyState
            v-else-if="forbidden"
            key="forbidden"
            variant="forbidden"
            title="دسترسی به روش‌های ارسال ندارید"
          />

          <PanelEmptyState
            v-else-if="error"
            key="error"
            variant="error"
            title="دریافت روش‌های ارسال ناموفق بود"
          >
            <template #action>
              <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
                تلاش دوباره
              </UButton>
            </template>
          </PanelEmptyState>

          <div v-else-if="methods.length" key="content" class="divide-y divide-gray-100 dark:divide-gray-800">
            <div
              v-for="row in methods"
              :key="row.id"
              class="flex items-start gap-4 px-4 sm:px-6 py-4"
            >
              <div
                class="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0"
              >
                <UIcon
                  :name="typeMetaOf(row.type).icon"
                  class="w-5 h-5 text-brand-500 dark:text-brand-400"
                />
              </div>

              <div class="flex-1 min-w-0 space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ row.title }}</p>
                  <StatusBadge :meta="row.active ? ACTIVE_META : INACTIVE_META" />
                  <UBadge v-if="row.slotsEnabled" color="info" variant="subtle" size="xs">زمان‌بندی</UBadge>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ typeMetaOf(row.type).label }}</p>
                <p class="text-sm text-gray-700 dark:text-gray-300">{{ costLine(row) }}</p>
                <p v-if="detailLine(row)" class="text-xs text-gray-500 dark:text-gray-400">{{ detailLine(row) }}</p>
              </div>

              <div class="flex items-center gap-2 flex-shrink-0">
                <USwitch
                  :model-value="row.active"
                  size="lg"
                  :disabled="togglingId === row.id"
                  :aria-label="`فعال بودن ${row.title}`"
                  :ui="SWITCH_UI"
                  @update:model-value="toggleActive(row, $event)"
                />
                <UButton color="neutral" variant="outline" size="sm" @click="openEdit(row)">ویرایش</UButton>
                <UButton
                  color="error"
                  variant="ghost"
                  square
                  icon="i-heroicons-trash"
                  aria-label="حذف روش ارسال"
                  :disabled="togglingId === row.id"
                  @click="deleteTarget = row"
                />
              </div>
            </div>
          </div>

          <PanelEmptyState
            v-else
            key="empty"
            icon="i-heroicons-truck"
            title="هنوز روش ارسالی ندارید"
          />
        </Transition>
      </div>
    </UCard>

    <ShippingMethodFormModal
      v-model:open="formOpen"
      :method="editing"
      @saved="reload"
    />

    <PanelConfirmDialog
      :open="deleteTarget !== null"
      title="حذف روش ارسال"
      :message="deleteTarget ? `«${deleteTarget.title}» حذف شود؟ سفارش‌های قبلی دست نمی‌خورند.` : ''"
      confirm-label="حذف"
      confirm-color="error"
      :loading="deleting"
      @update:open="(value) => { if (!value) deleteTarget = null }"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import ShippingMethodFormModal from '@/components/panel/shipping/ShippingMethodFormModal.vue'
import { formatMoney } from '~/utils/money.js'
import { apiErrorMessage, errorStatus } from '~/utils/apiError.js'
import {
  COVERAGE_LABELS,
  SHIPPING_TYPE_META,
  toShippingRequest,
  typeHasCost,
} from '~/utils/shippingMeta.js'

const app = useNuxtApp()
const toast = useAppToast()

const ACTIVE_META = { label: 'فعال', color: 'success' }
const INACTIVE_META = { label: 'غیرفعال', color: 'neutral' }
// Brand teal switch (DESIGN_SYSTEM "USwitch"): never color="teal"
const SWITCH_UI = {
  base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
}

const methods = ref([])
const loading = ref(true)
const error = ref(false)
const forbidden = ref(false)
const togglingId = ref(null)
const deleteTarget = ref(null)
const deleting = ref(false)
const formOpen = ref(false)
const editing = ref(null)

// Create opens an empty form; the row «ویرایش» opens that method's form.
const openCreate = () => {
  editing.value = null
  formOpen.value = true
}

const openEdit = (row) => {
  editing.value = row
  formOpen.value = true
}

const typeMetaOf = (type) => SHIPPING_TYPE_META[type] ?? { label: type ?? '—', icon: 'i-heroicons-truck' }

// «رایگان» for a zero cost, «بدون هزینه‌ی ارسال» for types that do not charge one.
const costLine = (row) => {
  if (!typeHasCost(row.type)) return 'بدون هزینه‌ی ارسال'
  const base = row.cost ? formatMoney(row.cost) : 'رایگان'
  return row.freeShippingThreshold ? `${base} · رایگان از ${formatMoney(row.freeShippingThreshold)}` : base
}

// «۲ تا ۴ روز» (or «۳ روز» when both ends match); coverage only for types that carry rates.
const detailLine = (row) => {
  const parts = []
  if (typeHasCost(row.type) && row.coverage) parts.push(COVERAGE_LABELS[row.coverage] ?? row.coverage)
  const days = [row.minDeliveryDays, row.maxDeliveryDays].filter((value) => value !== null && value !== undefined)
  if (days.length) {
    const low = Math.min(...days)
    const high = Math.max(...days)
    parts.push(
      low === high
        ? `${low.toLocaleString('fa-IR')} روز`
        : `${low.toLocaleString('fa-IR')} تا ${high.toLocaleString('fa-IR')} روز`
    )
  }
  return parts.join(' · ')
}

const fetchList = async () => {
  const res = await app.$api.shipping.adminListMethods()
  methods.value = res.data.data ?? []
}

// Page load: skeleton first, then one of forbidden / error / content / empty.
const load = async () => {
  loading.value = true
  error.value = false
  forbidden.value = false
  try {
    await fetchList()
  } catch (e) {
    if (errorStatus(e) === 403) forbidden.value = true
    else error.value = true
  } finally {
    loading.value = false
  }
}

// Silent refresh after a write: keeps the current rows on screen.
const reload = async () => {
  try {
    await fetchList()
  } catch (e) {
    toast.error(apiErrorMessage(e, 'بارگذاری روش‌های ارسال ناموفق بود'))
  }
}

const toggleActive = async (row, active) => {
  togglingId.value = row.id
  try {
    const res = await app.$api.shipping.adminUpdateMethod(row.id, {
      data: { ...toShippingRequest(row), active },
    })
    const updated = res.data.data
    methods.value = methods.value.map((item) => (item.id === row.id ? updated : item))
    toast.success(active ? 'روش ارسال فعال شد' : 'روش ارسال غیرفعال شد')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'تغییر وضعیت روش ارسال ناموفق بود'))
  } finally {
    togglingId.value = null
  }
}

const confirmDelete = async () => {
  deleting.value = true
  try {
    await app.$api.shipping.adminDeleteMethod(deleteTarget.value.id)
    deleteTarget.value = null
    toast.success('روش ارسال حذف شد')
    await reload()
  } catch (e) {
    toast.error(apiErrorMessage(e, 'حذف روش ارسال ناموفق بود'))
  } finally {
    deleting.value = false
  }
}

onMounted(load)

useHead({ title: 'روش‌های ارسال | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
