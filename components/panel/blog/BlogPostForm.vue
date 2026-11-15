<!-- components/panel/blog/BlogPostForm.vue -->
<template>
  <form id="blog-post-form" class="space-y-6" novalidate @submit.prevent="submit">
    <section class="space-y-4">
      <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">اطلاعات اصلی</h4>

      <UFormField label="عنوان" required :error="errors.title">
        <UInput v-model="form.title" :maxlength="200" class="w-full" />
      </UFormField>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="نشانی (slug)" :error="errors.slug" help="خالی = از عنوان ساخته می‌شود">
          <UInput v-model="form.slug" dir="ltr" :maxlength="200" class="w-full font-mono" />
        </UFormField>

        <UFormField label="نویسنده" :error="errors.author">
          <UInput v-model="form.author" :maxlength="100" class="w-full" />
        </UFormField>
      </div>

      <UFormField label="خلاصه" :error="errors.excerpt" help="خالی = از ابتدای متن ساخته می‌شود">
        <UTextarea v-model="form.excerpt" :rows="2" :maxlength="500" class="w-full" />
      </UFormField>
    </section>

    <section class="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
      <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">متن</h4>

      <UFormField label="متن پست (HTML)" required :error="errors.content">
        <UTextarea v-model="form.content" :rows="14" dir="ltr" class="w-full font-mono" />
      </UFormField>

      <details class="rounded-xl border border-gray-100 dark:border-gray-800 p-3">
        <summary class="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">پیش‌نمایش متن</summary>
        <p class="mt-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{{ previewText }}</p>
      </details>
    </section>

    <section class="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
      <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">دسته و برچسب‌ها</h4>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="دسته‌بندی">
          <USelect v-model="form.categoryId" :items="categoryItems" class="w-full" />
        </UFormField>

        <UFormField label="برچسب‌ها">
          <USelectMenu
            v-model="form.tagIds"
            :items="tagItems"
            multiple
            value-key="value"
            placeholder="انتخاب برچسب"
            class="w-full"
          />
        </UFormField>
      </div>
    </section>

    <section class="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
      <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">موتور جستجو</h4>

      <UFormField label="عنوان صفحه" :error="errors.metaTitle" help="خالی = عنوان پست">
        <UInput v-model="form.metaTitle" :maxlength="100" class="w-full" />
      </UFormField>

      <UFormField label="توضیح صفحه" :error="errors.metaDescription" help="خالی = خلاصه پست">
        <UTextarea v-model="form.metaDescription" :rows="2" :maxlength="300" class="w-full" />
      </UFormField>

      <div class="flex items-center justify-between gap-4">
        <div class="min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white">پنهان از موتور جستجو</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">موتور جستجو این پست را ایندکس نمی‌کند</p>
        </div>
        <USwitch
          v-model="form.noIndex"
          size="lg"
          :ui="{
            base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
          }"
        />
      </div>
    </section>
  </form>
</template>

<script setup>
// Create/edit form for a blog post. The parent owns the request: this emits `submit` with the BlogPostRequestDTO body
// (the submit button lives outside the form and points at `#blog-post-form`). Lists for the pickers load on mount.
import { htmlToText } from '~/utils/storefrontGoods.js'

const props = defineProps({
  // BlogPostDetailDTO when editing; null for a new post
  post: { type: Object, default: null },
  busy: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])

const app = useNuxtApp()

const form = reactive({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  author: '',
  categoryId: 'none',
  tagIds: [],
  metaTitle: '',
  metaDescription: '',
  noIndex: false,
})

const errors = ref({})

const applyPost = (post) => {
  form.title = post?.title ?? ''
  form.slug = post?.slug ?? ''
  form.excerpt = post?.excerpt ?? ''
  form.content = post?.content ?? ''
  form.author = post?.author ?? ''
  form.categoryId = post?.categoryId ? String(post.categoryId) : 'none'
  form.tagIds = (post?.tags ?? []).map((tag) => tag.id)
  form.metaTitle = post?.metaTitle ?? ''
  form.metaDescription = post?.metaDescription ?? ''
  form.noIndex = Boolean(post?.noIndex)
  errors.value = {}
}

// Every new post value (after a save or a reload) puts the form back in step with the server copy
watch(() => props.post, applyPost, { immediate: true })

const categories = ref([])
const tags = ref([])

// Pickers fall back to empty lists on failure, so a failed lookup never blocks the form
onMounted(async () => {
  const [categoryRes, tagRes] = await Promise.allSettled([
    app.$api.blog.listCategories(),
    app.$api.contentAdmin.listBlogTags(),
  ])
  if (categoryRes.status === 'fulfilled') categories.value = categoryRes.value.data.data ?? []
  if (tagRes.status === 'fulfilled') tags.value = tagRes.value.data.data ?? []
})

const categoryItems = computed(() => [
  { value: 'none', label: 'بدون دسته‌بندی' },
  ...categories.value.map((category) => ({ value: String(category.id), label: category.fullPath || category.name })),
])

const tagItems = computed(() => tags.value.map((tag) => ({ value: tag.id, label: tag.name })))

const previewText = computed(() => htmlToText(form.content))

const validate = () => {
  const next = {}
  if (!form.title.trim()) next.title = 'عنوان را وارد کنید'
  if (!form.content.trim()) next.content = 'متن پست را وارد کنید'
  errors.value = next
  return Object.keys(next).length === 0
}

const submit = () => {
  if (props.busy || !validate()) return
  emit('submit', {
    title: form.title.trim(),
    slug: form.slug.trim(),
    excerpt: form.excerpt.trim(),
    content: form.content.trim(),
    author: form.author.trim(),
    metaTitle: form.metaTitle.trim(),
    metaDescription: form.metaDescription.trim(),
    noIndex: form.noIndex,
    categoryId: form.categoryId === 'none' ? null : Number(form.categoryId),
    tagIds: [...form.tagIds],
  })
}
</script>
