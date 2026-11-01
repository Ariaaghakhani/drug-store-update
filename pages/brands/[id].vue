<template>
  <UContainer>
    <div class="py-12 space-y-8">
      <!-- Brand not found -->
      <div v-if="notFound" class="text-center py-20">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4"
        />
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">برند یافت نشد</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          برندی با این شناسه وجود ندارد یا در این فروشگاه نیست
        </p>
        <UButton to="/medications" color="primary" icon="i-heroicons-shopping-bag">
          مشاهده همه محصولات
        </UButton>
      </div>

      <template v-else>
        <!-- Brand header -->
        <div class="relative">
          <Transition name="sk">
            <div v-if="brandLoading" key="sk" class="flex items-center gap-6">
              <USkeleton class="w-24 h-24 rounded-xl shrink-0" />
              <div class="flex-1 space-y-3">
                <USkeleton class="h-9 w-64 rounded-lg" />
                <USkeleton class="h-5 w-full max-w-xl rounded-lg" />
              </div>
            </div>

            <div v-else-if="brand" key="content" class="flex items-center gap-6">
              <div
                class="w-24 h-24 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0 p-3"
              >
                <img
                  v-if="brand.logoUrl"
                  :src="brand.logoUrl"
                  :alt="brand.name"
                  class="max-h-full max-w-full object-contain"
                />
                <UIcon
                  v-else
                  name="i-heroicons-building-storefront"
                  class="w-10 h-10 text-gray-300 dark:text-gray-600"
                />
              </div>
              <div class="min-w-0">
                <h1 class="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">
                  محصولات <span class="text-brand-500">{{ brand.name }}</span>
                </h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {{ Number(brand.goodsCount).toLocaleString('fa-IR') }} محصول
                </p>
                <p v-if="brand.description" class="text-gray-700 dark:text-gray-300 mt-3 leading-relaxed whitespace-pre-line">
                  {{ brand.description }}
                </p>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Sort -->
        <div class="flex justify-end">
          <USelect
            :model-value="state.sort || 'DEFAULT'"
            :items="sortItems"
            class="w-48"
            @update:model-value="changeSort"
          />
        </div>

        <div v-if="failed" class="text-center py-20">
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4"
          />
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
            دریافت محصولات ناموفق بود
          </h3>
          <UButton class="mt-4" color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="refresh()">
            تلاش دوباره
          </UButton>
        </div>

        <ProductGrid
          v-else
          :products="products"
          :loading="loading"
          :skeleton-count="PAGE_SIZE"
          empty-title="محصولی برای این برند یافت نشد"
          empty-text="در حال حاضر محصول فعالی از این برند در دسترس نیست"
          @add-to-cart="addToCart"
        />

        <div v-if="!loading && !failed && totalPages > 1" class="flex justify-center pt-4">
          <UPagination
            :page="state.page"
            :total="totalElements"
            :items-per-page="PAGE_SIZE"
            @update:page="setPage"
          />
        </div>
      </template>
    </div>
  </UContainer>
</template>

<script setup>
import { computed } from 'vue'

const PAGE_SIZE = 12

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const { addToCart } = useAddToCart()

const brandId = computed(() => Number(route.params.id))
// only sort + page are meaningful here, the brand itself is the filter
const state = computed(() => parseSearchQuery(route.query))

const go = (next) => router.push({ path: route.path, query: buildSearchQuery({ ...emptySearchState(), sort: next.sort, page: next.page }) })

const sortItems = computed(() => [
  { label: 'پیش‌فرض', value: 'DEFAULT' },
  ...SORT_OPTIONS.filter((option) => option.value !== 'RELEVANCE'),
])
const changeSort = (value) => go({ sort: value === 'DEFAULT' ? '' : value, page: 1 })
const setPage = (page) => {
  go({ sort: state.value.sort, page })
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ---------- brand info (404 brand.not.found for an unknown id or the "no brand" row) ----------
const { data: brand, status: brandStatus, error: brandError } = useAsyncData(
  'storefront-brand',
  async () => (await $api.storefront.getBrand(brandId.value)).data.data,
  { server: false, watch: [brandId] }
)

const brandLoading = computed(() => brandStatus.value === 'idle' || brandStatus.value === 'pending')
const notFound = computed(() => !brandLoading.value && Boolean(brandError.value) && brandError.value?.response?.status === 404)

// ---------- its goods ----------
const searchRequest = computed(() =>
  toSearchRequest({ ...emptySearchState(), sort: state.value.sort, page: state.value.page, brandIds: [brandId.value] }, { size: PAGE_SIZE })
)

const { data: results, status, error, refresh } = useAsyncData(
  'storefront-brand-goods',
  async () => (await $api.search.searchGoods({ data: searchRequest.value })).data.data,
  { server: false, watch: [searchRequest] }
)

const loading = computed(() => status.value === 'idle' || status.value === 'pending')
const failed = computed(() => Boolean(error.value) && !loading.value)
const products = computed(() => (results.value?.content ?? []).map((doc) => toProductCard(doc)))
const totalElements = computed(() => results.value?.totalElements ?? 0)
const totalPages = computed(() => results.value?.totalPages ?? 0)

useHead({
  title: computed(() => (brand.value ? `${brand.value.name} | داروخانه آنلاین` : 'برند | داروخانه آنلاین')),
})
</script>
