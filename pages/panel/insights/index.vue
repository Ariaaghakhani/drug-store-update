<!-- pages/panel/insights/index.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader icon="i-heroicons-light-bulb" title="تحلیل" accent="تقاضا" subtitle="علاقه‌مندی، انتظار موجودی و جستجوی مشتریان" />

    <UCard :ui="{ body: 'p-0' }">
      <div class="px-6 pt-3 border-b border-gray-100 dark:border-gray-800">
        <UTabs v-model="tab" :items="tabItems" :content="false" variant="link" color="primary" />
      </div>

      <div class="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <USelect v-model="limit" :items="LIMIT_ITEMS" size="sm" class="w-36" />
        <USelect v-if="activeDef.kind === 'search'" v-model="days" :items="DAY_ITEMS" size="sm" class="w-36" />
      </div>

      <div class="relative">
        <Transition name="sk">
          <div v-if="flagOff(activeDef)" key="off" class="px-6 py-10 text-center">
            <UIcon :name="activeDef.icon" class="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600" />
            <p class="mt-3 text-sm font-semibold text-gray-900 dark:text-white">{{ activeDef.disabledTitle }}</p>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">این بخش را از تنظیمات فروشگاه فعال کنید</p>
          </div>

          <div v-else-if="!current.loaded" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
              <USkeleton class="h-5 w-8 rounded" />
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-48" />
              </div>
              <USkeleton class="h-5 w-16 rounded-full" />
            </div>
          </div>

          <PanelEmptyState
            v-else-if="current.forbidden"
            key="forbidden"
            variant="forbidden"
            :title="`دسترسی به ${activeDef.label} ندارید`"
          />

          <PanelEmptyState
            v-else-if="current.error"
            key="error"
            variant="error"
            :title="`دریافت ${activeDef.label} ناموفق بود`"
          >
            <template #action>
              <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load(activeDef.value)">
                تلاش دوباره
              </UButton>
            </template>
          </PanelEmptyState>

          <div v-else-if="current.rows.length" key="content" class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3 w-16">رتبه</th>
                  <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">
                    {{ activeDef.kind === 'search' ? 'متن جستجو' : 'کالا' }}
                  </th>
                  <th
                    v-for="column in activeDef.columns"
                    :key="column.key"
                    class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3"
                  >
                    {{ column.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, index) in current.rows"
                  :key="rowKey(row, index)"
                  class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <td class="px-6 py-3 align-top text-sm font-black text-gray-500 dark:text-gray-400">
                    {{ (index + 1).toLocaleString('fa-IR') }}
                  </td>
                  <td class="px-6 py-3 align-top">
                    <template v-if="activeDef.kind === 'goods'">
                      <NuxtLink
                        :to="`/panel/products/${row.goodsId}`"
                        class="text-sm font-semibold text-gray-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400"
                      >
                        {{ row.goodsName }}
                      </NuxtLink>
                    </template>
                    <template v-else>
                      <NuxtLink
                        v-if="activeDef.value === 'zero'"
                        :to="`/medications?search=${encodeURIComponent(row.queryText)}`"
                        class="text-sm font-semibold text-gray-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400"
                      >
                        {{ row.queryText }}
                      </NuxtLink>
                      <span v-else class="text-sm font-semibold text-gray-900 dark:text-white">{{ row.queryText }}</span>
                    </template>
                  </td>
                  <td
                    v-for="column in activeDef.columns"
                    :key="column.key"
                    class="px-6 py-3 align-top text-sm text-gray-700 dark:text-gray-300"
                  >
                    <template v-if="column.key === 'sellableQuantity'">
                      <StatusBadge v-if="Number(row.sellableQuantity) === 0" :meta="{ label: 'ناموجود', color: 'error' }" />
                      <span v-else>{{ Number(row.sellableQuantity ?? 0).toLocaleString('fa-IR') }}</span>
                    </template>
                    <span v-else>{{ Number(row[column.key] ?? 0).toLocaleString('fa-IR') }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <PanelEmptyState
            v-else
            key="empty"
            :icon="activeDef.icon"
            :title="activeDef.emptyTitle"
            :text="activeDef.emptyText"
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
const app = useNuxtApp()
const route = useRoute()
const router = useRouter()
const { canRead } = useModuleAccess()
const { profile, wishlistEnabled, stockAlertsEnabled } = useStoreProfile()

// Each tab is gated by its BACK module. A store with the feature switched off gets a note instead of the list.
// goods tabs rank products (columns come from the row); search tabs rank customer search texts over `days`.
const TABS = [
  {
    value: 'wishlist',
    label: 'علاقه‌مندی‌ها',
    icon: 'i-heroicons-heart',
    module: 'WISHLIST',
    kind: 'goods',
    flag: 'wishlistEnabled',
    disabledTitle: 'علاقه‌مندی‌ها در این فروشگاه غیرفعال است',
    columns: [{ key: 'wishCount', label: 'علاقه‌مندی' }],
    emptyTitle: 'علاقه‌مندی‌ای ثبت نشده است',
    emptyText: 'هنوز کالایی به علاقه‌مندی‌ها اضافه نشده است',
  },
  {
    value: 'stock',
    label: 'منتظر موجودی',
    icon: 'i-heroicons-bell-alert',
    module: 'STOCK_ALERT',
    kind: 'goods',
    flag: 'stockAlertsEnabled',
    disabledTitle: 'اطلاع‌رسانی موجودی در این فروشگاه غیرفعال است',
    columns: [
      { key: 'waitingCount', label: 'منتظر موجودی' },
      { key: 'sellableQuantity', label: 'موجودی قابل فروش' },
    ],
    emptyTitle: 'کالای پرتقاضایی پیدا نشد',
    emptyText: 'هنوز مشتری برای اطلاع از موجودی کالایی ثبت نکرده است',
  },
  {
    value: 'popular',
    label: 'پرجستجوها',
    icon: 'i-heroicons-magnifying-glass',
    module: 'GLOBAL_SEARCH',
    kind: 'search',
    columns: [{ key: 'count', label: 'جستجو' }],
    emptyTitle: 'جستجویی ثبت نشده است',
    emptyText: 'در بازه‌ی انتخاب‌شده مشتری جستجو نکرده است',
  },
  {
    value: 'zero',
    label: 'جستجوی بی‌نتیجه',
    icon: 'i-heroicons-no-symbol',
    module: 'GLOBAL_SEARCH',
    kind: 'search',
    columns: [{ key: 'count', label: 'تعداد' }],
    emptyTitle: 'جستجوی بی‌نتیجه‌ای نیست',
    emptyText: 'در بازه‌ی انتخاب‌شده همه‌ی جستجوها نتیجه داشته‌اند',
  },
]

const LIMIT_ITEMS = [20, 50, 100].map((value) => ({ value, label: `${value.toLocaleString('fa-IR')} مورد` }))
const DAY_ITEMS = [7, 30, 90, 365].map((value) => ({ value, label: `${value.toLocaleString('fa-IR')} روز اخیر` }))

const limit = ref(20)
const days = ref(7)

const tabItems = computed(() =>
  TABS.filter((item) => canRead(item.module)).map(({ label, value, icon }) => ({ label, value, icon }))
)

// The section lives in the query string (?tab=…), so a reload or a shared link keeps it
const tab = computed({
  get: () => {
    const allowed = tabItems.value.map((item) => item.value)
    return allowed.includes(route.query.tab) ? route.query.tab : (allowed[0] ?? 'wishlist')
  },
  set: (value) => router.replace({ query: { ...route.query, tab: value } }),
})

const activeDef = computed(() => TABS.find((item) => item.value === tab.value) ?? TABS[0])

// Store flags: only a loaded profile with the flag off hides the list. While the profile is unknown BACK decides.
const FLAG_REFS = { wishlistEnabled, stockAlertsEnabled }
const flagOff = (def) => Boolean(def.flag && profile.value && !FLAG_REFS[def.flag].value)

// ---- Per-tab state (rank lists are unpaged, so each tab keeps its own loading/forbidden/error/rows) ----
const states = reactive(
  Object.fromEntries(
    TABS.map((item) => [item.value, { rows: [], loaded: false, loading: false, error: false, forbidden: false }])
  )
)
const current = computed(() => states[activeDef.value.value])
const tokens = {}

const FETCHERS = {
  wishlist: () => app.$api.catalogAdmin.topWishlist({ params: { size: limit.value } }),
  stock: () => app.$api.catalogAdmin.topStockAlerts({ params: { size: limit.value } }),
  popular: () => app.$api.catalogAdmin.popularSearches({ params: { days: days.value, limit: limit.value } }),
  zero: () => app.$api.catalogAdmin.zeroResultSearches({ params: { days: days.value, limit: limit.value } }),
}

// A late response from an older request never overwrites a newer one
const load = async (key) => {
  if (flagOff(TABS.find((item) => item.value === key))) return
  const token = (tokens[key] = (tokens[key] ?? 0) + 1)
  const state = states[key]
  state.loading = true
  state.error = false
  state.forbidden = false
  try {
    const res = await FETCHERS[key]()
    if (tokens[key] !== token) return
    state.rows = res?.data?.data ?? []
  } catch (e) {
    if (tokens[key] !== token) return
    state.rows = []
    state.error = true
    state.forbidden = e?.response?.status === 403
  } finally {
    if (tokens[key] === token) {
      state.loading = false
      state.loaded = true
    }
  }
}

const rowKey = (row, index) => (row.goodsId != null ? `g-${row.goodsId}` : `q-${row.queryText}-${index}`)

// Opening a tab loads it (once per change of its controls). Changing the limit or the days reloads the active tab.
watch(tab, (key) => load(key))
watch([limit, days], () => load(tab.value))
watch(
  () => profile.value,
  () => load(tab.value)
)

onMounted(() => load(tab.value))

useHead({ title: 'تحلیل تقاضا | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
