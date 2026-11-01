<template>
  <section class="space-y-6">
    <h2 class="text-2xl font-black text-gray-900 dark:text-white">
      پرسش و <span class="text-brand-500">پاسخ</span>
    </h2>

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="sk" class="space-y-4">
          <USkeleton v-for="i in 2" :key="i" class="h-28 w-full rounded-xl" />
        </div>

        <div v-else key="content">
          <div v-if="failed" class="text-center py-10">
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3"
            />
            <p class="text-gray-600 dark:text-gray-400 mb-4">دریافت پرسش‌ها ناموفق بود</p>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load(true)">
              تلاش دوباره
            </UButton>
          </div>

          <div v-else-if="questions.length === 0" class="text-center py-10">
            <UIcon
              name="i-heroicons-question-mark-circle"
              class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3"
            />
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">
              هنوز پرسشی پاسخ داده نشده
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              پرسش‌هایی که فروشگاه پاسخ دهد اینجا نمایش داده می‌شود
            </p>
          </div>

          <div v-else class="space-y-4">
            <UCard v-for="item in questions" :key="item.id" :ui="{ body: 'p-4 sm:p-6' }">
              <div class="flex items-start gap-3">
                <UIcon name="i-heroicons-question-mark-circle" class="w-5 h-5 text-brand-500 dark:text-brand-400 mt-0.5 shrink-0" />
                <div class="min-w-0 flex-1">
                  <p class="font-medium text-gray-900 dark:text-white whitespace-pre-line">{{ item.question }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span v-if="item.authorName">{{ item.authorName }} · </span>{{ formatDate(item.createdAt) }}
                  </p>
                </div>
              </div>

              <div
                v-if="item.answer"
                class="mt-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 p-4"
              >
                <p class="text-xs font-bold text-brand-600 dark:text-brand-400 mb-1">
                  پاسخ{{ item.answerSignature ? ` ${item.answerSignature}` : ' فروشگاه' }}
                </p>
                <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {{ item.answer }}
                </p>
              </div>
            </UCard>

            <div v-if="hasMore" class="text-center pt-2">
              <UButton color="neutral" variant="soft" :loading="loadingMore" @click="load(false)">
                نمایش پرسش‌های بیشتر
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

const questions = ref([])
const page = ref(0)
const totalPages = ref(0)
const loading = ref(true)
const loadingMore = ref(false)
const failed = ref(false)

const hasMore = computed(() => page.value + 1 < totalPages.value)

// Only answered, public questions come back; the page is empty when the store has Q&A switched off.
const load = async (reset) => {
  if (reset) {
    loading.value = true
    page.value = 0
    questions.value = []
  } else {
    loadingMore.value = true
  }
  failed.value = false

  try {
    const nextPage = reset ? 0 : page.value + 1
    const data = (
      await $api.storefront.listGoodsQuestions(props.goodsId, { params: { page: nextPage, size: PAGE_SIZE } })
    ).data.data
    questions.value = reset ? (data?.content ?? []) : [...questions.value, ...(data?.content ?? [])]
    page.value = nextPage
    totalPages.value = data?.totalPages ?? 0
  } catch {
    failed.value = true
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('fa-IR') : '')

watch(() => props.goodsId, () => load(true), { immediate: true })
</script>
