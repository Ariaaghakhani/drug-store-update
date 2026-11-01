<template>
  <div class="relative">
    <Transition name="sk">
      <div v-if="loading" key="sk" :class="gridClass">
        <USkeleton v-for="i in skeletonCount" :key="i" class="h-96 w-full rounded-xl" />
      </div>

      <div v-else key="content">
        <div v-if="products.length > 0" :class="gridClass">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            @add-to-cart="$emit('addToCart', $event)"
          />
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-20">
          <UIcon
            :name="emptyIcon"
            class="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4"
          />
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {{ emptyTitle }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400">{{ emptyText }}</p>
          <slot name="empty-action" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
defineProps({
  products: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  skeletonCount: { type: Number, default: 8 },
  emptyIcon: { type: String, default: 'i-heroicons-magnifying-glass' },
  emptyTitle: { type: String, default: 'محصولی یافت نشد' },
  emptyText: { type: String, default: 'لطفاً کلمات کلیدی یا فیلترهای دیگری را امتحان کنید' },
  gridClass: {
    type: String,
    default: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
  },
})

defineEmits(['addToCart'])
</script>
