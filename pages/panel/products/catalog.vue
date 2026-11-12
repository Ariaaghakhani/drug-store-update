<template>
  <div class="space-y-5">
    <UCard :ui="{ body: 'p-0' }">
      <div class="flex items-center justify-between gap-4 flex-wrap px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div class="flex items-center gap-3">
          <UButton
            to="/panel/products"
            color="neutral"
            variant="ghost"
            square
            icon="i-heroicons-arrow-right"
            aria-label="بازگشت به محصولات"
          />
          <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-100 dark:bg-brand-900/20 flex-shrink-0">
            <UIcon name="i-heroicons-tag" class="w-5 h-5 text-brand-500 dark:text-brand-400" />
          </div>
          <div>
            <h1 class="text-lg font-black text-gray-900 dark:text-white">
              دسته‌بندی، برند و <span class="text-brand-500">تگ</span>
            </h1>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {{ items.length.toLocaleString('fa-IR') }} {{ meta.label }}
            </p>
          </div>
        </div>
        <UButton v-if="can.CREATE" color="primary" icon="i-heroicons-plus" size="lg" @click="openCreate">
          افزودن {{ meta.label }}
        </UButton>
      </div>

      <div class="px-6 pt-3 border-b border-gray-100 dark:border-gray-800">
        <UTabs v-model="tab" :items="TAB_ITEMS" :content="false" variant="link" color="primary" />
      </div>

      <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          :placeholder="`جستجوی ${meta.label}...`"
          class="w-full sm:max-w-xs"
        />
      </div>

      <div class="relative">
        <Transition name="sk">
          <div v-if="pending" key="sk">
            <div
              v-for="i in 6"
              :key="i"
              class="flex items-center gap-5 px-6 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              <USkeleton class="h-4 w-36 rounded" />
              <USkeleton class="h-4 w-48 rounded" />
              <USkeleton class="h-8 w-16 rounded-lg ms-auto" />
            </div>
          </div>

          <div v-else key="data">
            <div v-if="pagedItems.length > 0" class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">نام</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">{{ meta.detailLabel }}</th>
                    <th class="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in pagedItems"
                    :key="item.id"
                    class="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{{ item.label }}</td>
                    <td class="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">{{ item.detail || '—' }}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-end gap-1">
                        <UButton
                          v-if="can.UPDATE"
                          variant="ghost"
                          color="neutral"
                          square
                          size="xs"
                          icon="i-heroicons-pencil-square"
                          :aria-label="`ویرایش ${meta.label}`"
                          @click="openEdit(item.raw)"
                        />
                        <UButton
                          v-if="can.DELETE"
                          variant="ghost"
                          color="error"
                          square
                          size="xs"
                          icon="i-heroicons-trash"
                          :aria-label="`حذف ${meta.label}`"
                          @click="askDelete(item)"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="flex flex-col items-center justify-center py-16 gap-3">
              <UIcon :name="emptyState.icon" class="w-16 h-16 text-gray-300 dark:text-gray-700" />
              <p class="text-base font-bold text-gray-900 dark:text-white">{{ emptyState.title }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ emptyState.text }}</p>
              <UButton v-if="loadError" color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
                تلاش دوباره
              </UButton>
              <UButton v-else-if="!forbidden && !searchQuery && can.CREATE" color="primary" icon="i-heroicons-plus" @click="openCreate">
                افزودن {{ meta.label }}
              </UButton>
            </div>
          </div>
        </Transition>
      </div>
    </UCard>

    <div v-if="filteredItems.length > PAGE_SIZE" class="flex justify-center">
      <UPagination v-model:page="currentPage" :total="filteredItems.length" :items-per-page="PAGE_SIZE" />
    </div>

    <CatalogItemModal
      v-model:open="showModal"
      :kind="tab"
      :item="editingItem"
      :categories="categories"
      :product-scope-id="productScopeId"
      @saved="load"
    />

    <DeleteConfirmDialog
      v-model:open="showDeleteDialog"
      :title="`حذف ${meta.label}`"
      :message="meta.deleteMessage"
      :item-name="deletingItem?.label"
      @confirm="onDelete"
    />
  </div>
