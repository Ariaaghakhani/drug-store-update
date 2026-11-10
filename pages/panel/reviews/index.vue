<!-- pages/panel/reviews/index.vue -->
<template>
  <UCard>
    <div class="flex items-center justify-between mb-6 gap-3 flex-wrap">
      <h3 class="text-xl font-black text-gray-900 dark:text-white">
        نظرهای <span class="text-brand-500">من</span>
      </h3>
    </div>

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="space-y-3">
          <USkeleton v-for="i in 3" :key="i" class="h-20 w-full rounded-xl" />
        </div>

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
                  :to="`/medications/${item.goodsId}`"
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
            </div>

            <UButton
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
          title="هنوز نظری ثبت نکرده‌اید"
          text="پس از خرید هر کالا می‌توانید نظر خود را درباره آن ثبت کنید"
        >
          <template #action>
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
  </UCard>
</template>

<script setup>
import DeleteConfirmDialog from '@/components/panel/DeleteConfirmDialog.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'

const PAGE_SIZE = 20

const app = useNuxtApp()
const toast = useAppToast()
// Staff moderation (BACKEND_SYNC_PLAN C8) adds `const isStaff = computed(() => useUserPanelTabs().getUserRole() !== 'customer')`
// and its own branch here. Until then every role sees its own reviews, with no staff-specific UI.

// Paging, loading and error state come from the shared composable (0-based BACK paging behind a 1-based UPagination)
const { items, total, totalPages, page, loading, error, reload } = usePagedList(
  (params) => app.$api.storefront.listMyReviews({ params }),
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
    await app.$api.storefront.deleteMyReview(item.id)
    showDelete.value = false
    toast.success('نظر حذف شد')
    // Last row of a later page: step back, so the list is not left on an empty page
    if (items.value.length === 1 && page.value > 1) page.value -= 1
    else reload()
  } catch (error) {
    toast.error('حذف نظر ناموفق بود', error?.response?.data?.message)
  } finally {
    deletingId.value = null
  }
}

useHead({ title: 'نظرهای من | پنل کاربری' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
