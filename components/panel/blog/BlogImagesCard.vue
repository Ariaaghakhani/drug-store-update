<!-- components/panel/blog/BlogImagesCard.vue -->
<template>
  <UCard :ui="{ body: 'p-0' }">
    <div class="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-photo" class="w-4 h-4 text-brand-500 dark:text-brand-400" />
        <h4 class="text-sm font-medium text-gray-900 dark:text-white">عکس‌های پست</h4>
      </div>
      <FilePickButton
        label="افزودن عکس"
        icon="i-heroicons-arrow-up-tray"
        accept="image/jpeg,image/png,image/webp"
        multiple
        :loading="uploading"
        @pick="upload"
      />
    </div>

    <div class="p-4 sm:p-6">
      <p v-if="!images.length" class="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
        هنوز عکسی برای این پست ثبت نشده است
      </p>

      <div v-else class="grid grid-cols-2 gap-3">
        <div v-for="image in images" :key="image.id" class="space-y-2 min-w-0">
          <div class="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img :src="image.url" :alt="image.fileName" loading="lazy" class="w-full h-full object-cover">
            <UBadge v-if="image.isPrimary" color="primary" variant="solid" size="xs" class="absolute top-2 start-2">
              کاور
            </UBadge>
          </div>

          <p dir="ltr" class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ image.fileName }}</p>

          <div class="flex items-center gap-2">
            <UButton
              v-if="!image.isPrimary"
              color="neutral"
              variant="outline"
              size="xs"
              :loading="busyId === image.id && busyAction === 'primary'"
              :disabled="busyId !== null"
              @click="setPrimary(image)"
            >
              کاور کن
            </UButton>
            <UButton
              color="error"
              variant="ghost"
              size="xs"
              icon="i-heroicons-trash"
              :disabled="busyId !== null"
              @click="deleteTarget = image"
            >
              حذف
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <PanelConfirmDialog
      :open="deleteTarget !== null"
      title="حذف عکس"
      message="این عکس از پست حذف شود؟"
      confirm-label="حذف"
      confirm-color="error"
      :loading="busyAction === 'delete'"
      @update:open="(value) => { if (!value) deleteTarget = null }"
      @confirm="confirmDelete"
    />
  </UCard>
</template>

<script setup>
// Images of one blog post (BLOG_POST attachments). The cover is the primary one. Writes go to the attachment endpoints;
// the parent reloads its image list from the `changed` event, so the post form keeps its unsaved text.
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import FilePickButton from '@/components/panel/FilePickButton.vue'
import { apiErrorMessage } from '~/utils/apiError.js'

const props = defineProps({
  postId: { type: [String, Number], required: true },
  // AttachmentDTO[] (id, fileName, url, isPrimary)
  images: { type: Array, default: () => [] },
})

const emit = defineEmits(['changed'])

const app = useNuxtApp()
const toast = useAppToast()

const uploading = ref(false)
// One write at a time: the row being changed and what is happening to it
const busyId = ref(null)
const busyAction = ref('')
const deleteTarget = ref(null)

// Files arrive as an array (the picker is `multiple`); the batch goes in one multipart request
const upload = async (files) => {
  uploading.value = true
  try {
    const data = new FormData()
    files.forEach((file) => data.append('files', file))
    await app.$api.contentAdmin.uploadBlogImages(props.postId, { data })
    toast.success(files.length > 1 ? 'عکس‌ها اضافه شد' : 'عکس اضافه شد')
    emit('changed')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'آپلود عکس ناموفق بود'))
  } finally {
    uploading.value = false
  }
}

const setPrimary = async (image) => {
  busyId.value = image.id
  busyAction.value = 'primary'
  try {
    await app.$api.attachment.setPrimary({ data: { id: image.id } })
    toast.success('عکس کاور شد')
    emit('changed')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'تنظیم کاور ناموفق بود'))
  } finally {
    busyId.value = null
    busyAction.value = ''
  }
}

const confirmDelete = async () => {
  const image = deleteTarget.value
  if (!image) return
  busyId.value = image.id
  busyAction.value = 'delete'
  try {
    await app.$api.attachment.deleteAttachment({ data: { id: image.id } })
    deleteTarget.value = null
    toast.success('عکس حذف شد')
    emit('changed')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'حذف عکس ناموفق بود'))
  } finally {
    busyId.value = null
    busyAction.value = ''
  }
}
</script>
