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
      <div class="mb-8 flex flex-wrap gap-3">
        <UButton
          v-for="category in categories"
          :key="category.value"
          :color="selectedCategory === category.value ? 'primary' : 'white'"
          :variant="selectedCategory === category.value ? 'solid' : 'outline'"
          @click="handleCategoryChange(category.value)"
        >
          {{ category.label }}
        </UButton>
      </div>

      <!-- Results Count -->
      <div v-if="!pending && totalElements > 0" class="mb-6">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          نمایش {{ filteredProducts.length }} محصول از {{ totalElements }} محصول
        </p>
      </div>

      <!-- Loading State -->
      <div
        v-if="pending"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <USkeleton v-for="i in 12" :key="i" class="h-80 w-full" />
      </div>

      <!-- Products Grid -->
      <div
        v-else-if="filteredProducts.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <NuxtLink
          v-for="product in filteredProducts"
          :key="product.id"
          :to="`/medications/${product.id}`"
        >
          <ProductCard
            :product="transformProduct(product)"
            @add-to-cart="handleAddToCart"
          />
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div
        v-if="!pending && filteredProducts.length === 0"
        class="text-center py-20"
      >
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

      <!-- Pagination -->
      <div v-if="!pending && totalPages > 1" class="flex justify-center mt-12">
        <UPagination
          v-model:page="currentPage"
          :total="totalElements"
          :page-count="pageSize"
          :max="7"
          :ui="{
            wrapper: 'flex items-center gap-1',
            rounded: 'first:rounded-s-md last:rounded-e-md',
          }"
          @update:page="handlePageChange"
        />
      </div>
    </div>
  </UContainer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '~/stores/cart'

// Head metadata
useHead({
  title: 'همه داروها | داروخانه آنلاین',
})

// Composables
const cartStore = useCartStore()
const toast = useAppToast()
const app = useNuxtApp()

// Reactive state
const searchQuery = ref('')
const selectedCategory = ref('all')
const currentPage = ref(1)
const pageSize = ref(12)
const products = ref([])
const totalElements = ref(0)
const totalPages = ref(0)
const pending = ref(false)

// Categories
const categories = ref([
  { label: 'همه', value: 'all' },
  { label: 'مسکن‌ها', value: 'pain' },
  { label: 'مکمل‌ها', value: 'supplements' },
  { label: 'سلامت قلب', value: 'heart' },
  { label: 'دیابت', value: 'diabetes' },
  { label: 'آلرژی', value: 'allergies' },
])

// Helper Methods
const isInStock = (product) => {
  if (!product) return false

  if (product.expiryDate) {
    try {
      const expiryDate = new Date(product.expiryDate)
      return expiryDate > new Date()
    } catch {
      return true
    }
  }
  return true
}

const getBadge = (product) => {
  if (!product) return null

  if (product.discountPercent && product.discountPercent > 20) {
    return 'تخفیف ویژه'
  }
  if (product.rating && product.rating >= 4.8) {
    return 'محبوب'
  }
  if (product.viewsCount && product.viewsCount > 1000) {
    return 'پرفروش'
  }
  return null
}

const transformProduct = (product) => {
  if (!product) return null

  const originalPrice = product.discountPercent
    ? Math.round(product.price / (1 - product.discountPercent / 100))
    : null

  return {
    id: product.id || 0,
    nameFa: product.nameFa || 'نام محصول',
    nameEn: product.nameEn || '',
    description: product.description || '',
    category: product.categoryTitles?.[0] || 'سایر',
    price: product.price || 0,
    originalPrice: originalPrice,
    discountPercent: product.discountPercent || null,
    rating: product.rating || 0,
    reviewCount: product.viewsCount || 0,
    image: `/images/products/${product.goodCode || 'default'}.jpg`,
    inStock: isInStock(product),
    badge: getBadge(product),
    isPrescriptionRequired: product.isPrescriptionRequired || false,
    brandTitle: product.brandTitle || '',
    expiryDate: product.expiryDate || null,
    minOrderQuantity: product.minOrderQuantity || 1,
  }
}

const updateCategoriesFromProducts = () => {
  if (!products.value || products.value.length === 0) return

  const uniqueCategories = new Set()

  products.value.forEach((product) => {
    if (product.categoryTitles && product.categoryTitles.length > 0) {
      product.categoryTitles.forEach((cat) => uniqueCategories.add(cat))
    }
  })

  if (uniqueCategories.size === 0) return

  const dynamicCategories = Array.from(uniqueCategories).map((cat) => ({
    label: cat,
    value: cat.toLowerCase(),
  }))

  categories.value = [{ label: 'همه', value: 'all' }, ...dynamicCategories]
}

const fetchProducts = async () => {
  pending.value = true

  const config = {
    data: {
      page: currentPage.value - 1, // Backend expects 0-based index
      rows: pageSize.value,
    },
  }

  try {
    const response = await app.$api.products.fetchProductsList(config)
    const data = response?.data?.data

    products.value = data?.content || []
    totalElements.value = data?.totalElements || 0
    totalPages.value = data?.totalPages || 0

    // Dynamically populate categories from products (only on first load)
    if (currentPage.value === 1) {
      updateCategoriesFromProducts()
    }

    // Scroll to top after page change
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    console.error('Error fetching products:', error)
    toast.error('خطا در دریافت اطلاعات', 'لطفاً دوباره تلاش کنید')
    products.value = []
  } finally {
    pending.value = false
  }
}

const handlePageChange = async (page) => {
  currentPage.value = page
  await fetchProducts()
}

const handleCategoryChange = async (category) => {
  selectedCategory.value = category
  currentPage.value = 1 // Reset to first page when category changes
  await fetchProducts()
}

const handleAddToCart = (product) => {
  if (!product) return

  // Store handles the logic and returns the quantity added
  const quantityAdded = cartStore.addItem(product)

  // Show appropriate success toast based on quantity added
  if (quantityAdded > 1) {
    toast.success(
      'به سبد خرید اضافه شد',
      `${product.nameFa} - ${quantityAdded} عدد (حداقل سفارش)`
    )
  } else {
    toast.success('به سبد خرید اضافه شد', product.nameFa || 'محصول')
  }
}

// Computed properties
const filteredProducts = computed(() => {
  if (!products.value || products.value.length === 0) return []

  let filtered = products.value

  // Filter by category (client-side filtering)
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter((p) => {
      if (!p.categoryTitles || p.categoryTitles.length === 0) return false

      return p.categoryTitles.some((cat) =>
        cat.toLowerCase().includes(selectedCategory.value.toLowerCase())
      )
    })
  }

  // Filter by search (client-side filtering)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter((p) => {
      const nameFa = (p.nameFa || '').toLowerCase()
      const nameEn = (p.nameEn || '').toLowerCase()
      const brandTitle = (p.brandTitle || '').toLowerCase()
      const description = (p.description || '').toLowerCase()

      return (
        nameFa.includes(query) ||
        nameEn.includes(query) ||
        brandTitle.includes(query) ||
        description.includes(query)
      )
    })
  }

  return filtered
})

// Initial load
onMounted(() => {
  fetchProducts()
})
</script>
