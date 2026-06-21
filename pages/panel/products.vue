<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-100 dark:bg-brand-900/20 flex-shrink-0">
          <UIcon name="i-heroicons-cube" class="w-5 h-5 text-brand-500 dark:text-brand-400" />
        </div>
        <div>
          <h1 class="text-lg font-black text-gray-900 dark:text-white">
            مدیریت <span class="text-brand-500">محصولات</span>
          </h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {{ totalCount.toLocaleString('fa-IR') }} محصول در پایگاه داده
          </p>
        </div>
      </div>
      <UButton
        v-if="canCreate"
        color="primary"
        icon="i-heroicons-plus"
        size="lg"
        @click="showAddModal = true"
      >
        افزودن محصول
      </UButton>
    </div>

    <ProductMetrics :metrics="metrics" />

    <UCard :ui="{ body: 'p-0' }">
      <ProductsFilters
        v-model:search-query="searchQuery"
        v-model:category-filter="categoryFilter"
        :category-items="categoryItems"
      />
      <ProductsTable
        :products="paginatedProducts"
        :pending="pending"
        :page-size="pageSize"
        :can-update="canUpdate"
        :can-delete="canDelete"
        @edit="onEdit"
        @delete="onDelete"
      />
    </UCard>

    <div v-if="totalCount > pageSize" class="flex justify-center">
      <UPagination v-model:page="currentPage" :total="totalCount" :items-per-page="pageSize" />
    </div>

    <AddProductModal
      v-model:open="showAddModal"
      :category-items="categoryItems"
      @create="onCreateProduct"
    />
  </div>
</template>

<script setup lang="ts">
import type { Product } from '@/types/panel-products'
import ProductMetrics from '@/components/panel/products/ProductMetrics.vue'
import ProductsFilters from '@/components/panel/products/ProductsFilters.vue'
import ProductsTable from '@/components/panel/products/ProductsTable.vue'
import AddProductModal from '@/components/panel/products/AddProductModal.vue'

definePageMeta({ layout: 'panel' })
useHead({ title: 'مدیریت محصولات | پنل مدیریت' })

const rolesStore = useRolesStore()
const { getUserRole } = useUserPanelTabs()

const myPerms = computed(() => {
  const role = rolesStore.roles.find((r) => r.id === getUserRole())
  return role?.permissions.products
})
const canCreate = computed(() => myPerms.value?.create ?? false)
const canUpdate = computed(() => myPerms.value?.update ?? false)
const canDelete = computed(() => myPerms.value?.delete ?? false)

const isNearExpiry = (expiryDate?: string): boolean => {
  if (!expiryDate) return false
  const diff = new Date(expiryDate).getTime() - Date.now()
  return diff > 0 && diff <= 90 * 24 * 60 * 60 * 1000
}

