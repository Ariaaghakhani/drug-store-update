<template>
  <UCard
    class="group hover:shadow-xl transition-all duration-300 h-full flex flex-col"
  >
    <div class="space-y-4 flex-1 flex flex-col">
      <!-- Product Image -->
      <div
        class="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800"
      >
        <!-- Badge -->
        <div v-if="product.badge" class="absolute top-3 start-3 z-10">
          <UBadge :color="badgeColor" variant="solid" size="md">
            {{ getBadgeLabel(product.badge) }}
          </UBadge>
        </div>

        <!-- Image Placeholder -->
        <div class="w-full h-full flex items-center justify-center">
          <UIcon
            name="i-heroicons-cube"
            class="w-32 h-32 text-gray-300 dark:text-gray-600"
          />
        </div>

        <!-- Quick View Button -->
        <div
          class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
        >
          <UButton
            color="white"
            icon="i-heroicons-eye"
            size="lg"
            @click.stop="$emit('quickView', product)"
          >
            مشاهده سریع
          </UButton>
        </div>
      </div>

      <!-- Product Info -->
      <div class="space-y-3 flex-1 flex flex-col">
        <!-- Category -->
        <div
          class="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider"
        >
          {{ product.category }}
        </div>

        <!-- Name -->
        <h3
          class="font-bold text-gray-900 dark:text-white line-clamp-2 text-lg leading-tight"
        >
          {{ product.name }}
        </h3>

        <!-- Rating -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1">
            <UIcon
              name="i-heroicons-star-solid"
              class="w-5 h-5 text-yellow-400"
            />
            <span class="text-base font-bold text-gray-900 dark:text-white">
              {{ product.rating }}
            </span>
          </div>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            ({{ formatReviewCount(product.reviewCount) }} نظر)
          </span>
        </div>

        <!-- Price -->
        <div class="flex items-center gap-3 mt-auto">
          <span class="text-2xl font-black text-gray-900 dark:text-white">
            {{ product.price.toLocaleString('fa-IR') }} تومان
          </span>
          <span
            v-if="product.originalPrice"
            class="text-base text-gray-500 line-through"
          >
            {{ product.originalPrice.toLocaleString('fa-IR') }}
          </span>
        </div>

        <!-- Stock Status -->
        <div class="flex items-center gap-2 text-sm">
          <div
            class="w-2.5 h-2.5 rounded-full"
            :class="product.inStock ? 'bg-green-500' : 'bg-red-500'"
          />
          <span
            :class="
              product.inStock
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            "
            class="font-medium"
          >
            {{ product.inStock ? 'موجود در انبار' : 'ناموجود' }}
          </span>
        </div>
      </div>

      <!-- Add to Cart Button -->
      <UButton
        block
        color="primary"
        size="xl"
        :disabled="!product.inStock"
        icon="i-heroicons-shopping-cart"
        class="mt-4"
        @click.stop="$emit('addToCart', product)"
      >
        {{ product.inStock ? 'افزودن به سبد خرید' : 'اطلاع‌رسانی موجودی' }}
      </UButton>
    </div>
  </UCard>
</template>

<script>
export default {
  name: 'ProductCard',

  props: {
    product: {
      type: Object,
      required: true,
    },
  },

  emits: ['addToCart', 'quickView'],

  computed: {
    badgeColor() {
      const colors = {
        Popular: 'green',
        'Best Seller': 'blue',
        Premium: 'purple',
        New: 'orange',
      }
      return colors[this.product.badge] || 'primary'
    },
  },

  methods: {
    getBadgeLabel(badge) {
      const labels = {
        Popular: 'محبوب',
        'Best Seller': 'پرفروش',
        Premium: 'ویژه',
        New: 'جدید',
      }
      return labels[badge] || badge
    },

    formatReviewCount(count) {
      return count.toLocaleString('fa-IR')
    },
  },
}
</script>
