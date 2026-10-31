<!-- pages/panel/wishlist.vue -->
<template>
  <UCard>
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-black text-gray-900 dark:text-white">
        علاقه‌مندی‌های <span class="text-brand-500">من</span>
      </h3>
    </div>

    <div v-if="profile && !wishlistEnabled" class="text-center py-16">
      <UIcon name="i-heroicons-heart" class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto" />
      <h4 class="text-base font-bold text-gray-900 dark:text-white mt-4 mb-2">لیست علاقه‌مندی فعال نیست</h4>
    </div>

    <div v-else class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="space-y-3">
          <USkeleton v-for="i in 3" :key="i" class="h-20 w-full rounded-xl" />
        </div>

        <div v-else-if="items.length" key="content" class="space-y-3">
          <div
            v-for="item in items"
            :key="item.goodsId"
            class="flex items-center gap-4 px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800"
          >
            <NuxtLink :to="`/medications/${item.goodsId}`" class="flex items-center gap-4 flex-1 min-w-0">
              <div class="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                <img v-if="item.card?.imageUrl" :src="item.card.imageUrl" :alt="item.goodsName" class="w-full h-full object-cover" />
                <UIcon v-else name="i-heroicons-photo" class="w-6 h-6 text-gray-400 dark:text-gray-600" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {{ item.card?.nameFa || item.goodsName }}
                </p>
                <p v-if="item.available && item.card" class="text-sm font-bold text-brand-500 dark:text-brand-400 mt-0.5">
                  {{ formatPrice(item.card.finalPrice ?? item.card.price ?? 0) }}
                </p>
                <UBadge v-else color="error" variant="subtle" size="xs" class="mt-1">ناموجود</UBadge>
              </div>
            </NuxtLink>
            <UButton
              color="error"
              variant="ghost"
              square
              icon="i-heroicons-trash"
              :loading="removingId === item.goodsId"
              aria-label="حذف از علاقه‌مندی‌ها"
              @click="remove(item)"
            />
          </div>

          <div v-if="totalPages > 1" class="flex justify-center pt-2">
            <UPagination v-model:page="pageNumber" :total="totalElements" :items-per-page="PAGE_SIZE" />
          </div>
        </div>

        <div v-else key="empty" class="text-center py-16">
          <div class="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <UIcon name="i-heroicons-heart" class="w-10 h-10 text-gray-400 dark:text-gray-600" />
          </div>
          <h4 class="text-base font-bold text-gray-900 dark:text-white mb-2">لیست علاقه‌مندی‌ها خالی است</h4>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">با زدن قلب روی هر محصول، آن را اینجا ذخیره کنید</p>
          <UButton to="/medications" color="primary" icon="i-heroicons-shopping-bag">مشاهده محصولات</UButton>
        </div>
      </Transition>
    </div>
  </UCard>
</template>

<script setup>
const PAGE_SIZE = 20

const app = useNuxtApp()
const toast = useAppToast()
const { formatPrice } = useFormat()
const { profile, wishlistEnabled } = useStoreProfile()

const loading = ref(true)
const items = ref([])
const pageNumber = ref(1) // UPagination is 1-based; BACK is 0-based
const totalElements = ref(0)
const totalPages = ref(0)
const removingId = ref(null)

async function fetchItems() {
  loading.value = true
  try {
    const response = await app.$api.storefront.listWishlist({
      params: { page: pageNumber.value - 1, size: PAGE_SIZE },
    })
    const page = response.data.data
    items.value = page?.content ?? []
    totalElements.value = page?.totalElements ?? 0
    totalPages.value = page?.totalPages ?? 0
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
}

async function remove(item) {
  removingId.value = item.goodsId
  try {
    await app.$api.storefront.removeFromWishlist(item.goodsId)
    items.value = items.value.filter((entry) => entry.goodsId !== item.goodsId)
    totalElements.value = Math.max(0, totalElements.value - 1)
  } catch (error) {
    toast.error('حذف ناموفق بود', error?.response?.data?.message)
  } finally {
    removingId.value = null
  }
}

watch(pageNumber, fetchItems)
onMounted(fetchItems)

useHead({ title: 'علاقه‌مندی‌ها | پنل کاربری' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