</template>

<script setup>
import CatalogItemModal from '@/components/panel/products/CatalogItemModal.vue'
import DeleteConfirmDialog from '@/components/panel/DeleteConfirmDialog.vue'

definePageMeta({ layout: 'panel' })
useHead({ title: 'دسته‌بندی، برند و تگ | پنل مدیریت' })

const PAGE_SIZE = 20
const TAB_ITEMS = [
  { label: 'دسته‌بندی‌ها', value: 'category', icon: 'i-heroicons-squares-2x2' },
  { label: 'برندها', value: 'brand', icon: 'i-heroicons-building-storefront' },
  { label: 'تگ‌ها', value: 'tag', icon: 'i-heroicons-tag' },
]
const KIND_META = {
  category: {
    label: 'دسته‌بندی',
    module: 'CATEGORY',
    detailLabel: 'مسیر',
    deleteMessage: 'دسته‌ای که زیرشاخه دارد حذف نمی‌شود. کالاهای این دسته بدون آن می‌مانند.',
  },
  brand: {
    label: 'برند',
    module: 'CATALOG',
    detailLabel: 'توضیحات',
    deleteMessage: 'کالاهای این برند بدون برند می‌مانند. این عملیات قابل بازگشت نیست.',
  },
  tag: {
    label: 'تگ',
    module: 'TAG',
    detailLabel: 'توضیحات',
    deleteMessage: 'تگ از همه‌ی کالاهایش برداشته می‌شود. این عملیات قابل بازگشت نیست.',
  },
}

const app = useNuxtApp()
const route = useRoute()
const router = useRouter()
const toast = useAppToast()

// ?tab= keeps the tab across reloads and lets other pages link straight to brands or tags
const tab = computed({
  get: () => (KIND_META[route.query.tab] ? route.query.tab : 'category'),
  set: (value) => router.replace({ query: { ...route.query, tab: value } }),
})
const meta = computed(() => KIND_META[tab.value])

const rows = ref([])
const categories = ref([])
const productScopeId = ref(null)
const pending = ref(true)
const loadError = ref(false)
const forbidden = ref(false)

const toRow = (raw) => {
  if (tab.value === 'category') return { id: raw.id, label: raw.name, detail: raw.fullPath, raw }
  if (tab.value === 'brand') return { id: raw.id, label: raw.title, detail: raw.description, raw }
  return { id: raw.id, label: raw.name, detail: raw.description, raw }
}
const items = computed(() => rows.value.map(toRow))

// shortcut: search and paging are client-side because BACK returns these lists unpaged; fine for a few thousand rows
const searchQuery = ref('')
const currentPage = ref(1)
const filteredItems = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return items.value
  return items.value.filter((item) => `${item.label} ${item.detail ?? ''}`.includes(query))
})
const pagedItems = computed(() =>
  filteredItems.value.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE)
)
watch(searchQuery, () => (currentPage.value = 1))

const emptyState = computed(() => {
  if (forbidden.value)
    return { icon: 'i-heroicons-lock-closed', title: `دسترسی به ${meta.value.label} ندارید`, text: 'از مدیر فروشگاه دسترسی بگیرید' }
  if (loadError.value)
    return { icon: 'i-heroicons-exclamation-triangle', title: 'دریافت فهرست ناموفق بود', text: 'اتصال را بررسی کنید و دوباره تلاش کنید' }
  if (searchQuery.value) return { icon: 'i-heroicons-magnifying-glass', title: 'موردی یافت نشد', text: 'عبارت دیگری را جستجو کنید' }
  return { icon: 'i-heroicons-tag', title: `هنوز ${meta.value.label} ثبت نشده`, text: `اولین ${meta.value.label} را اضافه کنید` }
})

