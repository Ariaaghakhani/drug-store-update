<!-- pages/panel/reviews/index.vue -->
<template>
  <UCard>
    <div class="flex items-center justify-between mb-6 gap-3 flex-wrap">
      <h3 v-if="isStaff" class="text-xl font-black text-gray-900 dark:text-white">
        مدیریت <span class="text-brand-500">نظرات</span>
      </h3>
      <h3 v-else class="text-xl font-black text-gray-900 dark:text-white">
        نظرهای <span class="text-brand-500">من</span>
      </h3>
      <div v-if="isStaff" class="flex items-center gap-3 flex-wrap">
        <USelect v-model="filters.status" :items="statusOptions" size="sm" class="w-52" />
        <USelect v-model="filters.rating" :items="ratingOptions" size="sm" class="w-36" />
      </div>
    </div>

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="space-y-3">
          <USkeleton v-for="i in 3" :key="i" class="h-20 w-full rounded-xl" />
        </div>

        <PanelEmptyState
          v-else-if="forbidden"
          key="forbidden"
          variant="forbidden"
          :title="isStaff ? 'دسترسی به نظرات ندارید' : 'دسترسی به نظرها ندارید'"
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

        <div v-else-if="items.length" key="content" class="space-y-3">
          <div
            v-for="item in items"
            :key="item.id"
            class="flex items-start gap-4 px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800"
          >
            <div class="flex-1 min-w-0 space-y-2">
              <div class="flex items-center gap-2 flex-wrap">
                <NuxtLink
                  :to="goodsLink(item)"
                  class="text-sm font-semibold text-gray-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400 truncate"
                >
                  {{ item.goodsName }}
                </NuxtLink>
                <UBadge :color="reviewStatusMeta(item.status).color" variant="subtle" size="xs">
                  {{ reviewStatusMeta(item.status).label }}
                </UBadge>
              </div>

              <div class="flex items-center gap-3 flex-wrap">
                <div class="flex gap-0.5">
                  <UIcon
                    v-for="star in 5"
                    :key="star"
                    :name="star <= item.rating ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                    class="w-4 h-4 text-yellow-400 dark:text-yellow-300"
                  />
                </div>
                <span v-if="isStaff && item.authorName" class="text-xs text-gray-700 dark:text-gray-300">
                  {{ item.authorName }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(item.updatedAt || item.createdAt) }}
                </span>
              </div>

              <p
                v-if="item.comment"
                class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line"
              >
                {{ item.comment }}
              </p>

              <div v-if="item.storeReply" class="rounded-xl bg-brand-50 dark:bg-brand-900/20 p-3">
                <p class="text-xs font-bold text-brand-600 dark:text-brand-400 mb-1">پاسخ فروشگاه</p>
                <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {{ item.storeReply }}
                </p>
              </div>

              <div v-if="isStaff" class="flex flex-wrap gap-2 pt-1">
                <UButton
                  v-if="canApprove(item)"
                  color="success"
                  variant="soft"
                  size="xs"
                  icon="i-heroicons-check"
                  :disabled="busyId === item.id"
                  @click="approve(item)"
                >
                  تأیید
                </UButton>
                <UButton
                  v-if="canReject(item)"
                  color="error"
                  variant="soft"
                  size="xs"
                  icon="i-heroicons-x-mark"
                  :disabled="busyId === item.id"
                  @click="reject(item)"
                >
                  رد
                </UButton>
                <UButton
                  color="neutral"
                  variant="outline"
                  size="xs"
                  icon="i-heroicons-chat-bubble-left-ellipsis"
                  :disabled="busyId === item.id"
                  @click="openReply(item)"
                >
                  {{ item.storeReply ? 'ویرایش پاسخ' : 'پاسخ' }}
                </UButton>
                <UButton
                  v-if="item.storeReply"
                  color="error"
                  variant="ghost"
                  size="xs"
                  icon="i-heroicons-arrow-uturn-left"
                  :disabled="busyId === item.id"
                  @click="askStaffConfirm('removeReply', item)"
                >
                  حذف پاسخ
                </UButton>
                <UButton
                  color="error"
                  variant="ghost"
                  size="xs"
                  icon="i-heroicons-trash"
                  :disabled="busyId === item.id"
                  @click="askStaffConfirm('delete', item)"
                >
                  حذف
                </UButton>
              </div>
            </div>

            <UButton
              v-if="!isStaff"
              color="error"
              variant="ghost"
              square
              icon="i-heroicons-trash"
              :loading="deletingId === item.id"
              aria-label="حذف نظر"
              @click="askDelete(item)"
            />
          </div>

          <div v-if="totalPages > 1" class="flex justify-center pt-2">
            <UPagination v-model:page="page" :total="total" :items-per-page="PAGE_SIZE" />
          </div>
        </div>

        <PanelEmptyState
          v-else
          key="empty"
          icon="i-heroicons-star"
          :title="isStaff ? 'نظری پیدا نشد' : 'هنوز نظری ثبت نکرده‌اید'"
          :text="isStaff ? 'با این فیلترها نظری ثبت نشده است' : 'پس از خرید هر کالا می‌توانید نظر خود را درباره آن ثبت کنید'"
        >
          <template v-if="!isStaff" #action>
            <UButton to="/medications" color="primary" icon="i-heroicons-shopping-bag">مشاهده محصولات</UButton>
          </template>
        </PanelEmptyState>
      </Transition>
    </div>

    <DeleteConfirmDialog
      v-model:open="showDelete"
      title="حذف نظر"
      message="آیا از حذف این نظر مطمئن هستید؟ پس از حذف، نظر از سایت حذف می‌شود."
      :item-name="target?.goodsName ?? ''"
      confirm-label="حذف نظر"
      @confirm="confirmDelete"
    />

    <PanelConfirmDialog
      :open="staffConfirm !== null"
      :title="staffConfirmCopy.title"
      :message="staffConfirmCopy.message"
      :confirm-label="staffConfirmCopy.confirmLabel"
      confirm-color="error"
      :loading="staffConfirmBusy"
      @update:open="(value) => { if (!value) staffConfirm = null }"
      @confirm="confirmStaffAction"
    />

    <ReviewReplyModal
      v-if="isStaff"
      v-model:open="replyOpen"
      :review="replyTarget"
      @saved="replaceRow"
    />
  </UCard>
