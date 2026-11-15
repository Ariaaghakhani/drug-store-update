<!-- components/panel/users/TermsAcceptancesCard.vue -->
<template>
  <UCard :ui="{ body: 'p-0' }">
    <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
      <UIcon name="i-heroicons-document-check" class="w-4 h-4 text-brand-500 flex-shrink-0" />
      <h3 class="text-sm font-medium text-gray-900 dark:text-white">پذیرش قوانین</h3>
    </div>

    <div v-if="loading" class="divide-y divide-gray-100 dark:divide-gray-800">
      <div v-for="i in 3" :key="i" class="flex items-center gap-3 px-4 sm:px-6 py-4">
        <div class="flex-1 space-y-1.5">
          <USkeleton class="h-3.5 w-48" />
          <USkeleton class="h-3 w-32" />
        </div>
        <USkeleton class="h-3 w-24 flex-shrink-0" />
      </div>
    </div>

    <div v-else-if="error" class="flex flex-col items-center gap-3 py-10">
      <p class="text-sm text-error" role="alert">دریافت پذیرش‌های قوانین ناموفق بود</p>
      <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">تلاش دوباره</UButton>
    </div>

    <div v-else-if="!acceptances.length" class="text-center py-10">
      <p class="text-sm text-gray-500 dark:text-gray-400">این کاربر هنوز قوانینی را نپذیرفته است</p>
    </div>

    <div v-else class="divide-y divide-gray-100 dark:divide-gray-800">
      <div v-for="row in acceptances" :key="row.id" class="flex items-center gap-3 px-4 sm:px-6 py-4">
        <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-success flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
            {{ row.title }}
            <span dir="ltr" class="text-xs font-mono text-gray-500 dark:text-gray-400">({{ row.version }})</span>
          </p>
          <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
            {{ termsTypeLabel(row.type) }} · {{ acceptanceSourceLabel(row.source) }}
            <span v-if="row.ipAddress" dir="ltr"> · {{ row.ipAddress }}</span>
          </p>
        </div>
        <p class="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0">
          {{ formatJalali(row.acceptedAt, { withTime: true }) || '—' }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup>
import { formatJalali } from '~/utils/jalali.js'
import { acceptanceSourceLabel, termsTypeLabel } from '~/utils/termsMeta.js'

// Which terms versions one user accepted (TERMS module), newest first. Reads its own list for `userId`.
const props = defineProps({
  userId: { type: Number, required: true },
})

const app = useNuxtApp()

const acceptances = ref([])
const loading = ref(true)
const error = ref(false)

const load = async () => {
  loading.value = true
  error.value = false
  try {
    const res = await app.$api.contentAdmin.listTermsAcceptances({ params: { userId: props.userId } })
    acceptances.value = res.data.data ?? []
  } catch {
    acceptances.value = []
    error.value = true
  } finally {
    loading.value = false
  }
}

watch(() => props.userId, load)
onMounted(load)
</script>
