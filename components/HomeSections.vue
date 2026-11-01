<template>
  <div>
    <!-- Loading -->
    <section v-if="loading" key="sk" class="py-16 space-y-6">
      <USkeleton class="h-9 w-56 rounded-lg" />
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <USkeleton v-for="i in 4" :key="i" class="h-96 w-full rounded-xl" />
      </div>
    </section>

    <!-- Failed load: never read as "the store has nothing" -->
    <section v-else-if="failed" class="text-center py-20">
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
    </section>

    <!-- Empty (every section off or empty) -->
    <section v-else-if="sections.length === 0" class="text-center py-20">
      <UIcon
        name="i-heroicons-shopping-bag"
        class="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4"
      />
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
        هنوز محصولی برای نمایش نیست
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        به‌زودی محصولات فروشگاه اینجا نمایش داده می‌شود
      </p>
      <UButton color="primary" to="/medications" icon="i-heroicons-shopping-bag">
        مشاهده همه محصولات
      </UButton>
    </section>

    <template v-else>
      <section
        v-for="(section, index) in sections"
        :key="section.key"
        class="py-12"
        :class="index % 2 === 1 ? 'bg-gray-50 dark:bg-gray-900/50 rounded-3xl px-6 lg:px-12 my-4' : ''"
      >
        <div class="flex items-center justify-between mb-8 gap-4">
          <h2 class="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">
            {{ section.title }}
          </h2>
          <UButton
            v-if="section.link"
            color="neutral"
            variant="soft"
            trailing-icon="i-heroicons-arrow-left"
            :to="section.link"
          >
            مشاهده همه
          </UButton>
        </div>

        <ProductGrid :products="section.cards" @add-to-cart="addToCart" />
      </section>
    </template>
  </div>
</template>

<script setup>
// Home page product sections: GET api/storefront/home. BACK returns them already ordered (timed offer, most discounted,
// special, best selling, newest, popular, most viewed, near expiry) and drops any section that is off or empty.
// The near-expiry section also needs the store's `expiryRequired` flag, so it is hidden until the profile says so.
const { $api } = useNuxtApp()
const { expiryRequired } = useStoreProfile()
const { addToCart } = useAddToCart()

const { data, status, error, refresh } = useAsyncData(
  'storefront-home',
  async () => (await $api.storefront.getHome()).data.data,
  { server: false }
)

const loading = computed(() => status.value === 'idle' || status.value === 'pending')
const failed = computed(() => Boolean(error.value))

const sections = computed(() =>
  (data.value?.sections ?? [])
    .filter((section) => section.items?.length)
    .filter((section) => section.key !== 'NEAR_EXPIRY' || expiryRequired.value)
    .map((section) => ({
      key: section.key,
      title: section.title,
      link: HOME_SECTION_LINKS[section.key] ?? null,
      cards: section.items.map((item) => toProductCard(item)),
    }))
)
</script>
