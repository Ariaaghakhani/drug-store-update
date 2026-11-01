<template>
  <section v-if="loading || failed || brands.length > 0" class="py-12">
    <div class="flex items-center justify-between mb-8 gap-4">
      <h2 class="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">
        برندهای <span class="text-brand-500">محبوب</span>
      </h2>
    </div>

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="sk" class="flex gap-4 overflow-hidden">
          <USkeleton v-for="i in 8" :key="i" class="h-28 w-36 shrink-0 rounded-xl" />
        </div>

        <div
          v-else-if="failed"
          key="failed"
          class="flex items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400"
        >
          <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5" />
          <span>برندها بارگذاری نشد</span>
          <UButton color="neutral" variant="soft" size="sm" @click="refresh()">تلاش دوباره</UButton>
        </div>

        <div v-else key="content" class="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <NuxtLink
            v-for="brand in brands"
            :key="brand.id"
            :to="`/brands/${brand.id}`"
            class="shrink-0 w-36 h-28 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center justify-center gap-2 p-3"
          >
            <img
              v-if="brand.logoUrl"
              :src="brand.logoUrl"
              :alt="brand.name"
              loading="lazy"
              class="max-h-12 max-w-full object-contain"
            />
            <UIcon
              v-else
              name="i-heroicons-building-storefront"
              class="w-10 h-10 text-gray-300 dark:text-gray-600"
            />
            <span class="text-sm font-bold text-gray-700 dark:text-gray-300 line-clamp-1">
              {{ brand.name }}
            </span>
          </NuxtLink>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup>
// Brand strip for the home page: GET api/storefront/brands?limit=12 (most products first, brands without products hidden).
// An empty list (no active goods have a brand yet) hides the section; a failed call shows a retry line instead, so the
// two can be told apart.
const { $api } = useNuxtApp()

const { data: brands, status, error, refresh } = useAsyncData(
  'storefront-brands',
  async () => (await $api.storefront.listBrands({ params: { limit: 12 } })).data.data ?? [],
  { server: false, default: () => [] }
)

const loading = computed(() => status.value === 'idle' || status.value === 'pending')
const failed = computed(() => Boolean(error.value) && !loading.value)
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
