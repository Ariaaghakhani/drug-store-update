<template>
  <UContainer>
    <div class="py-12 space-y-8">
      <!-- Store doesn't track expiry: the page doesn't exist for it -->
      <div v-if="unavailable" class="text-center py-20">
        <UIcon
          name="i-heroicons-clock"
          class="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4"
        />
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          این بخش در این فروشگاه فعال نیست
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">می‌توانید همه محصولات را ببینید</p>
        <UButton to="/medications" color="primary" icon="i-heroicons-shopping-bag">
          مشاهده همه محصولات
        </UButton>
      </div>

      <template v-else>
        <div>
          <h1 class="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4">
            <span class="text-brand-500">زودمصرف</span>ها
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            <template v-if="days">
              محصولاتی که تا {{ days.toLocaleString('fa-IR') }} روز دیگر منقضی می‌شوند، با قیمت مناسب‌تر
            </template>
            <template v-else>محصولاتی که به‌زودی منقضی می‌شوند، با قیمت مناسب‌تر</template>
          </p>
        </div>

        <div class="flex justify-end">
          <USelect
            :model-value="sort"
            :items="SORT_ITEMS"
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
          empty-icon="i-heroicons-clock"
          empty-title="محصول زودمصرفی وجود ندارد"
          empty-text="در حال حاضر کالایی نزدیک به انقضا نداریم"
          @add-to-cart="addToCart"
        />

        <div v-if="!loading && !failed && totalPages > 1" class="flex justify-center pt-4">
          <UPagination :page="page" :total="totalElements" :items-per-page="PAGE_SIZE" @update:page="setPage" />
        </div>
      </template>
    </div>
  </UContainer>
</template>

<script setup>
import { computed } from 'vue'

const PAGE_SIZE = 12
const DEFAULT_SORT = 'SOONEST_EXPIRY'
const SORT_ITEMS = [
  { label: 'زودترین انقضا', value: DEFAULT_SORT },
  { label: 'بیشترین تخفیف', value: 'MOST_DISCOUNTED' },
  { label: 'ارزان‌ترین', value: 'CHEAPEST' },
  { label: 'گران‌ترین', value: 'MOST_EXPENSIVE' },
]

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const { addToCart } = useAddToCart()
const { profile, expiryRequired } = useStoreProfile()

// the flag reads off until the profile loads, so only call the page unavailable once it actually has
const unavailable = computed(() => Boolean(profile.value) && !expiryRequired.value)

const page = computed(() => Math.max(1, parseInt(route.query.page, 10) || 1))
const sort = computed(() => (SORT_ITEMS.some((item) => item.value === route.query.sort) ? route.query.sort : DEFAULT_SORT))

const go = (next) => {
  const query = {}
  if (next.sort !== DEFAULT_SORT) query.sort = next.sort
  if (next.page > 1) query.page = String(next.page)
  return router.push({ path: '/near-expiry', query })
}
const changeSort = (value) => go({ sort: value, page: 1 })
const setPage = (value) => {
  go({ sort: sort.value, page: value })
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

const params = computed(() => ({ sort: sort.value, page: page.value - 1, size: PAGE_SIZE }))

const { data, status, error, refresh } = useAsyncData(
  'storefront-near-expiry',
  async () => (await $api.storefront.listNearExpiry({ params: params.value })).data.data,
  { server: false, watch: [params] }
)

const loading = computed(() => status.value === 'idle' || status.value === 'pending')
const failed = computed(() => Boolean(error.value) && !loading.value)
const days = computed(() => data.value?.days ?? 0)
const products = computed(() => (data.value?.goods?.content ?? []).map((card) => toProductCard(card)))
const totalElements = computed(() => data.value?.goods?.totalElements ?? 0)
const totalPages = computed(() => data.value?.goods?.totalPages ?? 0)

useHead({ title: 'زودمصرف‌ها | داروخانه آنلاین' })
</script>
