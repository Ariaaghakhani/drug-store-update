<template>
  <section class="py-12">
    <div class="relative">
      <!-- Navigation Buttons -->
      <button
        v-if="canScrollPrev"
        class="absolute start-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        @click="scrollPrev"
      >
        <UIcon
          name="i-heroicons-chevron-right-20-solid"
          class="w-6 h-6 text-gray-700 dark:text-gray-300"
        />
      </button>

      <button
        v-if="canScrollNext"
        class="absolute end-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        @click="scrollNext"
      >
        <UIcon
          name="i-heroicons-chevron-left-20-solid"
          class="w-6 h-6 text-gray-700 dark:text-gray-300"
        />
      </button>

      <!-- Carousel Container -->
      <div
        ref="carouselContainer"
        class="overflow-x-auto scrollbar-hide scroll-smooth mx-6 md:mx-12"
        @scroll="handleScroll"
      >
        <div class="flex gap-4 pb-2">
          <!-- Category Cards -->
          <div
            v-for="category in categories"
            :key="category.id"
            class="flex-shrink-0 w-20 sm:w-40"
          >
            <button
              class="w-full p-4 rounded-xl bg-white dark:bg-transparent hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all group"
              :class="
                selectedCategory?.id === category.id
                  ? ' bg-brand-50 dark:bg-brand-900/0'
                  : ' hover:border-brand-300'
              "
              @click="selectCategory(category)"
            >
              <span class="flex flex-col items-center gap-3">
                <!-- Icon -->
                <span
                  class="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-colors"
                  :class="
                    selectedCategory?.id === category.id
                      ? 'bg-brand-500'
                      : 'bg-brand-100 dark:bg-brand-900 group-hover:bg-brand-200'
                  "
                >
                  <UIcon
                    :name="category.icon"
                    class="w-7 h-7 transition-colors"
                    :class="
                      selectedCategory?.id === category.id
                        ? 'text-white'
                        : 'text-brand-600 dark:text-brand-400'
                    "
                  />
                </span>
                <!-- Text -->
                <span
                  class="text-sm font-medium text-center line-clamp-2"
                  :class="
                    selectedCategory?.id === category.id
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-gray-700 dark:text-gray-300'
                  "
                >
                  {{ category.name }}
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Dots Indicator -->
      <div class="flex justify-center gap-2 mt-6">
        <div
          v-for="(dot, index) in totalDots"
          :key="index"
          class="w-2 h-2 rounded-full transition-all"
          :class="
            currentDot === index
              ? 'bg-brand-500 w-6'
              : 'bg-gray-300 dark:bg-gray-600'
          "
        />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

interface Category {
  id: number
  name: string
  icon: string
  slug: string
}

export default defineComponent({
  name: 'CategoriesCarousel',

  data() {
    return {
      selectedCategory: null as Category | null,
      canScrollPrev: false,
      canScrollNext: true,
      currentDot: 0,
      containerWidth: 0,
      categories: [
        {
          id: 1,
          name: 'مسکن و ضد درد',
          icon: 'i-heroicons-heart',
          slug: 'pain-relief',
        },
        {
          id: 2,
          name: 'ویتامین و مکمل',
          icon: 'i-heroicons-beaker',
          slug: 'vitamins',
        },
        {
          id: 3,
          name: 'قلب و عروق',
          icon: 'mdi:heart-pulse',
          slug: 'cardiovascular',
        },
        {
          id: 4,
          name: 'گوارش',
          icon: 'i-heroicons-sparkles',
          slug: 'digestive',
        },
        {
          id: 5,
          name: 'پوست و مو',
          icon: 'i-heroicons-user',
          slug: 'skin-hair',
        },
        {
          id: 6,
          name: 'اعصاب و روان',
          icon: 'mdi:brain',
          slug: 'mental-health',
        },
        {
          id: 7,
          name: 'تنفسی',
          icon: 'mdi:lungs',
          slug: 'respiratory',
        },
        {
          id: 8,
          name: 'کودکان',
          icon: 'mdi:baby-face-outline',
          slug: 'children',
        },
        {
          id: 9,
          name: 'زنان',
          icon: 'mdi:gender-female',
          slug: 'women',
        },
        {
          id: 10,
          name: 'دیابت',
          icon: 'mdi:water',
          slug: 'diabetes',
        },
        {
          id: 11,
          name: 'آنتی بیوتیک',
          icon: 'i-heroicons-shield-check',
          slug: 'antibiotics',
        },
        {
          id: 12,
          name: 'چشم و بینایی',
          icon: 'i-heroicons-eye',
          slug: 'eye-care',
        },
      ] as Category[],
    }
  },

  computed: {
    totalDots(): number {
      // Use reactive containerWidth to ensure re-computation on resize
      const width = this.containerWidth || 1
      const itemsPerView = Math.floor(width / 152) // 144px width + 16px gap
      return Math.max(
        1,
        Math.ceil(this.categories.length / Math.max(1, itemsPerView))
      )
    },
  },

  mounted() {
    this.updateContainerWidth()
    this.handleScroll()
    window.addEventListener('resize', this.handleResize)
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    scrollPrev() {
      const container = this.$refs.carouselContainer as HTMLElement
      if (container) {
        const scrollAmount = container.clientWidth
        const isRTL = document.documentElement.getAttribute('dir') === 'rtl'

        // RTL: prev means scroll right (positive), LTR: prev means scroll left (negative)
        const scrollDirection = isRTL ? scrollAmount : -scrollAmount
        container.scrollBy({ left: scrollDirection, behavior: 'smooth' })

        setTimeout(() => {
          this.handleScroll()
        }, 500)
      }
    },

    scrollNext() {
      const container = this.$refs.carouselContainer as HTMLElement
      if (container) {
        const scrollAmount = container.clientWidth
        const isRTL = document.documentElement.getAttribute('dir') === 'rtl'

        // RTL: next means scroll left (negative), LTR: next means scroll right (positive)
        const scrollDirection = isRTL ? -scrollAmount : scrollAmount
        container.scrollBy({ left: scrollDirection, behavior: 'smooth' })

        setTimeout(() => {
          this.handleScroll()
        }, 500)
      }
    },

    handleScroll() {
      const container = this.$refs.carouselContainer as HTMLElement
      if (container) {
        const isRTL = document.documentElement.getAttribute('dir') === 'rtl'

        // Get scroll position (handle RTL negative values)
        const scrollLeft = isRTL ? Math.abs(container.scrollLeft) : container.scrollLeft
        const maxScroll = container.scrollWidth - container.clientWidth

        // Can scroll prev if we've scrolled away from the start
        this.canScrollPrev = scrollLeft > 10
        // Can scroll next if we haven't reached the end
        this.canScrollNext = scrollLeft < maxScroll - 10

        // Calculate current dot
        if (maxScroll > 0) {
          const scrollPercentage = scrollLeft / maxScroll
          this.currentDot = Math.round(scrollPercentage * (this.totalDots - 1))
        } else {
          this.currentDot = 0
        }
      }
    },

    updateContainerWidth() {
      const container = this.$refs.carouselContainer as HTMLElement
      if (container) {
        this.containerWidth = container.clientWidth
      }
    },

    handleResize() {
      this.updateContainerWidth()
      this.handleScroll()
    },

    selectCategory(category: Category) {
      this.selectedCategory = category
      // Navigate to medications page with category filter
      this.$router.push(`/medications?category=${category.slug}`)
    },
  },
})
</script>

<style scoped>
/* Hide scrollbar */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