const allProducts = ref<Product[]>([
  { id: 1, nameFa: 'آموکسی‌سیلین ۵۰۰ میلی‌گرم', nameEn: 'Amoxicillin 500mg', brandTitle: 'ایران داروک', category: 'آنتی‌بیوتیک', price: 185000, inStock: true, isPrescriptionRequired: true },
  { id: 2, nameFa: 'ویتامین D3 هزار IU', nameEn: 'Vitamin D3 1000 IU', brandTitle: 'زاگرس فارمد', category: 'ویتامین و مکمل', price: 125000, inStock: true, isPrescriptionRequired: false },
  { id: 3, nameFa: 'قرص بروفن ۴۰۰ میلی‌گرم', nameEn: 'Ibuprofen 400mg', brandTitle: 'داروپخش', category: 'مسکن و ضد درد', price: 48000, inStock: false, isPrescriptionRequired: false },
  { id: 4, nameFa: 'متفورمین ۵۰۰ میلی‌گرم', nameEn: 'Metformin 500mg', brandTitle: 'امین', category: 'دیابت', price: 67000, inStock: true, isPrescriptionRequired: true, expiryDate: '2024-09-01' },
  { id: 5, nameFa: 'لوراتادین ۱۰ میلی‌گرم', nameEn: 'Loratadine 10mg', brandTitle: 'البرز دارو', category: 'تنفسی', price: 38000, inStock: true, isPrescriptionRequired: false },
  { id: 6, nameFa: 'امگا ۳ ۱۰۰۰ میلی‌گرم', nameEn: 'Omega-3 1000mg', brandTitle: 'رازی', category: 'ویتامین و مکمل', price: 210000, inStock: false, isPrescriptionRequired: false },
  { id: 7, nameFa: 'آتورواستاتین ۲۰ میلی‌گرم', nameEn: 'Atorvastatin 20mg', brandTitle: 'پارس دارو', category: 'قلب و عروق', price: 95000, inStock: true, isPrescriptionRequired: true, expiryDate: '2024-08-15' },
  { id: 8, nameFa: 'ویتامین C ۵۰۰ میلی‌گرم', nameEn: 'Vitamin C 500mg', brandTitle: 'داملران', category: 'ویتامین و مکمل', price: 56000, inStock: true, isPrescriptionRequired: false, discountPercent: 10 },
])

const categoryItems = [
  { label: 'همه دسته‌ها', value: 'all' },
  { label: 'مسکن و ضد درد', value: 'مسکن و ضد درد' },
  { label: 'ویتامین و مکمل', value: 'ویتامین و مکمل' },
  { label: 'آنتی‌بیوتیک', value: 'آنتی‌بیوتیک' },
  { label: 'قلب و عروق', value: 'قلب و عروق' },
  { label: 'دیابت', value: 'دیابت' },
  { label: 'تنفسی', value: 'تنفسی' },
]

const searchQuery = ref('')
const categoryFilter = ref('all')
const currentPage = ref(1)
const pageSize = 6
const pending = ref(false)
const showAddModal = ref(false)

const metrics = computed(() => [
  {
    label: 'کل محصولات',
    value: allProducts.value.length,
    icon: 'i-heroicons-cube',
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    iconClass: 'text-gray-500 dark:text-gray-400',
  },
  {
    label: 'ناموجود',
    value: allProducts.value.filter((p) => !p.inStock).length,
    icon: 'i-heroicons-x-circle',
    bgClass: 'bg-rose-50 dark:bg-rose-900/20',
    iconClass: 'text-rose-500 dark:text-rose-400',
  },
  {
    label: 'نسخه‌دار',
    value: allProducts.value.filter((p) => p.isPrescriptionRequired).length,
    icon: 'i-heroicons-document-text',
    bgClass: 'bg-orange-50 dark:bg-orange-900/20',
    iconClass: 'text-orange-500 dark:text-orange-400',
  },
  {
    label: 'نزدیک به انقضا',
    value: allProducts.value.filter((p) => isNearExpiry(p.expiryDate)).length,
    icon: 'i-heroicons-clock',
    bgClass: 'bg-amber-50 dark:bg-amber-900/20',
    iconClass: 'text-amber-500 dark:text-amber-400',
  },
])

const filteredProducts = computed(() => {
  let result = allProducts.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim()
    result = result.filter((p) => p.nameFa.includes(q) || (p.brandTitle ?? '').includes(q))
  }
  if (categoryFilter.value !== 'all') {
    result = result.filter((p) => p.category === categoryFilter.value)
  }
  return result
})

const totalCount = computed(() => filteredProducts.value.length)

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredProducts.value.slice(start, start + pageSize)
})

watch([searchQuery, categoryFilter], () => {
  currentPage.value = 1
})

const onEdit = (_product: Product) => {}

const onDelete = (product: Product) => {
  allProducts.value = allProducts.value.filter((p) => p.id !== product.id)
}

const onCreateProduct = (data: Omit<Product, 'id'>) => {
  allProducts.value.unshift({ id: Date.now(), ...data })
  showAddModal.value = false
}
</script>