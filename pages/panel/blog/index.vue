<!-- pages/panel/blog/index.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader icon="i-heroicons-newspaper" title="مدیریت" accent="وبلاگ" subtitle="پست‌ها، برچسب‌ها و نظرهای بلاگ">
      <template #actions>
        <UButton
          color="neutral"
          variant="soft"
          size="lg"
          icon="i-heroicons-arrow-path"
          :loading="reindexing"
          @click="reindex"
        >
          بازسازی جستجو
        </UButton>
        <UButton v-if="tab === 'posts'" color="primary" size="lg" icon="i-heroicons-plus" to="/panel/blog/new">
          پست جدید
        </UButton>
      </template>
    </PanelPageHeader>

    <UCard :ui="{ body: 'p-0' }">
      <div class="px-6 pt-3 border-b border-gray-100 dark:border-gray-800">
        <UTabs v-model="tab" :items="TAB_ITEMS" :content="false" variant="link" color="primary" />
      </div>

      <template v-if="tab === 'posts'">
        <div class="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <UInput
            v-model="searchText"
            :maxlength="100"
            icon="i-heroicons-magnifying-glass"
            placeholder="جستجو در عنوان و متن"
            class="w-64"
          />
          <USelect v-model="filters.status" :items="statusOptions" size="sm" class="w-44" />
          <USelect v-model="filters.categoryId" :items="categoryOptions" size="sm" class="w-44" />
          <USelect v-model="filters.sort" :items="sortOptions" size="sm" class="w-44" />
        </div>

        <div class="relative">
          <Transition name="sk">
            <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
                <USkeleton class="w-12 h-12 rounded-lg" />
                <div class="flex-1 space-y-2">
                  <USkeleton class="h-4 w-48" />
                  <USkeleton class="h-3 w-32" />
                </div>
                <USkeleton class="h-5 w-16 rounded-full" />
              </div>
            </div>

            <PanelEmptyState
              v-else-if="forbidden"
              key="forbidden"
              variant="forbidden"
              title="دسترسی به پست‌های بلاگ ندارید"
            />

            <PanelEmptyState
              v-else-if="error"
              key="error"
              variant="error"
              title="دریافت پست‌ها ناموفق بود"
            >
              <template #action>
                <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="reload">
                  تلاش دوباره
                </UButton>
              </template>
            </PanelEmptyState>

            <div v-else-if="items.length" key="content">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                      <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">پست</th>
                      <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">وضعیت</th>
                      <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">دسته</th>
                      <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">برچسب‌ها</th>
                      <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">بازدید</th>
                      <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">انتشار</th>
                      <th class="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="row in items"
                      :key="row.id"
                      class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <td class="px-6 py-3 align-top">
                        <div class="flex items-start gap-3">
                          <img
                            v-if="row.coverImageUrl"
                            :src="row.coverImageUrl"
                            alt=""
                            loading="lazy"
                            class="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          >
                          <div
                            v-else
                            class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0"
                          >
                            <UIcon name="i-heroicons-photo" class="w-5 h-5 text-gray-400 dark:text-gray-600" />
                          </div>
                          <div class="min-w-0">
                            <NuxtLink
                              :to="`/panel/blog/${row.id}`"
                              class="text-sm font-semibold text-gray-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400"
                            >
                              {{ row.title }}
                            </NuxtLink>
                            <p dir="ltr" class="text-xs font-mono text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {{ row.slug }}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-3 align-top">
                        <StatusBadge :meta="postStateMeta(row)" />
                      </td>
                      <td class="px-6 py-3 align-top text-sm text-gray-700 dark:text-gray-300">
                        {{ row.categoryName || '—' }}
                      </td>
                      <td class="px-6 py-3 align-top">
                        <div class="flex flex-wrap gap-1 max-w-xs">
                          <UBadge
                            v-for="tag in row.tags ?? []"
                            :key="tag.id"
                            color="neutral"
                            variant="soft"
                            size="xs"
                          >
                            {{ tag.name }}
                          </UBadge>
                          <span v-if="!row.tags?.length" class="text-sm text-gray-500 dark:text-gray-400">—</span>
                        </div>
                      </td>
                      <td class="px-6 py-3 align-top text-sm text-gray-700 dark:text-gray-300">
                        {{ viewText(row.viewCount) }}
                      </td>
                      <td class="px-6 py-3 align-top text-xs text-gray-600 dark:text-gray-400">
                        {{ publishedText(row) }}
                      </td>
                      <td class="px-6 py-3 align-top text-end">
                        <UDropdownMenu :items="[rowActions(row)]" :ui="{ content: 'font-dana w-44' }">
                          <UButton
                            variant="ghost"
                            icon="i-heroicons-ellipsis-vertical"
                            size="xs"
                            color="neutral"
                            square
                            aria-label="عملیات پست"
                          />
                        </UDropdownMenu>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="totalPages > 1" class="flex justify-center py-4">
                <UPagination v-model:page="page" :total="total" :items-per-page="PAGE_SIZE" />
              </div>
            </div>

            <PanelEmptyState
              v-else
              key="empty"
              icon="i-heroicons-newspaper"
              title="هنوز پستی ندارید"
              text="با این فیلترها پستی پیدا نشد"
            />
          </Transition>
        </div>
      </template>

      <BlogTagsTab v-else-if="tab === 'tags'" />
      <BlogCommentsTab v-else-if="tab === 'comments'" />
    </UCard>

    <PanelConfirmDialog
      :open="deleteTarget !== null"
      title="حذف پست"
      :message="deleteTarget ? `پست «${deleteTarget.title}» و عکس‌هایش برای همیشه حذف شود؟` : ''"
      confirm-label="حذف"
      confirm-color="error"
      :loading="deleting"
      @update:open="(value) => { if (!value) deleteTarget = null }"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import BlogTagsTab from '@/components/panel/blog/BlogTagsTab.vue'
