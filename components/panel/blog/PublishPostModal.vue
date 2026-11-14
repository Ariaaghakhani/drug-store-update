<!-- components/panel/blog/PublishPostModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    title="انتشار پست"
    icon="i-heroicons-paper-airplane"
    :submit-label="submitLabel"
    width="md"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="post" class="text-sm text-gray-700 dark:text-gray-300">«{{ post.title }}»</p>

    <JalaliDateInput v-model="publishedAt" label="زمان انتشار" with-time clearable />
    <p class="text-xs text-gray-500 dark:text-gray-400">
      خالی بماند تا همین حالا منتشر شود. زمان آینده یعنی انتشار زمان‌بندی‌شده؛ تا آن لحظه پست در سایت دیده نمی‌شود.
    </p>
  </PanelFormModal>
</template>

<script setup>
// Publishes a draft now or at a future time. The parent replaces the post from the `saved` payload.
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import JalaliDateInput from '@/components/panel/JalaliDateInput.vue'
import { apiErrorMessage } from '~/utils/apiError.js'

const props = defineProps({
  open: { type: Boolean, required: true },
  // BlogPostDetailDTO being published
  post: { type: Object, default: null },
})

const emit = defineEmits(['update:open', 'saved'])

const app = useNuxtApp()
const toast = useAppToast()

const publishedAt = ref('')
const saving = ref(false)

const submitLabel = computed(() => (publishedAt.value ? 'زمان‌بندی انتشار' : 'انتشار'))

// Every open starts with «now»
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) publishedAt.value = ''
  }
)

const submit = async () => {
  if (saving.value || !props.post) return
  saving.value = true
  try {
    // No body means «now»; a value is sent as a LocalDateTime (scheduled when it is in the future)
    const config = publishedAt.value ? { data: { publishedAt: publishedAt.value } } : undefined
    const res = await app.$api.contentAdmin.publishBlogPost(props.post.id, config)
    toast.success(publishedAt.value ? 'انتشار پست زمان‌بندی شد' : 'پست منتشر شد')
    emit('saved', res.data.data)
    emit('update:open', false)
  } catch (e) {
    toast.error(apiErrorMessage(e, 'انتشار پست ناموفق بود'))
  } finally {
    saving.value = false
  }
}
</script>
