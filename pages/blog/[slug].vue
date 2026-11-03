<template>
  <UContainer>
    <div class="py-12 max-w-3xl mx-auto">
      <NuxtLink
        to="/blog"
        class="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 mb-6"
      >
        <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
        بازگشت به وبلاگ
      </NuxtLink>

      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="space-y-4">
            <USkeleton class="h-10 w-3/4" />
            <USkeleton class="h-4 w-1/3" />
            <USkeleton class="aspect-video w-full" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-2/3" />
          </div>

          <div v-else-if="notFound" key="missing" class="text-center py-20">
            <UIcon name="i-heroicons-newspaper" class="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">مقاله پیدا نشد</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">ممکن است حذف شده یا هنوز منتشر نشده باشد</p>
            <UButton to="/blog" color="primary" icon="i-heroicons-newspaper">مشاهده همه مقاله‌ها</UButton>
          </div>

          <article v-else-if="post" key="post" class="space-y-6">
            <header class="space-y-3">
              <UBadge v-if="post.categoryName" color="neutral" variant="soft">{{ post.categoryName }}</UBadge>
              <h1 class="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white leading-snug">
                {{ post.title }}
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                <span v-if="post.author">{{ post.author }} · </span>{{ formatDate(post.publishedAt) }}
                <span v-if="post.viewCount"> · {{ Number(post.viewCount).toLocaleString('fa-IR') }} بازدید</span>
              </p>
            </header>

            <img v-if="post.coverImageUrl" :src="post.coverImageUrl" :alt="post.title" class="w-full rounded-2xl object-cover" />

            <!-- Store-authored text is shown as plain text on purpose (no v-html), like the other CMS pages -->
            <div class="text-gray-700 dark:text-gray-300 leading-loose whitespace-pre-line">{{ bodyText }}</div>

            <div v-if="galleryImages.length" class="grid grid-cols-2 gap-3">
              <img
                v-for="image in galleryImages"
                :key="image.id"
                :src="image.url"
                :alt="image.fileDescription || post.title"
                loading="lazy"
                class="rounded-xl w-full aspect-video object-cover"
              />
            </div>

            <div v-if="post.tags?.length" class="flex flex-wrap gap-2">
              <UButton
                v-for="tag in post.tags"
                :key="tag.id"
                :to="{ path: '/blog', query: { tagId: tag.id } }"
                size="sm"
                color="neutral"
                variant="ghost"
                icon="i-heroicons-hashtag"
              >
                {{ tag.name }}
              </UButton>
            </div>
          </article>
        </Transition>
      </div>

      <section v-if="post" class="mt-12 space-y-6">
        <h2 class="text-2xl font-black text-gray-900 dark:text-white"><span class="text-brand-500">دیدگاه</span>ها</h2>

        <!-- Write a comment: login needed; it shows after staff approval -->
        <UCard>
          <form v-if="loggedIn" class="space-y-3" @submit.prevent="submitComment">
            <UTextarea
              v-model="commentText"
              :rows="3"
              :maxlength="2000"
              placeholder="دیدگاه خود را بنویسید..."
              class="w-full"
            />
            <div class="flex items-center justify-between gap-3">
              <p class="text-xs text-gray-500 dark:text-gray-400">دیدگاه شما پس از تأیید فروشگاه نمایش داده می‌شود</p>
              <UButton type="submit" color="primary" :loading="sending" :disabled="!commentText.trim()">
                ثبت دیدگاه
              </UButton>
            </div>
          </form>
          <div v-else class="flex items-center justify-between gap-3">
            <p class="text-sm text-gray-600 dark:text-gray-400">برای ثبت دیدگاه وارد حساب خود شوید</p>
            <UButton :to="`/login?redirect=${encodeURIComponent(route.fullPath)}`" color="neutral" variant="outline">
              ورود
            </UButton>
          </div>
        </UCard>

        <div v-if="commentsFailed" class="text-center py-6">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">دریافت دیدگاه‌ها ناموفق بود</p>
          <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="loadComments(true)">
            تلاش دوباره
          </UButton>
        </div>
        <div v-else-if="commentsLoading" class="space-y-3">
          <USkeleton v-for="i in 2" :key="i" class="h-20 w-full rounded-xl" />
        </div>
        <div v-else-if="comments.length === 0" class="text-center py-8">
          <UIcon name="i-heroicons-chat-bubble-left-right" class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p class="font-bold text-gray-900 dark:text-white">هنوز دیدگاهی ثبت نشده</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">اولین نفری باشید که نظر می‌دهد</p>
        </div>
        <div v-else class="space-y-4">
          <UCard v-for="comment in comments" :key="comment.id">
            <p class="text-sm font-bold text-gray-900 dark:text-white">{{ comment.authorName }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">{{ formatDate(comment.createdAt) }}</p>
            <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ comment.content }}</p>
            <div
              v-if="comment.replies?.length"
              class="mt-4 space-y-3 border-s-2 border-gray-100 dark:border-gray-800 ps-4"
            >
              <div v-for="reply in comment.replies" :key="reply.id">
                <p class="text-sm font-bold text-gray-900 dark:text-white">
                  {{ reply.authorName }}
                  <UBadge v-if="reply.staffReply" color="primary" variant="soft" size="sm" class="ms-1">فروشگاه</UBadge>
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">{{ formatDate(reply.createdAt) }}</p>
                <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ reply.content }}</p>
              </div>
            </div>
          </UCard>

          <div v-if="hasMore" class="text-center">
            <UButton color="neutral" variant="soft" :loading="loadingMore" @click="loadComments(false)">
              نمایش دیدگاه‌های بیشتر
            </UButton>
          </div>
        </div>
      </section>
    </div>
  </UContainer>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const COMMENTS_PAGE_SIZE = 10

