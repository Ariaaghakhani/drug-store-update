<!-- pages/panel/questions/index.vue -->
<template>
  <UCard>
    <div class="flex items-center justify-between mb-6 gap-3 flex-wrap">
      <h3 v-if="isStaff" class="text-xl font-black text-gray-900 dark:text-white">
        مدیریت <span class="text-brand-500">پرسش‌ها</span>
      </h3>
      <h3 v-else class="text-xl font-black text-gray-900 dark:text-white">
        پرسش‌های <span class="text-brand-500">من</span>
      </h3>
      <div v-if="isStaff" class="flex items-center gap-3 flex-wrap">
        <USelect v-model="filters.status" :items="statusOptions" size="sm" class="w-44" />
        <USelect v-model="filters.privacy" :items="privacyOptions" size="sm" class="w-40" />
      </div>
    </div>

    <PanelEmptyState
      v-if="!isStaff && profile && !goodsQuestionsEnabled"
      icon="i-heroicons-chat-bubble-left-right"
      title="پرسش و پاسخ کالا فعال نیست"
      text="فروشگاه در حال حاضر پرسش‌های کالاها را دریافت نمی‌کند"
    />

    <div v-else>
      <UAlert
        v-if="isStaff && profile && !goodsQuestionsEnabled"
        color="info"
        variant="soft"
        icon="i-heroicons-information-circle"
        title="پرسش و پاسخ کالا در فروشگاه خاموش است"
        description="پرسش‌های تازه ثبت نمی‌شوند. پرسش‌های موجود را همچنان می‌توانید پاسخ دهید یا مدیریت کنید."
        class="mb-4"
      />

      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="space-y-3">
            <USkeleton v-for="i in 3" :key="i" class="h-24 w-full rounded-xl" />
          </div>

          <PanelEmptyState
            v-else-if="forbidden"
            key="forbidden"
            variant="forbidden"
            title="دسترسی به پرسش‌ها ندارید"
          />

          <PanelEmptyState
            v-else-if="error"
            key="error"
            variant="error"
            title="دریافت پرسش‌ها ناموفق بود"
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
                  <UBadge :color="questionStatusMeta(item.status).color" variant="subtle" size="xs">
                    {{ questionStatusMeta(item.status).label }}
                  </UBadge>
                  <UBadge v-if="item.privateQuestion" color="neutral" variant="subtle" size="xs">خصوصی</UBadge>
                  <UBadge v-if="isStaff && item.anonymous" color="neutral" variant="subtle" size="xs">ناشناس</UBadge>
                </div>

                <span class="block text-xs text-gray-500 dark:text-gray-400">
                  <template v-if="isStaff">{{ item.authorName || 'بی‌نام' }} · </template>{{ formatDate(item.createdAt) }}
                </span>

                <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {{ item.question }}
                </p>

                <div
                  v-if="item.answer && (isStaff || item.status === 'ANSWERED')"
                  class="rounded-xl bg-brand-50 dark:bg-brand-900/20 p-3"
                >
                  <p class="text-xs font-bold text-brand-600 dark:text-brand-400 mb-1">
                    پاسخ{{ item.answerSignature ? ` ${item.answerSignature}` : ' فروشگاه' }}
                  </p>
                  <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {{ item.answer }}
                  </p>
                </div>

                <p v-else-if="!isStaff && item.status === 'REJECTED'" class="text-xs text-gray-500 dark:text-gray-400">
                  این پرسش توسط فروشگاه رد شد و در سایت نمایش داده نمی‌شود
                </p>

                <div v-if="isStaff" class="flex flex-wrap gap-2 pt-1">
                  <UButton
                    color="primary"
                    variant="soft"
                    size="xs"
                    icon="i-heroicons-chat-bubble-left-ellipsis"
                    :disabled="busyId === item.id"
                    @click="openAnswer(item)"
                  >
                    {{ item.answer ? 'ویرایش پاسخ' : 'پاسخ' }}
                  </UButton>
                  <UButton
                    v-if="item.answer"
                    color="error"
                    variant="ghost"
                    size="xs"
                    icon="i-heroicons-arrow-uturn-left"
                    :disabled="busyId === item.id"
                    @click="askStaffConfirm('removeAnswer', item)"
                  >
                    حذف پاسخ
                  </UButton>
                  <UButton
                    v-if="item.status !== 'REJECTED'"
                    color="error"
                    variant="soft"
                    size="xs"
                    icon="i-heroicons-x-mark"
                    :disabled="busyId === item.id"
                    @click="askStaffConfirm('reject', item)"
                  >
                    رد
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
                aria-label="حذف پرسش"
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
            icon="i-heroicons-chat-bubble-left-right"
            :title="isStaff ? 'پرسشی پیدا نشد' : 'هنوز پرسشی ثبت نکرده‌اید'"
            :text="isStaff ? 'با این فیلترها پرسشی ثبت نشده است' : 'اگر درباره‌ی یک کالا سوالی دارید، از صفحه‌ی همان کالا بپرسید'"
          >
            <template v-if="!isStaff" #action>
              <UButton to="/medications" color="primary" icon="i-heroicons-shopping-bag">مشاهده محصولات</UButton>
            </template>
          </PanelEmptyState>
        </Transition>
      </div>
    </div>

    <DeleteConfirmDialog
      v-model:open="showDelete"
      title="حذف پرسش"
      message="آیا از حذف این پرسش مطمئن هستید؟ پس از حذف، پرسش از سایت و از این صفحه حذف می‌شود."
      :item-name="target?.goodsName ?? ''"
      confirm-label="حذف پرسش"
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

    <QuestionAnswerModal
      v-if="isStaff"
      v-model:open="answerOpen"
      :question="answerTarget"
      @saved="replaceRow"
    />
  </UCard>
