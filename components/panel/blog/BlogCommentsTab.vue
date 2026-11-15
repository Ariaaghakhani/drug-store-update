<!-- components/panel/blog/BlogCommentsTab.vue -->
<template>
  <div>
    <div class="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
      <USelect v-model="filters.status" :items="statusOptions" size="sm" class="w-52" />
    </div>

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="i in 3" :key="i" class="space-y-3 px-4 sm:px-6 py-4">
            <USkeleton class="h-4 w-56" />
            <USkeleton class="h-3 w-full" />
            <USkeleton class="h-7 w-40 rounded-lg" />
          </div>
        </div>

        <PanelEmptyState
          v-else-if="forbidden"
          key="forbidden"
          variant="forbidden"
          title="دسترسی به نظرهای بلاگ ندارید"
        />

        <PanelEmptyState
          v-else-if="error"
          key="error"
          variant="error"
          title="دریافت نظرها ناموفق بود"
        >
          <template #action>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="reload">
              تلاش دوباره
            </UButton>
          </template>
        </PanelEmptyState>

        <div v-else-if="items.length" key="content">
          <ul class="divide-y divide-gray-100 dark:divide-gray-800">
            <li v-for="row in items" :key="row.id" class="px-4 sm:px-6 py-4 space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ row.authorName || 'بی‌نام' }}
                </span>
                <StatusBadge :meta="metaOf(BLOG_COMMENT_STATUS_META, row.status)" />
                <UBadge v-if="row.staffReply" color="primary" variant="subtle" size="xs">پاسخ فروشگاه</UBadge>
                <span v-if="row.parentId" class="text-xs text-gray-500 dark:text-gray-400">
                  پاسخ به نظر #{{ row.parentId }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ dateText(row.createdAt) }}</span>
              </div>

              <NuxtLink
                :to="`/panel/blog/${row.postId}`"
                class="block text-xs text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 truncate"
              >
                {{ row.postTitle }}
              </NuxtLink>

              <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{{ row.content }}</p>

              <div class="flex flex-wrap gap-2 pt-1">
                <UButton
                  v-if="row.status === 'PENDING' || row.status === 'REJECTED'"
                  color="success"
                  variant="soft"
                  size="xs"
                  icon="i-heroicons-check"
                  :disabled="busyId === row.id"
                  @click="moderate(row, 'approve')"
                >
                  تأیید
                </UButton>
                <UButton
                  v-if="row.status === 'PENDING' || row.status === 'APPROVED'"
                  color="error"
                  variant="soft"
                  size="xs"
                  icon="i-heroicons-x-mark"
                  :disabled="busyId === row.id"
                  @click="moderate(row, 'reject')"
                >
                  رد
                </UButton>
                <UButton
                  v-if="row.status === 'APPROVED'"
                  color="neutral"
                  variant="outline"
                  size="xs"
                  icon="i-heroicons-chat-bubble-left-ellipsis"
                  :disabled="busyId === row.id"
                  @click="replyTarget = row"
                >
                  پاسخ فروشگاه
                </UButton>
                <UButton
                  color="error"
                  variant="ghost"
                  size="xs"
                  icon="i-heroicons-trash"
                  :disabled="busyId === row.id"
                  @click="deleteTarget = row"
                >
                  حذف
                </UButton>
              </div>
            </li>
          </ul>

          <div v-if="totalPages > 1" class="flex justify-center py-4">
            <UPagination v-model:page="page" :total="total" :items-per-page="PAGE_SIZE" />
          </div>
        </div>

        <PanelEmptyState
          v-else
          key="empty"
          icon="i-heroicons-chat-bubble-left-right"
          title="نظری پیدا نشد"
          text="با این فیلتر نظری ثبت نشده است"
        />
      </Transition>
    </div>

    <PanelConfirmDialog
      :open="replyTarget !== null"
      title="پاسخ فروشگاه"
      :message="replyTarget ? `پاسخ شما زیر نظر «${replyTarget.authorName || 'بی‌نام'}» بلافاصله منتشر می‌شود.` : ''"
      confirm-label="ثبت پاسخ"
      note-label="متن پاسخ"
      note-required
      :note-max="2000"
      :loading="replying"
      @update:open="(value) => { if (!value) replyTarget = null }"
      @confirm="reply"
    />

    <PanelConfirmDialog
      :open="deleteTarget !== null"
      title="حذف نظر"
      message="این نظر و پاسخ‌های آن از سایت حذف می‌شوند."
      confirm-label="حذف"
      confirm-color="error"
      :loading="deleting"
      @update:open="(value) => { if (!value) deleteTarget = null }"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