const route = useRoute()
const { $api, $auth } = useNuxtApp()
const toast = useAppToast()

const loggedIn = computed(() => Boolean($auth?.loggedIn))

// ---------- post ----------
const post = ref(null)
const loading = ref(true)
const notFound = ref(false)

const loadPost = async () => {
  loading.value = true
  notFound.value = false
  post.value = null
  try {
    post.value = (await $api.blog.getPost(route.params.slug)).data.data ?? null
    notFound.value = !post.value
  } catch {
    notFound.value = true // 404 for a draft/unknown slug; any other failure reads the same to a visitor
  } finally {
    loading.value = false
  }
}

// the body can carry simple HTML from the store: shown as text, never v-html
const bodyText = computed(() => htmlToText(post.value?.content))
// the cover is already on top; any other images go underneath
const galleryImages = computed(() =>
  (post.value?.images ?? []).filter((image) => image.url && image.url !== post.value?.coverImageUrl && !image.isPrimary)
)

// ---------- comments ----------
const comments = ref([])
const commentsLoading = ref(false)
const commentsFailed = ref(false)
const loadingMore = ref(false)
const page = ref(0)
const totalPages = ref(0)
const hasMore = computed(() => page.value + 1 < totalPages.value)

const loadComments = async (reset) => {
  if (reset) {
    commentsLoading.value = true
    page.value = 0
    comments.value = []
  } else {
    loadingMore.value = true
  }
  commentsFailed.value = false
  try {
    const nextPage = reset ? 0 : page.value + 1
    const data = (
      await $api.blog.listComments(route.params.slug, { params: { page: nextPage, size: COMMENTS_PAGE_SIZE } })
    ).data.data
    comments.value = reset ? (data?.content ?? []) : [...comments.value, ...(data?.content ?? [])]
    page.value = nextPage
    totalPages.value = data?.totalPages ?? 0
  } catch {
    commentsFailed.value = true
  } finally {
    commentsLoading.value = false
    loadingMore.value = false
  }
}

const commentText = ref('')
const sending = ref(false)

const submitComment = async () => {
  const content = commentText.value.trim()
  if (!content || sending.value) return
  sending.value = true
  try {
    await $api.blog.addComment(route.params.slug, { data: { content } })
    commentText.value = ''
    toast.success('دیدگاه شما ثبت شد', 'پس از تأیید فروشگاه نمایش داده می‌شود')
  } catch (error) {
    if (error?.response?.status === 401) {
      await navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    } else {
      toast.error('ثبت دیدگاه ناموفق بود', 'لطفاً دوباره تلاش کنید')
    }
  } finally {
    sending.value = false
  }
}

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('fa-IR') : '')

watch(
  () => route.params.slug,
  () => {
    loadPost()
    loadComments(true)
  },
  { immediate: true }
)

useHead({
  title: computed(() => (post.value ? `${post.value.metaTitle || post.value.title} | داروخانه آنلاین` : 'مقاله | داروخانه آنلاین')),
  meta: computed(() => [
    { name: 'description', content: post.value?.metaDescription || post.value?.excerpt || '' },
    ...(post.value?.noIndex ? [{ name: 'robots', content: 'noindex' }] : []),
  ]),
})
</script>
