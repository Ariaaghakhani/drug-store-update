<template>
  <UCard :ui="{ body: 'p-0' }" class="h-full">
    <div
      class="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800"
    >
      <UIcon
        name="i-heroicons-bell-alert"
        class="w-4 h-4 text-brand-500 dark:text-brand-400"
      />
      <span class="text-sm font-medium text-gray-900 dark:text-white">
        یادآوری داروها
      </span>
    </div>

    <div class="divide-y divide-gray-100 dark:divide-gray-800">
      <div class="relative">
        <Transition name="sk">
          <div
            v-if="loading"
            key="loading"
            class="divide-y divide-gray-100 dark:divide-gray-800"
          >
            <div
              v-for="i in 3"
              :key="i"
              class="flex items-center gap-3 px-5 py-4"
            >
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-36" />
                <USkeleton class="h-4 w-20 rounded-full" />
              </div>
              <USkeleton class="h-8 w-16 rounded-lg" />
            </div>
          </div>

          <div
            v-else-if="!reminders || reminders.length === 0"
            key="empty"
            class="flex flex-col items-center py-10 gap-3 px-5"
          >
            <UIcon
              name="i-heroicons-bell-slash"
              class="w-12 h-12 text-gray-300 dark:text-gray-600"
            />
            <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
              یادآوری برای داروهای شما تنظیم نشده است
            </p>
          </div>

          <div v-else key="content">
            <div
              v-for="reminder in visibleReminders"
              :key="reminder.id"
              class="flex items-center gap-3 px-5 py-4"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ reminder.medicationName }}
                </p>
                <p
                  :class="[
                    'text-xs mt-0.5',
                    isUrgent(reminder.daysRemaining)
                      ? 'text-red-500 dark:text-red-400 font-medium'
                      : 'text-gray-500 dark:text-gray-400',
                  ]"
                >
                  {{ urgencyLabel(reminder.daysRemaining) }}
                </p>
              </div>
              <UButton
                color="primary"
                variant="soft"
                size="xs"
                @click="$emit('order', reminder)"
              >
                سفارش
              </UButton>
            </div>

            <div
              v-if="extraCount > 0"
              class="px-5 py-3 flex justify-center border-t border-gray-100 dark:border-gray-800"
            >
              <UButton
                color="neutral"
                variant="ghost"
                size="xs"
                @click="$emit('viewAll')"
              >
                مشاهده همه ({{ Number(reminders.length).toLocaleString('fa-IR') }})
              </UButton>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </UCard>
</template>

<script setup>
const props = defineProps({
  reminders: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['order', 'viewAll'])

const VISIBLE_LIMIT = 4

const sortedReminders = computed(() =>
  [...props.reminders].sort((a, b) => a.daysRemaining - b.daysRemaining)
)

const visibleReminders = computed(() => sortedReminders.value.slice(0, VISIBLE_LIMIT))
const extraCount = computed(() => Math.max(0, props.reminders.length - VISIBLE_LIMIT))

const isUrgent = (days) => days <= 3

const urgencyLabel = (days) => {
  if (days <= 0) return 'تمام شده'
  if (days <= 3)
    return `${Number(days).toLocaleString('fa-IR')} روز تا اتمام`
  return `${Number(days).toLocaleString('fa-IR')} روز باقی‌مانده`
}
</script>
