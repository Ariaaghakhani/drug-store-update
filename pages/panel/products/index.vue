<template>
  <div class="space-y-5">
    <ProductMetrics :metrics="metrics" />

    <UCard :ui="{ body: 'p-0' }">
      <div class="flex items-center justify-between gap-4 flex-wrap px-6 py-4 border-b border-gray-100 dark:border-gray-800">
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
          @click="navigateTo('/panel/products/new')"
        >
          افزودن محصول
        </UButton>
      </div>

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

    <DeleteConfirmDialog
      v-model:open="showDeleteModal"
      title="حذف محصول"
      message="آیا از حذف این محصول مطمئن هستید؟ این عملیات قابل بازگشت نیست."
      :item-name="productToDelete?.nameFa"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Product } from '@/types/panel-products'
import ProductMetrics from '@/components/panel/products/ProductMetrics.vue'
import ProductsFilters from '@/components/panel/products/ProductsFilters.vue'
import ProductsTable from '@/components/panel/products/ProductsTable.vue'
import DeleteConfirmDialog from '@/components/panel/DeleteConfirmDialog.vue'

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

const productsStore = useProductsStore()
const allProducts = computed<Product[]>(() => productsStore.products)
const categoryItems = productsStore.categoryItems

const searchQuery = ref('')
const categoryFilter = ref('all')
const currentPage = ref(1)
const pageSize = 10
const pending = ref(false)
const showDeleteModal = ref(false)
const productToDelete = ref<Product | null>(null)

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

const onEdit = (product: Product) => {
  navigateTo(`/panel/products/${product.id}`)
}

const onDelete = (product: Product) => {
  productToDelete.value = product
  showDeleteModal.value = true
}

const confirmDelete = () => {
  if (productToDelete.value) productsStore.removeProduct(productToDelete.value.id)
  showDeleteModal.value = false
  productToDelete.value = null
}
</script>