<template>
  <UContainer>
    <div class="py-12 space-y-8">
      <div>
        <h1 class="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4">
          وبلاگ <span class="text-brand-500">سلامتی</span>
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">مقاله‌ها و راهنمایی‌های داروخانه برای سلامت شما</p>
      </div>

      <form class="flex flex-col md:flex-row gap-4" @submit.prevent="submitSearch">
        <UInput
          v-model="searchInput"
          placeholder="جستجو در مقاله‌ها..."
          size="xl"
          icon="i-heroicons-magnifying-glass"
          class="flex-1"
        />
        <USelect
          :model-value="state.sort"
          :items="SORT_ITEMS"
          size="xl"
          class="w-full md:w-48"
          :disabled="Boolean(state.q)"
          @update:model-value="(value) => go({ sort: value, page: 1 })"
        />
        <UButton type="submit" size="xl" color="primary" icon="i-heroicons-magnifying-glass">جستجو</UButton>
      </form>

      <!-- Category + tag chips -->
      <div v-if="categories.length || tags.length" class="flex flex-wrap gap-2">
        <UButton
          v-for="category in categories"
          :key="`c${category.id}`"
          size="sm"
          :color="state.categoryId === category.id ? 'primary' : 'neutral'"
          :variant="state.categoryId === category.id ? 'solid' : 'outline'"
          @click="go({ categoryId: state.categoryId === category.id ? null : category.id, page: 1 })"
        >
          {{ category.name }}
        </UButton>
        <UButton
          v-for="tag in tags"
          :key="`t${tag.id}`"
          size="sm"
          icon="i-heroicons-hashtag"
          :color="state.tagId === tag.id ? 'primary' : 'neutral'"
          :variant="state.tagId === tag.id ? 'soft' : 'ghost'"
          @click="go({ tagId: state.tagId === tag.id ? null : tag.id, page: 1 })"
        >
          {{ tag.name }}
        </UButton>
      </div>

      <div v-if="failed" class="text-center py-20">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">دریافت مقاله‌ها ناموفق بود</h3>
        <UButton class="mt-4" color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="refresh()">
          تلاش دوباره
        </UButton>
      </div>

      <div v-else class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <UCard v-for="i in PAGE_SIZE" :key="i" :ui="{ body: 'p-0' }">
              <USkeleton class="aspect-video w-full rounded-none" />
              <div class="p-4 space-y-3">
                <USkeleton class="h-5 w-3/4" />
                <USkeleton class="h-4 w-full" />
                <USkeleton class="h-4 w-1/2" />
              </div>
            </UCard>
          </div>

          <div v-else-if="posts.length === 0" key="empty" class="text-center py-20">
            <UIcon name="i-heroicons-newspaper" class="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">مقاله‌ای پیدا نشد</h3>
            <p class="text-gray-600 dark:text-gray-400">عبارت یا فیلتر دیگری را امتحان کنید</p>
            <UButton
              v-if="hasFilters"
              class="mt-6"
              color="neutral"
              variant="soft"
              @click="go({ q: '', categoryId: null, tagId: null, page: 1 })"
            >
              پاک کردن جستجو و فیلترها
            </UButton>
          </div>

          <div
            v-else
            key="grid"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity"
            :class="refreshing ? 'opacity-50' : ''"
          >
            <NuxtLink v-for="post in posts" :key="post.id" :to="`/blog/${post.slug}`" class="group block">
              <UCard :ui="{ body: 'p-0' }" class="h-full overflow-hidden">
                <div class="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  <img
                    v-if="post.coverImageUrl"
                    :src="post.coverImageUrl"
                    :alt="post.title"
                    loading="lazy"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <UIcon v-else name="i-heroicons-newspaper" class="w-12 h-12 text-gray-300 dark:text-gray-600" />
                </div>
                <div class="p-4 space-y-2">
                  <UBadge v-if="post.categoryName" color="neutral" variant="soft" size="sm">{{ post.categoryName }}</UBadge>
                  <h2 class="font-bold text-gray-900 dark:text-white line-clamp-2">{{ post.title }}</h2>
                  <p v-if="post.excerpt" class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{{ post.excerpt }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    <span v-if="post.author">{{ post.author }} · </span>{{ formatDate(post.publishedAt) }}
                  </p>
                </div>
              </UCard>
            </NuxtLink>
          </div>
        </Transition>
      </div>

      <div v-if="!loading && !failed && totalPages > 1" class="flex justify-center pt-4">
        <UPagination
          :page="state.page"
          :total="totalElements"
          :items-per-page="PAGE_SIZE"
          @update:page="(value) => go({ page: value })"
        />
      </div>
    </div>
  </UContainer>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const PAGE_SIZE = 9
const SORT_ITEMS = [
  { label: 'جدیدترین', value: 'LATEST' },
  { label: 'محبوب‌ترین', value: 'POPULAR' },
]

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()

// The URL is the source of truth: ?q=&categoryId=&tagId=&sort=&page=
const state = computed(() => ({
  q: String(route.query.q ?? '').trim(),
  sort: route.query.sort === 'POPULAR' ? 'POPULAR' : 'LATEST',
  page: Math.max(1, parseInt(route.query.page, 10) || 1),
  categoryId: Number(route.query.categoryId) > 0 ? Number(route.query.categoryId) : null,
  tagId: Number(route.query.tagId) > 0 ? Number(route.query.tagId) : null,
}))
const hasFilters = computed(() => Boolean(state.value.q || state.value.categoryId || state.value.tagId))

const go = (patch) => {
  const next = { ...state.value, ...patch }
  const query = {}
  if (next.q) query.q = next.q
  if (next.sort !== 'LATEST') query.sort = next.sort
  if (next.page > 1) query.page = String(next.page)
  if (next.categoryId) query.categoryId = String(next.categoryId)
  if (next.tagId) query.tagId = String(next.tagId)
  router.push({ path: '/blog', query })
  if (import.meta.client && Object.keys(patch).length === 1 && 'page' in patch) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const searchInput = ref(state.value.q)
watch(
  () => state.value.q,
  (value) => {
    searchInput.value = value
  }
)
const submitSearch = () => go({ q: searchInput.value.trim(), page: 1 })

const params = computed(() => {
  const { q, sort, page, categoryId, tagId } = state.value
  return {
    q: q || undefined,
    sort,
    categoryId: categoryId ?? undefined,
    tagId: tagId ?? undefined,
    page: page - 1, // BACK pages are 0-based
    size: PAGE_SIZE,
  }
})

const { data: result, status, error, refresh } = useAsyncData(
  'blog-posts',
  async () => (await $api.blog.listPosts({ params: params.value })).data.data,
  { server: false, watch: [params] }
)

const fetching = computed(() => status.value === 'idle' || status.value === 'pending')
// skeletons only for the first load; a re-search keeps the previous cards on screen (dimmed)
const loading = computed(() => fetching.value && !result.value)
const refreshing = computed(() => fetching.value && Boolean(result.value))
const failed = computed(() => Boolean(error.value) && !fetching.value)
const posts = computed(() => result.value?.content ?? [])
const totalElements = computed(() => result.value?.totalElements ?? 0)
const totalPages = computed(() => result.value?.totalPages ?? 0)

// chips are optional: a failure just hides them
const { data: categories } = useAsyncData(
  'blog-categories',
  async () => {
    try {
      return (await $api.blog.listCategories()).data.data ?? []
    } catch {
      return []
    }
  },
  { server: false, default: () => [] }
)
const { data: tags } = useAsyncData(
  'blog-tags',
  async () => {
    try {
      return (await $api.blog.listTags()).data.data ?? []
    } catch {
      return []
    }
  },
  { server: false, default: () => [] }
)

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('fa-IR') : '')

useHead({ title: 'وبلاگ سلامتی | داروخانه آنلاین' })
</script>