</template>

<script setup>
import DeleteConfirmDialog from '@/components/panel/DeleteConfirmDialog.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import ReviewReplyModal from '@/components/panel/reviews/ReviewReplyModal.vue'
import { apiErrorMessage } from '~/utils/apiError.js'
import { selectItems } from '~/utils/enumMeta.js'
import { REVIEW_STATUS_META } from '~/utils/reviewMeta.js'

const PAGE_SIZE = 20

const app = useNuxtApp()
const toast = useAppToast()
const { getUserRole } = useUserPanelTabs()

// Staff (any non-customer role) moderate every review with the admin endpoint; customers keep their own list.
const isStaff = computed(() => getUserRole() !== 'customer')

// Staff filters: 'all' means no filter (the status defaults to the moderation queue).
const filters = reactive({ status: 'PENDING', rating: 'all' })
const statusOptions = selectItems(REVIEW_STATUS_META, 'همه وضعیت‌ها')
const ratingOptions = [
  { value: 'all', label: 'همه امتیازها' },
  ...[5, 4, 3, 2, 1].map((stars) => ({ value: String(stars), label: `${stars.toLocaleString('fa-IR')} ستاره` })),
]

// Paging, loading and error state come from the shared composable (0-based BACK paging behind a 1-based UPagination)
const { items, total, totalPages, page, loading, error, forbidden, reload } = usePagedList(
  ({ page: backendPage, size }) => {
    if (!isStaff.value) return app.$api.storefront.listMyReviews({ params: { page: backendPage, size } })
    const params = { page: backendPage, size }
    if (filters.status !== 'all') params.status = filters.status
    if (filters.rating !== 'all') params.rating = Number(filters.rating)
    return app.$api.contentAdmin.listReviewsAdmin({ params })
  },
  { size: PAGE_SIZE, filters }
)

const formatDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('fa-IR')
}

const goodsLink = (item) => (isStaff.value ? `/panel/products/${item.goodsId}` : `/medications/${item.goodsId}`)

// Last row of a later page: step back, so the list is not left on an empty page
const afterRemoval = () => {
  if (items.value.length === 1 && page.value > 1) page.value -= 1
  else reload()
}

// ---------- customer: delete own review ----------
const showDelete = ref(false)
const target = ref(null)
const deletingId = ref(null)

const askDelete = (item) => {
  target.value = item
  showDelete.value = true
}

const confirmDelete = async () => {
  const item = target.value
  if (!item) return
  deletingId.value = item.id
  try {
    await app.$api.storefront.deleteMyReview(item.id)
    showDelete.value = false
    toast.success('نظر حذف شد')
    afterRemoval()
  } catch (error) {
    toast.error('حذف نظر ناموفق بود', error?.response?.data?.message)
  } finally {
    deletingId.value = null
  }
}

// ---------- staff: moderation (rows are replaced in place from each response) ----------
const busyId = ref(null)

const canApprove = (item) => item.status === 'PENDING' || item.status === 'REJECTED'
const canReject = (item) => item.status === 'PENDING' || item.status === 'APPROVED'

const replaceRow = (dto) => {
  const index = items.value.findIndex((row) => row.id === dto?.id)
  if (index !== -1) items.value[index] = { ...items.value[index], ...dto }
}

const runStaffWrite = async (item, request, successMessage, fallbackError) => {
  busyId.value = item.id
  try {
    const res = await request()
    replaceRow(res.data.data)
    toast.success(successMessage)
  } catch (e) {
    toast.error(apiErrorMessage(e, fallbackError))
  } finally {
    busyId.value = null
  }
}

const approve = (item) =>
  runStaffWrite(item, () => app.$api.contentAdmin.approveReview(item.id), 'نظر تأیید شد', 'تأیید نظر ناموفق بود')

const reject = (item) =>
  runStaffWrite(item, () => app.$api.contentAdmin.rejectReview(item.id), 'نظر رد شد', 'رد نظر ناموفق بود')

// Reply modal
const replyOpen = ref(false)
const replyTarget = ref(null)

const openReply = (item) => {
  replyTarget.value = item
  replyOpen.value = true
}

// Confirm dialogs for removing a reply and deleting a review
const staffConfirm = ref(null)
const staffConfirmBusy = ref(false)

const staffConfirmCopy = computed(() => {
  if (staffConfirm.value?.kind === 'removeReply') {
    return {
      title: 'حذف پاسخ فروشگاه',
      message: 'پاسخ فروشگاه از زیر این نظر حذف شود؟',
      confirmLabel: 'حذف پاسخ',
    }
  }
  return {
    title: 'حذف نظر',
    message: 'این نظر برای همیشه حذف شود؟ پس از حذف، نظر از سایت حذف می‌شود.',
    confirmLabel: 'حذف نظر',
  }
})

const askStaffConfirm = (kind, item) => {
  staffConfirm.value = { kind, item }
}

const confirmStaffAction = async () => {
  const { kind, item } = staffConfirm.value ?? {}
  if (!item) return
  staffConfirmBusy.value = true
  try {
    if (kind === 'removeReply') {
      const res = await app.$api.contentAdmin.removeReviewReply(item.id)
      replaceRow(res.data.data)
      toast.success('پاسخ حذف شد')
    } else {
      await app.$api.contentAdmin.deleteReview(item.id)
      staffConfirm.value = null
      toast.success('نظر حذف شد')
      afterRemoval()
    }
    staffConfirm.value = null
  } catch (e) {
    toast.error(apiErrorMessage(e, kind === 'removeReply' ? 'حذف پاسخ ناموفق بود' : 'حذف نظر ناموفق بود'))
  } finally {
    staffConfirmBusy.value = false
  }
}

useHead({ title: computed(() => (isStaff.value ? 'مدیریت نظرات | پنل مدیریت' : 'نظرهای من | پنل کاربری')) })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
