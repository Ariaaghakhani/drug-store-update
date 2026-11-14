<!-- pages/panel/blog/new.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader
      icon="i-heroicons-newspaper"
      title="پست"
      accent="جدید"
      subtitle="پست تازه به‌صورت پیش‌نویس ساخته می‌شود و تا انتشار در سایت دیده نمی‌شود"
    >
      <template #actions>
        <UButton
          type="submit"
          form="blog-post-form"
          color="primary"
          size="lg"
          icon="i-heroicons-check"
          :loading="saving"
        >
          ساخت پیش‌نویس
        </UButton>
      </template>
    </PanelPageHeader>

    <UCard>
      <BlogPostForm :post="null" :busy="saving" @submit="create" />
    </UCard>
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import BlogPostForm from '@/components/panel/blog/BlogPostForm.vue'
import { apiErrorMessage } from '~/utils/apiError.js'

const app = useNuxtApp()
const toast = useAppToast()

const saving = ref(false)

// Creates a DRAFT and opens its editor
const create = async (body) => {
  saving.value = true
  try {
    const res = await app.$api.contentAdmin.createBlogPost({ data: body })
    toast.success('پیش‌نویس ساخته شد')
    await navigateTo(`/panel/blog/${res.data.data.id}`)
  } catch (e) {
    toast.error(apiErrorMessage(e, 'ساخت پست ناموفق بود'))
  } finally {
    saving.value = false
  }
}

useHead({ title: 'پست جدید | وبلاگ | پنل مدیریت' })
</script>
