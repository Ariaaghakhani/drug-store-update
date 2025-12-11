<template>
  <UContainer>
    <div class="py-12">
      <!-- Page Header -->
      <div class="mb-12">
        <h1
          class="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4"
        >
          همه <span class="text-brand-500">داروها</span>
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          جستجو و انتخاب از میان هزاران دارو و محصول بهداشتی
        </p>
      </div>

      <!-- Filters and Search -->
      <div class="mb-8 flex flex-col md:flex-row gap-4">
        <UInput
          v-model="searchQuery"
          placeholder="جستجو در داروها..."
          size="xl"
          icon="i-heroicons-magnifying-glass"
          class="flex-1"
        />
        <UButton
          size="xl"
          color="primary"
          icon="i-heroicons-adjustments-horizontal"
        >
          فیلترها
        </UButton>
      </div>

      <!-- Categories -->
      <div class="mb-8 flex gap-3 max-w-full overflow-x-auto">
        <UButton
          v-for="category in categories"
          :key="category.value"
          :color="selectedCategory === category.value ? 'primary' : 'white'"
          :variant="selectedCategory === category.value ? 'solid' : 'outline'"
          class="!min-w-fit"
          @click="selectedCategory = category.value"
        >
          {{ category.label }}
        </UButton>
      </div>

      <!-- Products Grid -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          @add-to-cart="handleAddToCart"
        />
      </div>

      <!-- Empty State -->
      <div v-if="filteredProducts.length === 0" class="text-center py-20">
        <UIcon
          name="i-heroicons-magnifying-glass"
          class="w-20 h-20 text-gray-300 mx-auto mb-4"
        />
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          محصولی یافت نشد
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          لطفاً کلمات کلیدی دیگری را امتحان کنید
        </p>
      </div>
    </div>
  </UContainer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '~/stores/cart'

const searchQuery = ref('')
const selectedCategory = ref('all')

const categories = [
  { label: 'همه', value: 'all' },
  { label: 'مسکن‌ها', value: 'pain' },
  { label: 'مکمل‌ها', value: 'supplements' },
  { label: 'سلامت قلب', value: 'heart' },
  { label: 'دیابت', value: 'diabetes' },
  { label: 'آلرژی', value: 'allergies' },
]

const products = [
  {
    id: '1',
    name: 'ویتامین D3 مقدار ۵۰۰۰ واحد',
    category: 'supplements',
    price: 129000,
    originalPrice: 169000,
    rating: 4.8,
    reviewCount: 1247,
    image: '/images/products/vitamin-d3.jpg',
    inStock: true,
    badge: 'Popular',
  },
  {
    id: '2',
    name: 'ایبوپروفن ۲۰۰ میلی‌گرم',
    category: 'pain',
    price: 84900,
    rating: 4.7,
    reviewCount: 892,
    image: '/images/products/ibuprofen.jpg',
    inStock: true,
    badge: 'Best Seller',
  },
  {
    id: '3',
    name: 'امگا-۳ روغن ماهی',
    category: 'heart',
    price: 199000,
    originalPrice: 249000,
    rating: 4.9,
    reviewCount: 2156,
    image: '/images/products/omega-3.jpg',
    inStock: true,
    badge: 'Premium',
  },
]

const cartStore = useCartStore()
const toast = useToast()

const filteredProducts = computed(() => {
  let filtered = products

  // Filter by category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter((p) => p.category === selectedCategory.value)
  }

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(query))
  }

  return filtered
})

const handleAddToCart = (product) => {
  cartStore.addItem(product)
  toast.add({
    title: 'به سبد خرید اضافه شد',
    description: product.name,
    icon: 'i-heroicons-check-circle',
    color: 'green',
  })
}

useHead({
  title: 'داروها | داروخانه آنلاین',
})
</script>
