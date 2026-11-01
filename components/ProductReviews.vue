<template>
  <section class="space-y-6">
    <h2 class="text-2xl font-black text-gray-900 dark:text-white">
      نظرات <span class="text-brand-500">کاربران</span>
    </h2>

    <!-- Rating summary -->
    <UCard :ui="{ body: 'p-4 sm:p-6' }">
      <div v-if="summaryLoading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <USkeleton class="h-24 w-full rounded-lg" />
        <USkeleton class="h-24 w-full rounded-lg md:col-span-2" />
      </div>

      <div v-else-if="summaryFailed" class="text-sm text-gray-500 dark:text-gray-400">
        خلاصه امتیازها در دسترس نیست
      </div>

      <div v-else-if="!summary || summary.reviewCount === 0" class="flex items-center gap-3 text-gray-500 dark:text-gray-400">
        <UIcon name="i-heroicons-star" class="w-6 h-6" />
        <span>هنوز امتیازی ثبت نشده است</span>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div class="text-center md:border-e border-gray-100 dark:border-gray-800">
          <p class="text-5xl font-black text-gray-900 dark:text-white">
            {{ Number(summary.averageRating).toLocaleString('fa-IR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }}
          </p>
          <div class="flex justify-center gap-0.5 my-2">
            <UIcon
              v-for="star in 5"
              :key="star"
              :name="star <= Math.round(summary.averageRating) ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
              class="w-5 h-5 text-yellow-400"
            />
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            از {{ Number(summary.reviewCount).toLocaleString('fa-IR') }} نظر
          </p>
        </div>

        <div class="md:col-span-2 space-y-2">
          <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center gap-3 text-sm">
            <span class="w-4 text-gray-700 dark:text-gray-300">{{ star.toLocaleString('fa-IR') }}</span>
            <UIcon name="i-heroicons-star-solid" class="w-4 h-4 text-yellow-400" />
            <div class="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                class="h-full rounded-full bg-yellow-400"
                :style="{ width: `${barPercent(star)}%` }"
              />
            </div>
            <span class="w-10 text-end text-gray-500 dark:text-gray-400">
              {{ countFor(star).toLocaleString('fa-IR') }}
            </span>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Rating filter -->
    <div v-if="summary && summary.reviewCount > 0" class="flex flex-wrap gap-2">
      <UButton
        v-for="option in filterOptions"
        :key="option.value"
        size="sm"
        color="neutral"
        :variant="rating === option.value ? 'solid' : 'soft'"
        @click="setRating(option.value)"
      >
        {{ option.label }}
      </UButton>
    </div>

    <!-- List -->
    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="sk" class="space-y-4">
          <USkeleton v-for="i in 3" :key="i" class="h-28 w-full rounded-xl" />
        </div>

        <div v-else key="content">
          <div v-if="failed" class="text-center py-10">
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3"
            />
            <p class="text-gray-600 dark:text-gray-400 mb-4">دریافت نظرها ناموفق بود</p>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load(true)">
              تلاش دوباره
            </UButton>
          </div>

          <div v-else-if="reviews.length === 0" class="text-center py-10">
            <UIcon
              name="i-heroicons-chat-bubble-left-right"
              class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3"
            />
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {{ rating ? 'نظری با این امتیاز ثبت نشده' : 'هنوز نظری ثبت نشده' }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              {{ rating ? 'فیلتر دیگری را امتحان کنید' : 'اولین نفری باشید که این محصول را ارزیابی می‌کند' }}
            </p>
          </div>

          <div v-else class="space-y-4">
            <UCard v-for="review in reviews" :key="review.id" :ui="{ body: 'p-4 sm:p-6' }">
              <div class="flex items-center justify-between gap-4 mb-2">
                <div class="flex items-center gap-3">
                  <span class="font-bold text-gray-900 dark:text-white">
                    {{ review.authorName || 'کاربر' }}
                  </span>
                  <div class="flex gap-0.5">
                    <UIcon
                      v-for="star in 5"
                      :key="star"
                      :name="star <= review.rating ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                      class="w-4 h-4 text-yellow-400"
                    />
                  </div>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(review.createdAt) }}
                </span>
              </div>

              <p v-if="review.comment" class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {{ review.comment }}
              </p>

              <div
                v-if="review.storeReply"
                class="mt-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 p-4"
              >
                <p class="text-xs font-bold text-brand-600 dark:text-brand-400 mb-1">پاسخ فروشگاه</p>
                <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {{ review.storeReply }}
                </p>
              </div>
            </UCard>

            <div v-if="hasMore" class="text-center pt-2">
              <UButton color="neutral" variant="soft" :loading="loadingMore" @click="load(false)">
                نمایش نظرهای بیشتر
              </UButton>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const PAGE_SIZE = 10

const props = defineProps({
  goodsId: { type: [Number, String], required: true },
})

const { $api } = useNuxtApp()

// ---------- summary ----------
const summary = ref(null)
const summaryLoading = ref(true)
const summaryFailed = ref(false)

const loadSummary = async () => {
  summaryLoading.value = true
  summaryFailed.value = false
  try {
    summary.value = (await $api.storefront.getGoodsRatingSummary(props.goodsId)).data.data
  } catch {
    summary.value = null
    summaryFailed.value = true
  } finally {
    summaryLoading.value = false
  }
}

const countFor = (star) => Number(summary.value?.ratingCounts?.[star] ?? 0)
const barPercent = (star) =>
  summary.value?.reviewCount ? Math.round((countFor(star) / summary.value.reviewCount) * 100) : 0

// ---------- list ----------
const rating = ref(null)
const reviews = ref([])
const page = ref(0)
const totalPages = ref(0)
const loading = ref(true)
const loadingMore = ref(false)
const failed = ref(false)

const hasMore = computed(() => page.value + 1 < totalPages.value)

const filterOptions = [
  { label: 'همه', value: null },
  ...[5, 4, 3, 2, 1].map((star) => ({ label: `${star.toLocaleString('fa-IR')} ستاره`, value: star })),
]

// reset=true starts again from page 0 (new product, new filter, retry); otherwise appends the next page
const load = async (reset) => {
  if (reset) {
    loading.value = true
    page.value = 0
    reviews.value = []
  } else {
    loadingMore.value = true
  }
  failed.value = false

  try {
    const nextPage = reset ? 0 : page.value + 1
    const params = { page: nextPage, size: PAGE_SIZE }
    if (rating.value) params.rating = rating.value
    const data = (await $api.storefront.listGoodsReviews(props.goodsId, { params })).data.data
    reviews.value = reset ? (data?.content ?? []) : [...reviews.value, ...(data?.content ?? [])]
    page.value = nextPage
    totalPages.value = data?.totalPages ?? 0
  } catch {
    failed.value = true
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const setRating = (value) => {
  rating.value = value
  load(true)
}

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('fa-IR') : '')

watch(
  () => props.goodsId,
  () => {
    rating.value = null
    loadSummary()
    load(true)
  },
  { immediate: true }
)
</script>