// Blog comment moderation (BLOG_COMMENT). Default filter is the approval queue (PENDING). Approve/reject replace the row
// from the response; a row that no longer matches the filter reloads the page. Replies are written from this tab.
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import { BLOG_COMMENT_STATUS_META } from '~/utils/blogMeta.js'
import { apiErrorMessage } from '~/utils/apiError.js'
import { metaOf, selectItems } from '~/utils/enumMeta.js'
import { formatJalali } from '~/utils/jalali.js'

const app = useNuxtApp()
const toast = useAppToast()

const PAGE_SIZE = 20

// 'all' means no filter; the queue (PENDING) is the default
const filters = reactive({ status: 'PENDING' })
const statusOptions = selectItems(BLOG_COMMENT_STATUS_META, 'همه وضعیت‌ها')

const { items, total, totalPages, page, loading, error, forbidden, reload } = usePagedList(
  ({ page: backendPage, size }) => {
    const params = { page: backendPage, size }
    if (filters.status !== 'all') params.status = filters.status
    return app.$api.contentAdmin.listBlogCommentsAdmin({ params })
  },
  { size: PAGE_SIZE, filters }
)

const dateText = (value) => (value ? formatJalali(value, { withTime: true }) : '')

// Row writes (approve, reject, reply) answer with the comment: swap it in place, or reload when it left the filter
const busyId = ref(null)

const replaceRow = (dto) => {
  const index = items.value.findIndex((row) => row.id === dto?.id)
  if (index === -1) return
  if (filters.status !== 'all' && dto.status !== filters.status) reload()
  else items.value[index] = { ...items.value[index], ...dto }
}

const moderate = async (row, action) => {
  busyId.value = row.id
  try {
    const res =
      action === 'approve'
        ? await app.$api.contentAdmin.approveBlogComment(row.id)
        : await app.$api.contentAdmin.rejectBlogComment(row.id)
    replaceRow(res.data.data)
    toast.success(action === 'approve' ? 'نظر تأیید شد' : 'نظر رد شد')
  } catch (e) {
    toast.error(apiErrorMessage(e, action === 'approve' ? 'تأیید نظر ناموفق بود' : 'رد نظر ناموفق بود'))
  } finally {
    busyId.value = null
  }
}

// Last row of a later page: step back, so the list is not left on an empty page
const afterRemoval = () => {
  if (items.value.length === 1 && page.value > 1) page.value -= 1
  else reload()
}

const replyTarget = ref(null)
const replying = ref(false)

const reply = async (content) => {
  const row = replyTarget.value
  if (!row || replying.value) return
  replying.value = true
  try {
    await app.$api.contentAdmin.replyBlogComment(row.id, { data: { content } })
    replyTarget.value = null
    toast.success('پاسخ منتشر شد')
    // The reply is a new comment of its own, so the list is reloaded to show it
    reload()
  } catch (e) {
    toast.error(apiErrorMessage(e, 'ثبت پاسخ ناموفق بود'))
  } finally {
    replying.value = false
  }
}

const deleteTarget = ref(null)
const deleting = ref(false)

const confirmDelete = async () => {
  const row = deleteTarget.value
  if (!row) return
  deleting.value = true
  try {
    await app.$api.contentAdmin.deleteBlogComment(row.id)
    deleteTarget.value = null
    toast.success('نظر حذف شد')
    afterRemoval()
  } catch (e) {
    toast.error(apiErrorMessage(e, 'حذف نظر ناموفق بود'))
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