</template>

<script setup>
import DeleteConfirmDialog from '@/components/panel/DeleteConfirmDialog.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import QuestionAnswerModal from '@/components/panel/questions/QuestionAnswerModal.vue'
import { apiErrorMessage } from '~/utils/apiError.js'

const PAGE_SIZE = 20

const app = useNuxtApp()
const toast = useAppToast()
const { profile, goodsQuestionsEnabled } = useStoreProfile()
const { getUserRole } = useUserPanelTabs()

// Staff (any non-customer role) work the question queue with the admin endpoint; customers keep their own list.
const isStaff = computed(() => getUserRole() !== 'customer')

// Staff filters. The status defaults to the answer queue (PENDING, oldest first); 'all' means no filter.
const filters = reactive({ status: 'PENDING', privacy: 'all' })
const statusOptions = [
  { value: 'all', label: 'همه وضعیت‌ها' },
  { value: 'PENDING', label: 'صف پاسخ' },
  { value: 'ANSWERED', label: 'پاسخ داده شده' },
  { value: 'REJECTED', label: 'رد شده' },
]
const privacyOptions = [
  { value: 'all', label: 'همه پرسش‌ها' },
  { value: 'private', label: 'فقط خصوصی' },
  { value: 'public', label: 'فقط عمومی' },
]

// Paging, loading and error state come from the shared composable (0-based BACK paging behind a 1-based UPagination)
const { items, total, totalPages, page, loading, error, forbidden, reload } = usePagedList(
  ({ page: backendPage, size }) => {
    if (!isStaff.value) return app.$api.storefront.listMyQuestions({ params: { page: backendPage, size } })
    const params = { page: backendPage, size }
    if (filters.status !== 'all') params.status = filters.status
    if (filters.privacy !== 'all') params.privateQuestion = filters.privacy === 'private'
    return app.$api.contentAdmin.listQuestionsAdmin({ params })
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

// ---------- customer: delete own question ----------
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
    await app.$api.storefront.deleteMyQuestion(item.id)
    showDelete.value = false
    toast.success('پرسش حذف شد')
    afterRemoval()
  } catch (error) {
    toast.error('حذف پرسش ناموفق بود', error?.response?.data?.message)
  } finally {
    deletingId.value = null
  }
}

// ---------- staff: moderation (rows are replaced in place from each response) ----------
const busyId = ref(null)

const replaceRow = (dto) => {
  const index = items.value.findIndex((row) => row.id === dto?.id)
  if (index !== -1) items.value[index] = { ...items.value[index], ...dto }
}

// Answer modal
const answerOpen = ref(false)
const answerTarget = ref(null)

const openAnswer = (item) => {
  answerTarget.value = item
  answerOpen.value = true
}

// Confirm dialogs for removing an answer, rejecting and deleting a question
const staffConfirm = ref(null)
const staffConfirmBusy = ref(false)

const STAFF_CONFIRM_COPY = {
  removeAnswer: {
    title: 'حذف پاسخ',
    message: 'پاسخ فروشگاه حذف شود؟ پرسش دوباره در صف پاسخ قرار می‌گیرد.',
    confirmLabel: 'حذف پاسخ',
    failed: 'حذف پاسخ ناموفق بود',
  },
  reject: {
    title: 'رد پرسش',
    message: 'این پرسش در سایت نمایش داده نمی‌شود. ادامه می‌دهید؟',
    confirmLabel: 'رد پرسش',
    failed: 'رد پرسش ناموفق بود',
  },
  delete: {
    title: 'حذف پرسش',
    message: 'این پرسش برای همیشه حذف شود؟ پس از حذف، پرسش از سایت و از این صفحه حذف می‌شود.',
    confirmLabel: 'حذف پرسش',
    failed: 'حذف پرسش ناموفق بود',
  },
}

const staffConfirmCopy = computed(() => STAFF_CONFIRM_COPY[staffConfirm.value?.kind] ?? STAFF_CONFIRM_COPY.delete)

const askStaffConfirm = (kind, item) => {
  staffConfirm.value = { kind, item }
}

const confirmStaffAction = async () => {
  const { kind, item } = staffConfirm.value ?? {}
  if (!item) return
  staffConfirmBusy.value = true
  busyId.value = item.id
  try {
    if (kind === 'removeAnswer') {
      const res = await app.$api.contentAdmin.removeQuestionAnswer(item.id)
      replaceRow(res.data.data)
      toast.success('پاسخ حذف شد')
    } else if (kind === 'reject') {
      const res = await app.$api.contentAdmin.rejectQuestion(item.id)
      replaceRow(res.data.data)
      toast.success('پرسش رد شد')
    } else {
      await app.$api.contentAdmin.deleteQuestion(item.id)
      staffConfirm.value = null
      toast.success('پرسش حذف شد')
      afterRemoval()
    }
    staffConfirm.value = null
  } catch (e) {
    toast.error(apiErrorMessage(e, STAFF_CONFIRM_COPY[kind]?.failed ?? 'عملیات ناموفق بود'))
  } finally {
    staffConfirmBusy.value = false
    busyId.value = null
  }
}

useHead({ title: computed(() => (isStaff.value ? 'مدیریت پرسش‌ها | پنل مدیریت' : 'پرسش‌های من | پنل کاربری')) })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
