<template>
  <NuxtLink :to="`/medications/${product.linkId ?? product.id}`" class="block h-full">
    <UCard
      class="group hover:shadow-xl transition-all duration-300 h-full flex flex-col"
    >
      <div class="space-y-4 flex-1 flex flex-col">
        <!-- Product Image -->
        <div
          class="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800"
        >
          <!-- Badge -->
          <div v-if="product.badge" class="absolute top-3 end-3 z-10">
            <UBadge :color="badgeColor" variant="solid" size="md">
              {{ product.badge }}
            </UBadge>
          </div>

          <!-- Prescription Required Badge -->
          <div
            v-if="product.isPrescriptionRequired"
            class="absolute top-3 start-3 z-10"
          >
            <UBadge color="warning" variant="solid" size="sm">
              <UIcon name="i-heroicons-document-text" class="w-3 h-3 ms-1" />
              نسخه‌دار
            </UBadge>
          </div>

          <!-- Discount badge -->
          <div v-if="product.originalPrice && product.discountPercent" class="absolute bottom-3 start-3 z-10">
            <UBadge color="error" variant="solid" size="md">
              {{ formatCount(product.discountPercent) }}٪ تخفیف
            </UBadge>
          </div>

          <img
            v-if="product.image"
            :src="product.image"
            :alt="product.nameFa"
            loading="lazy"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <UIcon
              name="i-heroicons-cube"
              class="w-32 h-32 text-gray-300 dark:text-gray-600"
            />
          </div>
        </div>

        <!-- Product Info: every row is a fixed-height slot (empty when the product lacks that detail), so
             cards are identical in height and their price/notice/button line up whatever data they have -->
        <div class="flex-1 flex flex-col gap-2">
          <!-- Brand & Category -->
          <div class="flex items-center justify-between gap-2 text-xs h-4">
            <span
              v-if="product.brandTitle"
              class="font-bold text-gray-600 dark:text-gray-400 truncate"
            >
              {{ product.brandTitle }}
            </span>
            <span
              v-if="product.category"
              class="font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider truncate"
            >
              {{ product.category }}
            </span>
          </div>

          <!-- Name (two lines max) -->
          <h3
            class="font-bold text-gray-900 dark:text-white line-clamp-2 break-words text-lg leading-tight h-12"
          >
            {{ product.nameFa || 'نام محصول' }}
          </h3>

          <!-- Rating -->
          <div class="flex items-center gap-3 h-6">
            <template v-if="product.rating">
              <div class="flex items-center gap-1">
                <UIcon
                  name="i-heroicons-star-solid"
                  class="w-5 h-5 text-yellow-400"
                />
                <span class="text-base font-bold text-gray-900 dark:text-white">
                  {{ Number(product.rating).toLocaleString('fa-IR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }}
                </span>
              </div>
              <span
                v-if="product.reviewCount"
                class="text-sm text-gray-500 dark:text-gray-400"
              >
                ({{ formatCount(product.reviewCount) }} نظر)
              </span>
            </template>
          </div>

          <!-- Price -->
          <div class="flex items-center h-7 whitespace-nowrap">
            <span class="text-xl font-black text-gray-900 dark:text-white">
              <span v-if="product.hasVariants" class="text-sm font-medium">از </span>
              {{ Number(product.price || 0).toLocaleString('fa-IR') }}
              <span class="text-sm font-medium">تومان</span>
            </span>
          </div>

          <!-- Original price + saved amount -->
          <div class="flex items-center gap-2 h-6 whitespace-nowrap">
            <template v-if="product.originalPrice">
              <span class="text-sm text-gray-500 dark:text-gray-400 line-through">
                {{ Number(product.originalPrice).toLocaleString('fa-IR') }}
              </span>
              <span v-if="savings > 0" class="text-xs font-medium text-error truncate">
                {{ savings.toLocaleString('fa-IR') }} تومان صرفه‌جویی
              </span>
            </template>
          </div>

          <!-- Notice (out of stock / minimum order / expiry) -->
          <div class="h-6">
            <div
              v-if="!product.inStock"
              class="flex items-center gap-2 text-sm text-error font-medium"
            >
              <div class="w-2.5 h-2.5 rounded-full bg-error" />
              <span>ناموجود</span>
            </div>

            <div
              v-else-if="product.minOrderQuantity && product.minOrderQuantity > 1"
              class="flex items-center gap-2 text-xs text-info"
            >
              <UIcon name="i-heroicons-information-circle" class="w-4 h-4 shrink-0" />
              <span class="truncate">حداقل سفارش: {{ formatCount(product.minOrderQuantity) }} عدد</span>
            </div>

            <div
              v-else-if="product.expiryLabel"
              class="flex items-center gap-2 text-xs text-warning"
            >
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 shrink-0" />
              <span class="truncate">{{ product.expiryLabel }}</span>
            </div>
          </div>
        </div>

        <!-- Add to Cart Button -->
        <UButton
          block
          color="primary"
          size="xl"
          :disabled="!product.inStock"
          :icon="product.hasVariants ? 'i-heroicons-squares-2x2' : 'i-heroicons-shopping-cart'"
          class="mt-2 whitespace-nowrap"
          @click="handleAddToCart"
        >
          {{ buttonLabel }}
        </UButton>
      </div>
    </UCard>
  </NuxtLink>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['addToCart'])

const { formatCount } = useFormat()

const BADGE_COLORS = {
  محبوب: 'success',
  پرفروش: 'info',
  ویژه: 'secondary',
  جدید: 'warning',
  'تخفیف ویژه': 'error',
}

const badgeColor = computed(() => BADGE_COLORS[props.product.badge] || 'primary')

// what the discount saves on one unit
const savings = computed(() =>
  props.product.originalPrice ? Math.max(0, Math.round(props.product.originalPrice - props.product.price)) : 0
)

const buttonLabel = computed(() => {
  if (!props.product.inStock) return 'اطلاع‌رسانی موجودی'
  return props.product.hasVariants ? 'انتخاب گزینه‌ها' : 'افزودن به سبد خرید'
})

// The card is a link; the button must not follow it
const handleAddToCart = (event) => {
  event.preventDefault()
  event.stopPropagation()
  emit('addToCart', props.product)
}
</script>