async function fetchRows() {
  if (tab.value === 'category') {
    const response = await app.$api.catalog.listCategories({ params: { scope: 'PRODUCT' } })
    categories.value = (response.data.data ?? []).sort((a, b) => (a.fullPath ?? a.name).localeCompare(b.fullPath ?? b.name, 'fa'))
    return categories.value
  }
  if (tab.value === 'brand') {
    const response = await app.$api.catalog.getCatalogsByType({ data: { type: 'BRAND' } })
    return (response.data.data ?? []).sort((a, b) => a.title.localeCompare(b.title, 'fa'))
  }
  const response = await app.$api.goods.getTags()
  return (response.data.data ?? []).sort((a, b) => a.name.localeCompare(b.name, 'fa'))
}

async function load() {
  pending.value = true
  loadError.value = false
  forbidden.value = false
  try {
    rows.value = await fetchRows()
  } catch (error) {
    rows.value = []
    if (error?.response?.status === 403) forbidden.value = true
    else loadError.value = true
  } finally {
    pending.value = false
  }
}

// a root category needs the PRODUCT scope id (CategoryServiceImpl.resolveScope)
async function loadProductScope() {
  try {
    const response = await app.$api.catalog.listCategoryScopes()
    productScopeId.value = (response.data.data ?? []).find((scope) => scope.name === 'PRODUCT')?.id ?? null
  } catch {
    productScopeId.value = null
  }
}

// Write buttons follow the user's CREATE/UPDATE/DELETE grants on the tab's module, which the READ-only grants in
// userStore don't carry. If the check fails everything stays visible and BACK has the final word.
const grants = ref(null)
const can = computed(() => {
  const actions = { CREATE: true, UPDATE: true, DELETE: true }
  if (!grants.value) return actions
  for (const action of Object.keys(actions)) {
    actions[action] = grants.value.some((grant) => grant.module === meta.value.module && grant.action === action)
  }
  return actions
})

async function fetchGrants() {
  try {
    const response = await app.$api.auth.getMyPermissions({
      data: { allowed: true, modules: ['CATEGORY', 'CATALOG', 'TAG'], actions: ['CREATE', 'UPDATE', 'DELETE'] },
    })
    grants.value = (response.data.data ?? []).filter((grant) => grant.allowed !== false)
  } catch {
    grants.value = null
  }
}

watch(tab, () => {
  searchQuery.value = ''
  currentPage.value = 1
  load()
})

onMounted(() => {
  fetchGrants()
  loadProductScope()
  load()
})

// ---------- create / edit ----------
const showModal = ref(false)
const editingItem = ref(null)

const openCreate = () => {
  editingItem.value = null
  showModal.value = true
}

const openEdit = (raw) => {
  editingItem.value = raw
  showModal.value = true
}

// ---------- delete ----------
const showDeleteDialog = ref(false)
const deletingItem = ref(null)

const askDelete = (item) => {
  deletingItem.value = item
  showDeleteDialog.value = true
}

const DELETE_CALLS = {
  category: (id) => app.$api.catalog.deleteCategory({ data: { id } }),
  brand: (id) => app.$api.catalog.deleteCatalog({ data: { id } }),
  tag: (id) => app.$api.goods.deleteTag({ data: { id } }),
}

async function onDelete() {
  try {
    await DELETE_CALLS[tab.value](deletingItem.value.id)
    toast.success(`${meta.value.label} حذف شد`)
    showDeleteDialog.value = false
    await load()
  } catch (error) {
    toast.error(`حذف ${meta.value.label} ناموفق بود`, error?.response?.data?.message)
  }
}
</script>

<style scoped>
.sk-enter-active,
.sk-leave-active {
  transition: opacity 0.2s ease;
}
.sk-enter-from,
.sk-leave-to {
  opacity: 0;
}
.sk-leave-active {
  position: absolute;
  inset: 0;
}
</style>
