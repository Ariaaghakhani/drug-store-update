<template>
  <div class="relative">
    <Transition name="sk">
      <UCard v-if="loading" key="sk" :ui="{ body: 'p-0' }">
        <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <USkeleton class="w-4 h-4 rounded flex-shrink-0" />
          <USkeleton class="h-4 w-24" />
        </div>
        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="i in 4" :key="i" class="flex items-center gap-3 px-4 sm:px-6 py-4">
            <USkeleton class="w-2 h-2 rounded-full flex-shrink-0" />
            <div class="flex-1 space-y-1.5">
              <USkeleton class="h-3.5 w-24" />
              <USkeleton class="h-3 w-44" />
            </div>
            <USkeleton class="h-3 w-20 flex-shrink-0" />
          </div>
        </div>
      </UCard>

      <UCard v-else key="content" :ui="{ body: 'p-0' }">
        <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <UIcon name="i-heroicons-clock" class="w-4 h-4 text-brand-500 flex-shrink-0" />
          <h3 class="text-sm font-medium text-gray-900 dark:text-white">تاریخچه ورود</h3>
        </div>
        <div v-if="!history?.length" class="text-center py-10">
          <p class="text-sm text-gray-500 dark:text-gray-400">تاریخچه‌ای برای نمایش وجود ندارد</p>
        </div>
        <div v-else class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="entry in history" :key="entry.id" class="flex items-center gap-3 px-4 sm:px-6 py-4">
            <div :class="['w-2 h-2 rounded-full flex-shrink-0', entry.success ? 'bg-success' : 'bg-error']" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ actionLabel(entry.action) }}</p>
                <UBadge v-if="entry.suspicious" color="error" variant="subtle" size="sm">مشکوک</UBadge>
              </div>
              <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                {{ entry.device || 'نامشخص' }} · {{ entry.ip || 'نامشخص' }}
                <span v-if="entry.failureReason"> · {{ failureReasonLabel(entry.failureReason) }}</span>
              </p>
            </div>
            <p class="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0">{{ formatTime(entry.occurredAt) }}</p>
          </div>
        </div>
        <div v-if="hasMore" class="px-4 sm:px-6 py-3 border-t border-gray-100 dark:border-gray-800">
          <UButton
            block
            color="neutral"
            variant="soft"
            size="sm"
            :loading="loadingMore"
            @click="emit('load-more')"
          >
            نمایش بیشتر
          </UButton>
        </div>
      </UCard>
    </Transition>
  </div>
</template>

<script setup>
defineProps({
  loading: Boolean,
  loadingMore: Boolean,
  hasMore: Boolean,
  history: Array,
})

const emit = defineEmits(['load-more'])

const ACTION_LABELS = {
  PASSWORD: 'ورود با رمز',
  OTP: 'ورود با کد پیامکی',
  REGISTER: 'ثبت‌نام',
  LOGOUT: 'خروج',
  LOGOUT_ALL: 'خروج از همه‌ی دستگاه‌ها',
}

const FAILURE_REASON_LABELS = {
  BAD_CREDENTIALS: 'رمز اشتباه',
  OTP_INVALID: 'کد اشتباه',
  LOCKED: 'حساب قفل بود',
  PASSWORD_EXPIRED: 'رمز منقضی شده',
}

const actionLabel = (action) => ACTION_LABELS[action] ?? action
const failureReasonLabel = (reason) => FAILURE_REASON_LABELS[reason] ?? reason

const formatTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('fa-IR')
}
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