import BlogCommentsTab from '@/components/panel/blog/BlogCommentsTab.vue'
import { apiErrorMessage } from '~/utils/apiError.js'
import { BLOG_POST_STATUS_META, postStateMeta } from '~/utils/blogMeta.js'
import { selectItems } from '~/utils/enumMeta.js'
import { formatJalali } from '~/utils/jalali.js'

const app = useNuxtApp()
const toast = useAppToast()
const route = useRoute()
const router = useRouter()

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

const TAB_ITEMS = [
  { label: 'پست‌ها', value: 'posts', icon: 'i-heroicons-document-text' },
  { label: 'برچسب‌ها', value: 'tags', icon: 'i-heroicons-tag' },
  { label: 'نظرها', value: 'comments', icon: 'i-heroicons-chat-bubble-left-right' },
]
const TAB_VALUES = TAB_ITEMS.map((item) => item.value)

// The section lives in the query string (?tab=…), so a reload or a shared link keeps it
const tab = computed({
  get: () => (TAB_VALUES.includes(route.query.tab) ? route.query.tab : 'posts'),
  set: (value) => router.replace({ query: { ...route.query, tab: value } }),
})

// 'all' means no filter. The search box is debounced into `filters.q`, so typing does not fire a request per keystroke
const filters = reactive({ status: 'all', categoryId: 'all', sort: 'LATEST', q: '' })
const searchText = ref('')
let searchTimer = null
watch(searchText, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    filters.q = value.trim()
  }, SEARCH_DEBOUNCE_MS)
})
onBeforeUnmount(() => clearTimeout(searchTimer))

const statusOptions = selectItems(BLOG_POST_STATUS_META, 'همه وضعیت‌ها')
const sortOptions = [
  { value: 'LATEST', label: 'جدیدترین' },
  { value: 'POPULAR', label: 'پربازدیدترین' },
]

// Categories are the store's BLOG-scope list (public read). A failed call leaves only «همه دسته‌ها»
const categories = ref([])
const categoryOptions = computed(() => [
  { value: 'all', label: 'همه دسته‌ها' },
  ...categories.value.map((category) => ({ value: String(category.id), label: category.fullPath || category.name })),
])

const loadCategories = async () => {
  try {
    const res = await app.$api.blog.listCategories()
    categories.value = res.data.data ?? []
  } catch {
    categories.value = []
  }
}

// 0-based BACK paging behind the 1-based UPagination; a filter change jumps back to page 1
const { items, total, totalPages, page, loading, error, forbidden, reload } = usePagedList(
  ({ page: backendPage, size }) => {
    const params = { page: backendPage, size, sort: filters.sort }
    if (filters.status !== 'all') params.status = filters.status
    if (filters.categoryId !== 'all') params.categoryId = Number(filters.categoryId)
    if (filters.q) params.q = filters.q
    return app.$api.contentAdmin.listBlogPostsAdmin({ params })
  },
  { size: PAGE_SIZE, filters }
)

const viewText = (count) => (count ?? 0).toLocaleString('fa-IR')

const publishedText = (row) => (row.publishedAt ? formatJalali(row.publishedAt, { withTime: true }) : '—')

// Last row of a later page: step back, so the list is not left on an empty page
const afterRemoval = () => {
  if (items.value.length === 1 && page.value > 1) page.value -= 1
  else reload()
}

const rowActions = (row) => [
  ...(row.status === 'PUBLISHED'
    ? [
        {
          label: 'مشاهده در سایت',
          icon: 'i-heroicons-arrow-top-right-on-square',
          onSelect: () => window.open(`/blog/${row.slug}`, '_blank', 'noopener'),
        },
      ]
    : []),
  { label: 'ویرایش', icon: 'i-heroicons-pencil-square', onSelect: () => navigateTo(`/panel/blog/${row.id}`) },
  { label: 'حذف', icon: 'i-heroicons-trash', color: 'error', onSelect: () => (deleteTarget.value = row) },
]

const deleteTarget = ref(null)
const deleting = ref(false)

const confirmDelete = async () => {
  deleting.value = true
  try {
    await app.$api.contentAdmin.deleteBlogPost(deleteTarget.value.id)
    deleteTarget.value = null
    toast.success('پست حذف شد')
    afterRemoval()
  } catch (e) {
    toast.error(apiErrorMessage(e, 'حذف پست ناموفق بود'))
  } finally {
    deleting.value = false
  }
}

const reindexing = ref(false)

const reindex = async () => {
  reindexing.value = true
  try {
    const res = await app.$api.contentAdmin.reindexBlog()
    toast.success(res.data.data || 'جستجوی بلاگ بازسازی شد')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'بازسازی جستجو ناموفق بود'))
  } finally {
    reindexing.value = false
  }
}

onMounted(loadCategories)

useHead({ title: 'وبلاگ | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
