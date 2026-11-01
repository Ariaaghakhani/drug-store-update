<template>
  <UContainer>
    <div class="py-12">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4">
          <template v-if="state.search">
            نتایج <span class="text-brand-500">جستجو</span>
          </template>
          <template v-else>
            همه <span class="text-brand-500">داروها</span>
          </template>
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          <template v-if="state.search">برای «{{ state.search }}»</template>
          <template v-else>جستجو و انتخاب از میان داروها و محصولات بهداشتی</template>
        </p>
      </div>

      <!-- Search + sort -->
      <form class="mb-8 flex flex-col md:flex-row gap-4" @submit.prevent="submitSearch">
        <UInput
          v-model="searchInput"
          placeholder="جستجو در داروها..."
          size="xl"
          icon="i-heroicons-magnifying-glass"
          class="flex-1"
        />
        <UButton type="submit" size="xl" color="primary" icon="i-heroicons-magnifying-glass">
          جستجو
        </UButton>
      </form>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <!-- Filters -->
        <aside class="lg:col-span-1 space-y-4">
          <UButton
            color="neutral"
            variant="soft"
            block
            class="lg:hidden"
            icon="i-heroicons-adjustments-horizontal"
            @click="showFilters = !showFilters"
          >
            {{ showFilters ? 'بستن فیلترها' : 'فیلترها' }}
            <span v-if="activeCount > 0">({{ activeCount.toLocaleString('fa-IR') }})</span>
          </UButton>

          <div :class="showFilters ? 'block' : 'hidden lg:block'">
            <SearchFilters
              :state="state"
              :facets="facets"
              :brands="brands"
              :loading="filtersLoading"
              @change="go"
            />
          </div>
        </aside>

        <!-- Results -->
        <section class="lg:col-span-3 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <p class="text-sm text-gray-600 dark:text-gray-400 min-h-5">
              <template v-if="!loading && !failed">
                {{ totalElements.toLocaleString('fa-IR') }} محصول یافت شد
              </template>
            </p>
            <USelect
              :model-value="state.sort || 'DEFAULT'"
              :items="sortItems"
              class="w-48"
              @update:model-value="changeSort"
            />
          </div>

          <!-- Failed load: never show as "no results" -->
          <div v-if="failed" class="text-center py-20">
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4"
            />
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
              دریافت محصولات ناموفق بود
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              اتصال به سرور برقرار نشد. لطفاً دوباره تلاش کنید
            </p>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="refresh()">
              تلاش دوباره
            </UButton>
          </div>

          <ProductGrid
            v-else
            class="transition-opacity"
            :class="refreshing ? 'opacity-50' : ''"
            :products="products"
            :loading="loading"
            :skeleton-count="PAGE_SIZE"
            grid-class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
            @add-to-cart="addToCart"
          >
            <template v-if="activeCount > 0 || state.search" #empty-action>
              <UButton class="mt-6" color="neutral" variant="soft" @click="go({ ...emptySearchState() })">
                پاک کردن جستجو و فیلترها
              </UButton>
            </template>
          </ProductGrid>

          <div v-if="!loading && !failed && totalPages > 1" class="flex justify-center pt-6">
            <UPagination
              :page="state.page"
              :total="totalElements"
              :items-per-page="PAGE_SIZE"
              @update:page="setPage"
            />
          </div>
        </section>
      </div>
    </div>
  </UContainer>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const PAGE_SIZE = 12

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const { addToCart } = useAddToCart()

// The URL is the single source of truth: every search/filter/sort/page change is a route change.
const state = computed(() => parseSearchQuery(route.query))
const activeCount = computed(() => activeFilterCount(state.value))

const go = (next, { replace = false } = {}) => {
  const location = { path: '/medications', query: buildSearchQuery(next) }
  return replace ? router.replace(location) : router.push(location)
}

// ---------- search box ----------
// Search as you type: the results follow the input after a short pause. Typing replaces the history entry (one back
// press leaves the page, not every keystroke); Enter / the button search at once.
const SEARCH_DEBOUNCE_MS = 350
const searchInput = ref('')
let searchTimer = null

const cancelPendingSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = null
}

// the URL changed (back button, hero search, "clear") → mirror it, but never rewrite what the user is mid-typing
watch(
  () => state.value.search,
  (value) => {
    if (searchInput.value.trim() !== value) searchInput.value = value
  },
  { immediate: true }
)

watch(searchInput, (value) => {
  const text = value.trim()
  cancelPendingSearch()
  if (text === state.value.search) return
  searchTimer = setTimeout(() => go({ ...state.value, search: text, page: 1 }, { replace: true }), SEARCH_DEBOUNCE_MS)
})

const submitSearch = () => {
  cancelPendingSearch()
  go({ ...state.value, search: searchInput.value.trim(), page: 1 })
}

onBeforeUnmount(cancelPendingSearch)

// ---------- sort ----------
// RELEVANCE only means something with a search text; without one BACK sorts newest-first
const sortItems = computed(() => [
  { label: 'پیش‌فرض', value: 'DEFAULT' },
  ...SORT_OPTIONS.filter((option) => option.value !== 'RELEVANCE' || state.value.search),
])

const changeSort = (value) => go({ ...state.value, sort: value === 'DEFAULT' ? '' : value, page: 1 })

// ---------- results ----------
const searchRequest = computed(() => toSearchRequest(state.value, { size: PAGE_SIZE }))

const { data: results, status, error, refresh } = useAsyncData(
  'storefront-search',
  async () => (await $api.search.searchGoods({ data: searchRequest.value })).data.data,
  { server: false, watch: [searchRequest] }
)

const fetching = computed(() => status.value === 'idle' || status.value === 'pending')
// skeletons only for the first load; a re-search keeps the previous results on screen (dimmed) until the new ones land
const loading = computed(() => fetching.value && !results.value)
const refreshing = computed(() => fetching.value && Boolean(results.value))
const failed = computed(() => Boolean(error.value) && !fetching.value)
const products = computed(() => (results.value?.content ?? []).map((doc) => toProductCard(doc)))
const totalElements = computed(() => results.value?.totalElements ?? 0)
const totalPages = computed(() => results.value?.totalPages ?? 0)

const setPage = (page) => {
  go({ ...state.value, page })
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ---------- filters ----------
const showFilters = ref(false)

const { data: brands } = useAsyncData(
  'storefront-filter-brands',
  async () => (await $api.storefront.listBrands({ params: { limit: 30 } })).data.data ?? [],
  { server: false, default: () => [] }
)

// Facet counts follow the active query but not its page or sort, so those two don't refetch them.
const facetsKey = computed(() => JSON.stringify(toSearchRequest({ ...state.value, sort: '' }, { withPaging: false })))

const { data: facets, status: facetsStatus } = useAsyncData(
  'storefront-facets',
  async () => {
    try {
      const body = toSearchRequest({ ...state.value, sort: '' }, { withPaging: false })
      return (await $api.search.searchGoodsFacets({ data: body })).data.data ?? []
    } catch {
      return [] // filters are optional; the list still works without them
    }
  },
  { server: false, default: () => [], watch: [facetsKey] }
)

// Only the very first load shows skeletons; later refreshes keep the panel in place so it doesn't flicker
const filtersLoading = computed(
  () => (facetsStatus.value === 'idle' || facetsStatus.value === 'pending') && facets.value.length === 0
)

useHead({
  title: computed(() => (state.value.search ? `جستجوی ${state.value.search} | داروخانه آنلاین` : 'همه داروها | داروخانه آنلاین')),
})
</script>
