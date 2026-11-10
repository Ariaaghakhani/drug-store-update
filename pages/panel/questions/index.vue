<!-- pages/panel/questions/index.vue -->
<template>
  <UCard>
    <div class="flex items-center justify-between mb-6 gap-3 flex-wrap">
      <h3 class="text-xl font-black text-gray-900 dark:text-white">
        پرسش‌های <span class="text-brand-500">من</span>
      </h3>
    </div>

    <PanelEmptyState
      v-if="profile && !goodsQuestionsEnabled"
      icon="i-heroicons-chat-bubble-left-right"
      title="پرسش و پاسخ کالا فعال نیست"
      text="فروشگاه در حال حاضر پرسش‌های کالاها را دریافت نمی‌کند"
    />

    <div v-else class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="space-y-3">
          <USkeleton v-for="i in 3" :key="i" class="h-24 w-full rounded-xl" />
        </div>

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
                  :to="`/medications/${item.goodsId}`"
                  class="text-sm font-semibold text-gray-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400 truncate"
                >
                  {{ item.goodsName }}
                </NuxtLink>
                <UBadge :color="questionStatusMeta(item.status).color" variant="subtle" size="xs">
                  {{ questionStatusMeta(item.status).label }}
                </UBadge>
                <UBadge v-if="item.privateQuestion" color="neutral" variant="subtle" size="xs">خصوصی</UBadge>
              </div>

              <span class="block text-xs text-gray-500 dark:text-gray-400">
                {{ formatDate(item.createdAt) }}
              </span>

              <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {{ item.question }}
              </p>

              <div v-if="item.status === 'ANSWERED' && item.answer" class="rounded-xl bg-brand-50 dark:bg-brand-900/20 p-3">
                <p class="text-xs font-bold text-brand-600 dark:text-brand-400 mb-1">
                  پاسخ{{ item.answerSignature ? ` ${item.answerSignature}` : ' فروشگاه' }}
                </p>
                <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {{ item.answer }}
                </p>
              </div>

              <p v-else-if="item.status === 'REJECTED'" class="text-xs text-gray-500 dark:text-gray-400">
                این پرسش توسط فروشگاه رد شد و در سایت نمایش داده نمی‌شود
              </p>
            </div>

            <UButton
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
          title="هنوز پرسشی ثبت نکرده‌اید"
          text="اگر درباره‌ی یک کالا سوالی دارید، از صفحه‌ی همان کالا بپرسید"
        >
          <template #action>
            <UButton to="/medications" color="primary" icon="i-heroicons-shopping-bag">مشاهده محصولات</UButton>
          </template>
        </PanelEmptyState>
      </Transition>
    </div>

    <DeleteConfirmDialog
      v-model:open="showDelete"
      title="حذف پرسش"
      message="آیا از حذف این پرسش مطمئن هستید؟ پس از حذف، پرسش از سایت و از این صفحه حذف می‌شود."
      :item-name="target?.goodsName ?? ''"
      confirm-label="حذف پرسش"
      @confirm="confirmDelete"
    />
  </UCard>
</template>

<script setup>
import DeleteConfirmDialog from '@/components/panel/DeleteConfirmDialog.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'

const PAGE_SIZE = 20

const app = useNuxtApp()
const toast = useAppToast()
const { profile, goodsQuestionsEnabled } = useStoreProfile()
// Staff moderation (BACKEND_SYNC_PLAN C8b) adds `const isStaff = computed(() => useUserPanelTabs().getUserRole() !== 'customer')`
// and its own branch here (queue, answer modal, reject). Until then every role sees its own questions, with no staff UI.

// Paging, loading and error state come from the shared composable (0-based BACK paging behind a 1-based UPagination)
const { items, total, totalPages, page, loading, error, reload } = usePagedList(
  (params) => app.$api.storefront.listMyQuestions({ params }),
  { size: PAGE_SIZE }
)

const formatDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('fa-IR')
}

// ---------- delete ----------
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
    // Last row of a later page: step back, so the list is not left on an empty page
    if (items.value.length === 1 && page.value > 1) page.value -= 1
    else reload()
  } catch (error) {
    toast.error('حذف پرسش ناموفق بود', error?.response?.data?.message)
  } finally {
    deletingId.value = null
  }
}

useHead({ title: 'پرسش‌های من | پنل کاربری' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
