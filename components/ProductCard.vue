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
        <div v-if="product.badge" class="absolute top-3 right-3 z-10">
          <UBadge :color="badgeColor" variant="solid" size="md">
            {{ product.badge }}
          </UBadge>
        </div>

        <!-- Prescription Required Badge -->
        <div
          v-if="product.isPrescriptionRequired"
          class="absolute top-3 left-3 z-10"
        >
          <UBadge color="orange" variant="solid" size="sm">
            <UIcon name="i-heroicons-document-text" class="w-3 h-3 ml-1" />
            نسخه‌دار
          </UBadge>
        </div>

        <!-- Image Placeholder -->
        <div class="w-full h-full flex items-center justify-center">
          <UIcon
            name="i-heroicons-cube"
            class="w-32 h-32 text-gray-300 dark:text-gray-600"
          />
        </div>
      </div>

      <!-- Product Info -->
      <div class="space-y-3 flex-1 flex flex-col">
        <!-- Brand & Category -->
        <div class="flex items-center justify-between text-xs">
          <span
            v-if="product.brandTitle"
            class="font-bold text-gray-600 dark:text-gray-400"
          >
            {{ product.brandTitle }}
          </span>
          <span
            v-if="product.category"
            class="font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider"
          >
            {{ product.category }}
          </span>
        </div>

        <!-- Name -->
        <h3
          class="font-bold text-gray-900 dark:text-white line-clamp-2 text-lg leading-tight"
        >
          {{ product.nameFa || 'نام محصول' }}
        </h3>

        <!-- English Name (if available) -->
        <p
          v-if="product.nameEn"
          class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1"
        >
          {{ product.nameEn }}
        </p>

        <!-- Rating -->
        <div v-if="product.rating" class="flex items-center gap-3">
          <div class="flex items-center gap-1">
            <UIcon
              name="i-heroicons-star-solid"
              class="w-5 h-5 text-yellow-400"
            />
            <span class="text-base font-bold text-gray-900 dark:text-white">
              {{ formatRating(product.rating) }}
            </span>
          </div>
          <span
            v-if="product.reviewCount"
            class="text-sm text-gray-500 dark:text-gray-400"
          >
            ({{ formatNumber(product.reviewCount) }} بازدید)
          </span>
        </div>

        <!-- Spacer to push content to bottom -->
        <div class="flex-1" />

        <!-- Price -->
        <div class="flex items-center gap-3">
          <div class="flex flex-col">
            <span class="text-2xl font-black text-gray-900 dark:text-white">
              {{ formatPrice(product.price) }}
              <span class="text-base">تومان</span>
            </span>
            <span
              v-if="product.originalPrice"
              class="text-sm text-gray-500 line-through"
            >
              {{ formatPrice(product.originalPrice) }} تومان
            </span>
          </div>
          <!-- Discount Badge -->
          <UBadge
            v-if="product.discountPercent"
            color="red"
            variant="solid"
            class="mr-auto"
          >
            {{ product.discountPercent }}٪ تخفیف
          </UBadge>
        </div>

        <!-- Fixed height container for notices -->
        <div class="min-h-[24px]">
          <!-- Unavailable Status (only shown when out of stock) -->
          <div
            v-if="!product.inStock"
            class="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium"
          >
            <div class="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>ناموجود</span>
          </div>

          <!-- Minimum Order Quantity Notice -->
          <div
            v-else-if="product.minOrderQuantity && product.minOrderQuantity > 1"
            class="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400"
          >
            <UIcon name="i-heroicons-information-circle" class="w-4 h-4" />
            <span
              >حداقل سفارش:
              {{ formatNumber(product.minOrderQuantity) }} عدد</span
            >
          </div>

          <!-- Expiry Warning (if expiring soon) -->
          <div
            v-else-if="isExpiringSoon"
            class="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400"
          >
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4" />
            <span>نزدیک به انقضا</span>
          </div>
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
        @click="handleAddToCart"
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
      default: () => ({}),
    },
  },

  emits: ['addToCart'],

  computed: {
    badgeColor() {
      const badge = this.product.badge

      const colorMap = {
        محبوب: 'green',
        پرفروش: 'blue',
        ویژه: 'purple',
        جدید: 'orange',
        'تخفیف ویژه': 'red',
      }

      return colorMap[badge] || 'primary'
    },

    isExpiringSoon() {
      if (!this.product.expiryDate) return false

      try {
        const expiryDate = new Date(this.product.expiryDate)
        const today = new Date()
        const threeMonthsFromNow = new Date()
        threeMonthsFromNow.setMonth(today.getMonth() + 3)

        return expiryDate <= threeMonthsFromNow && expiryDate > today
      } catch {
        return false
      }
    },
  },

  methods: {
    handleAddToCart(event) {
      event.preventDefault()
      event.stopPropagation()

      this.$emit('addToCart', this.product)
    },

    formatPrice(price) {
      if (price === null || price === undefined) return '0'
      return price.toLocaleString('fa-IR')
    },

    formatNumber(number) {
      if (number === null || number === undefined) return '0'
      return number.toLocaleString('fa-IR')
    },

    formatRating(rating) {
      if (rating === null || rating === undefined) return '0'
      return rating.toFixed(1)
    },
  },
}
</script>
