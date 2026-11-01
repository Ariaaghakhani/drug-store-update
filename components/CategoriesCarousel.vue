<template>
  <section v-if="status !== 'unavailable'" class="py-12">
    <!-- Loading -->
    <div v-if="status === 'loading' || status === 'idle'" class="flex gap-4 overflow-hidden">
      <USkeleton v-for="i in 8" :key="i" class="h-32 w-28 shrink-0 rounded-xl" />
    </div>

    <!-- Failed (a 401/403 means the store hasn't opened categories to guests — that hides the section instead) -->
    <div v-else-if="status === 'failed'" class="flex items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5" />
      <span>دسته‌بندی‌ها بارگذاری نشد</span>
      <UButton color="neutral" variant="soft" size="sm" @click="load(true)">تلاش دوباره</UButton>
    </div>

    <div v-else class="relative">
      <!-- Navigation Buttons -->
      <button
        v-if="canScrollPrev"
        type="button"
        aria-label="قبلی"
        class="absolute start-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        @click="scrollPrev"
      >
        <UIcon name="i-heroicons-chevron-right-20-solid" class="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>

      <button
        v-if="canScrollNext"
        type="button"
        aria-label="بعدی"
        class="absolute end-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        @click="scrollNext"
      >
        <UIcon name="i-heroicons-chevron-left-20-solid" class="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>

      <!-- Carousel Container -->
      <div
        ref="carouselContainer"
        class="overflow-x-auto scrollbar-hide scroll-smooth mx-6 md:mx-12"
        @scroll="handleScroll"
      >
        <div class="flex gap-4 pb-2">
          <NuxtLink
            v-for="category in categories"
            :key="category.id"
            :to="`/medications?categoryId=${category.id}`"
            class="shrink-0 w-20 sm:w-40 p-4 rounded-xl bg-white dark:bg-transparent hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all group"
          >
            <span class="flex flex-col items-center gap-3">
              <span
                class="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center bg-brand-100 dark:bg-brand-900 group-hover:bg-brand-200 transition-colors"
              >
                <UIcon :name="categoryIcon(category.name)" class="w-7 h-7 text-brand-600 dark:text-brand-400" />
              </span>
              <span class="text-sm font-medium text-center line-clamp-2 text-gray-700 dark:text-gray-300">
                {{ category.name }}
              </span>
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

// Home category row from the store's category tree (top level only). Hidden unless BACK returns categories to guests.
const { tree, status, load } = useStoreCategories()

const categories = computed(() => tree.value)

const carouselContainer = ref(null)
const canScrollPrev = ref(false)
const canScrollNext = ref(true)

// RTL: scrollLeft is 0 at the start (right edge) and negative when scrolling left — don't "fix" this to LTR math
const handleScroll = () => {
  const container = carouselContainer.value
  if (!container) return
  const scrollLeft = Math.abs(container.scrollLeft)
  const maxScroll = container.scrollWidth - container.clientWidth
  canScrollPrev.value = scrollLeft > 10
  canScrollNext.value = scrollLeft < maxScroll - 10
}

const scrollPrev = () => {
  // in RTL, scrolling right (prev) means positive scrollLeft
  carouselContainer.value?.scrollBy({ left: carouselContainer.value.clientWidth, behavior: 'smooth' })
  setTimeout(handleScroll, 500)
}

const scrollNext = () => {
  carouselContainer.value?.scrollBy({ left: -carouselContainer.value.clientWidth, behavior: 'smooth' })
  setTimeout(handleScroll, 500)
}

// the row only exists once the categories have loaded
watch(categories, () => nextTick(handleScroll), { immediate: true })
if (import.meta.client) window.addEventListener('resize', handleScroll)
onBeforeUnmount(() => {
  if (import.meta.client) window.removeEventListener('resize', handleScroll)
})
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
