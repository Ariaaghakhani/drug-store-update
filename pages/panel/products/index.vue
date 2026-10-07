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
        :products="products"
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

<script setup>
import ProductMetrics from '@/components/panel/products/ProductMetrics.vue'
import ProductsFilters from '@/components/panel/products/ProductsFilters.vue'
import ProductsTable from '@/components/panel/products/ProductsTable.vue'
import DeleteConfirmDialog from '@/components/panel/DeleteConfirmDialog.vue'

definePageMeta({ layout: 'panel' })
useHead({ title: 'مدیریت محصولات | پنل مدیریت' })

const app = useNuxtApp()
const toast = useToast()
const rolesStore = useRolesStore()
const { getUserRole } = useUserPanelTabs()

const myPerms = computed(() => {
  const role = rolesStore.roles.find((r) => r.id === getUserRole())
  return role?.permissions.products
})
const canCreate = computed(() => myPerms.value?.create ?? false)
const canUpdate = computed(() => myPerms.value?.update ?? false)
const canDelete = computed(() => myPerms.value?.delete ?? false)

const isNearExpiry = (expiryDate) => {
  if (!expiryDate) return false
  const diff = new Date(expiryDate).getTime() - Date.now()
  return diff > 0 && diff <= 90 * 24 * 60 * 60 * 1000
}

const mapGoodsToProduct = (g) => ({
  id: g.id,
  nameFa: g.nameFa,
  nameEn: g.nameEn,
  brandTitle: g.brandTitle,
  category: g.categoryTitles?.length ? Array.from(g.categoryTitles).join('، ') : null,
  price: Number(g.price) || 0,
  inStock: null,
  isPrescriptionRequired: g.isPrescriptionRequired,
  discountPercent: g.discountPercent ? Number(g.discountPercent) : undefined,
  expiryDate: g.expiryDate,
})

const products = ref([])
const totalCount = ref(0)
const pending = ref(false)
const categoryItems = ref([{ label: 'همه دسته‌ها', value: 'all' }])

const searchQuery = ref('')
const categoryFilter = ref('all')
const currentPage = ref(1)
const pageSize = 10
const showDeleteModal = ref(false)
const productToDelete = ref(null)

const loadCategories = async () => {
  try {
    const response = await app.$api.catalog.listCategories({ params: { scope: 'PRODUCT' } })
    const categories = response.data.data ?? []
    categoryItems.value = [
      { label: 'همه دسته‌ها', value: 'all' },
      ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
    ]
  } catch {
    categoryItems.value = [{ label: 'همه دسته‌ها', value: 'all' }]
  }
}

const fetchProducts = async () => {
  pending.value = true
  try {
    const body = {
      page: currentPage.value,
      size: pageSize,
    }
    if (searchQuery.value.trim()) body.nameFa = searchQuery.value.trim()
    if (categoryFilter.value !== 'all') body.categoryIds = [Number(categoryFilter.value)]

    const response = await app.$api.goods.filterGoods({ data: body })
    const page = response.data.data
    products.value = (page?.content ?? []).map(mapGoodsToProduct)
    totalCount.value = page?.totalElements ?? 0
  } catch {
    products.value = []
    totalCount.value = 0
    toast.add({ title: 'خطا در دریافت فهرست محصولات', color: 'error' })
  } finally {
    pending.value = false
  }
}

const metrics = computed(() => [
  {
    label: 'کل محصولات',
    value: totalCount.value,
    icon: 'i-heroicons-cube',
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    iconClass: 'text-gray-500 dark:text-gray-400',
  },
  {
    label: 'نسخه‌دار',
    value: products.value.filter((p) => p.isPrescriptionRequired).length,
    icon: 'i-heroicons-document-text',
    bgClass: 'bg-orange-50 dark:bg-orange-900/20',
    iconClass: 'text-orange-500 dark:text-orange-400',
  },
  {
    label: 'نزدیک به انقضا',
    value: products.value.filter((p) => isNearExpiry(p.expiryDate)).length,
    icon: 'i-heroicons-clock',
    bgClass: 'bg-amber-50 dark:bg-amber-900/20',
    iconClass: 'text-amber-500 dark:text-amber-400',
  },
  {
    label: 'دارای تخفیف',
    value: products.value.filter((p) => p.discountPercent).length,
    icon: 'i-heroicons-tag',
    bgClass: 'bg-rose-50 dark:bg-rose-900/20',
    iconClass: 'text-rose-500 dark:text-rose-400',
  },
])

watch([searchQuery, categoryFilter], () => {
  currentPage.value = 1
  fetchProducts()
})

watch(currentPage, fetchProducts)

onMounted(() => {
  loadCategories()
  fetchProducts()
})

const onEdit = (product) => {
  navigateTo(`/panel/products/${product.id}`)
}

const onDelete = (product) => {
  productToDelete.value = product
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!productToDelete.value) return
  try {
    await app.$api.goods.deleteGoods({ data: { id: productToDelete.value.id } })
    toast.add({ title: 'محصول حذف شد', color: 'success' })
    await fetchProducts()
  } catch {
    toast.add({ title: 'خطا در حذف محصول', color: 'error' })
  } finally {
    showDeleteModal.value = false
    productToDelete.value = null
  }
}
</script>
