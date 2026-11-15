<!-- pages/panel/blog/[id].vue -->
<template>
  <div class="space-y-5">
    <template v-if="post">
      <PanelPageHeader icon="i-heroicons-newspaper" title="ویرایش" accent="پست" :subtitle="post.title">
        <template #actions>
          <StatusBadge :meta="postStateMeta(post)" size="sm" />
          <UButton
            v-if="post.status === 'PUBLISHED'"
            :to="`/blog/${post.slug}`"
            target="_blank"
            color="neutral"
            variant="outline"
            icon="i-heroicons-arrow-top-right-on-square"
            :disabled="busy"
          >
            مشاهده
          </UButton>
          <UButton
            v-if="post.status === 'DRAFT'"
            color="success"
            variant="soft"
            icon="i-heroicons-paper-airplane"
            :disabled="busy"
            @click="publishOpen = true"
          >
            انتشار
          </UButton>
          <UButton
            v-else
            color="neutral"
            variant="outline"
            icon="i-heroicons-arrow-uturn-left"
            :disabled="busy"
            @click="unpublishOpen = true"
          >
            برگرداندن به پیش‌نویس
          </UButton>
          <UButton
            color="error"
            variant="outline"
            icon="i-heroicons-trash"
            :disabled="busy"
            @click="deleteOpen = true"
          >
            حذف
          </UButton>
          <UButton
            type="submit"
            form="blog-post-form"
            color="primary"
            size="lg"
            icon="i-heroicons-check"
            :loading="saving"
            :disabled="busy"
          >
            ذخیره
          </UButton>
        </template>
      </PanelPageHeader>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <UCard class="lg:col-span-2">
          <BlogPostForm :post="post" :busy="busy" @submit="save" />
        </UCard>
        <BlogImagesCard :post-id="post.id" :images="images" @changed="refreshImages" />
      </div>

      <PublishPostModal v-model:open="publishOpen" :post="post" @saved="onPostChanged" />

      <PanelConfirmDialog
        :open="unpublishOpen"
        title="برگرداندن به پیش‌نویس"
        message="پست از سایت برداشته می‌شود و تا انتشار دوباره دیده نمی‌شود."
        confirm-label="برگرداندن"
        :loading="actionBusy"
        @update:open="(value) => { if (!value) unpublishOpen = false }"
        @confirm="unpublish"
      />

      <PanelConfirmDialog
        :open="deleteOpen"
        title="حذف پست"
        :message="`پست «${post.title}» و عکس‌هایش برای همیشه حذف شود؟`"
        confirm-label="حذف"
        confirm-color="error"
        :loading="actionBusy"
        @update:open="(value) => { if (!value) deleteOpen = false }"
        @confirm="remove"
      />
    </template>

    <UCard v-else>
      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="space-y-4">
            <USkeleton class="h-6 w-48" />
            <USkeleton class="h-9 w-full rounded-lg" />
            <USkeleton class="h-9 w-full rounded-lg" />
            <USkeleton class="h-40 w-full rounded-lg" />
          </div>

          <PanelEmptyState
            v-else-if="loadError === 'forbidden'"
            key="forbidden"
            variant="forbidden"
            title="دسترسی به این پست ندارید"
          />

          <PanelEmptyState
            v-else-if="loadError === 'notFound'"
            key="not-found"
            icon="i-heroicons-document-magnifying-glass"
            title="پست یافت نشد"
            text="این پست وجود ندارد یا حذف شده است"
          >
            <template #action>
              <UButton to="/panel/blog" color="neutral" variant="soft">بازگشت به فهرست</UButton>
            </template>
          </PanelEmptyState>

          <PanelEmptyState
            v-else
            key="error"
            variant="error"
            title="دریافت پست ناموفق بود"
          >
            <template #action>
              <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="loadPost">
                تلاش دوباره
              </UButton>
            </template>
          </PanelEmptyState>
        </Transition>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import BlogPostForm from '@/components/panel/blog/BlogPostForm.vue'
import BlogImagesCard from '@/components/panel/blog/BlogImagesCard.vue'
import PublishPostModal from '@/components/panel/blog/PublishPostModal.vue'
import { postStateMeta } from '~/utils/blogMeta.js'
import { apiErrorMessage, errorStatus } from '~/utils/apiError.js'

const route = useRoute()
const app = useNuxtApp()
const toast = useAppToast()

const postId = route.params.id

const post = ref(null)
// Images live apart from the post copy: an image change must not reset the form's unsaved text
const images = ref([])
const loading = ref(true)
// 'forbidden' | 'notFound' | 'error' | null
const loadError = ref(null)

const saving = ref(false)
const actionBusy = ref(false)
const publishOpen = ref(false)
const unpublishOpen = ref(false)
const deleteOpen = ref(false)

// Any write in flight (save or a status/delete action) locks the other controls
const busy = computed(() => saving.value || actionBusy.value)

// Client-only fetch (BACK resolves the tenant from the request, which a server-side fetch lacks)
const loadPost = async () => {
  loading.value = true
  loadError.value = null
  try {
    const res = await app.$api.contentAdmin.getBlogPostAdmin(postId)
    post.value = res.data.data
    images.value = post.value.images ?? []
  } catch (e) {
    post.value = null
    const status = errorStatus(e)
    loadError.value = status === 403 ? 'forbidden' : status === 404 ? 'notFound' : 'error'
  } finally {
    loading.value = false
  }
}

// Every successful write answers with the full post, which replaces the copy on screen (the form resets to it)
const onPostChanged = (dto) => {
  post.value = dto
  images.value = dto.images ?? []
}

// After an image change only the image list is reloaded; the post copy (and the form's text) stays as it is
const refreshImages = async () => {
  try {
    const res = await app.$api.contentAdmin.getBlogPostAdmin(postId)
    images.value = res.data.data.images ?? []
  } catch (e) {
    toast.error(apiErrorMessage(e, 'بارگذاری عکس‌ها ناموفق بود'))
  }
}

const save = async (body) => {
  saving.value = true
  try {
    const res = await app.$api.contentAdmin.updateBlogPost(postId, { data: body })
    onPostChanged(res.data.data)
    toast.success('پست ذخیره شد')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'ذخیره پست ناموفق بود'))
  } finally {
    saving.value = false
  }
}

const unpublish = async () => {
  actionBusy.value = true
  try {
    const res = await app.$api.contentAdmin.unpublishBlogPost(postId)
    onPostChanged(res.data.data)
    unpublishOpen.value = false
    toast.success('پست به پیش‌نویس برگشت')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'برگرداندن پست ناموفق بود'))
  } finally {
    actionBusy.value = false
  }
}

const remove = async () => {
  actionBusy.value = true
  try {
    await app.$api.contentAdmin.deleteBlogPost(postId)
    toast.success('پست حذف شد')
    await navigateTo('/panel/blog')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'حذف پست ناموفق بود'))
  } finally {
    actionBusy.value = false
  }
}

onMounted(loadPost)

useHead({ title: computed(() => (post.value ? `${post.value.title} | وبلاگ | پنل مدیریت` : 'ویرایش پست | پنل مدیریت')) })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
