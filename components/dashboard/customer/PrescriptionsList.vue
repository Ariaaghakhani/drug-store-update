<template>
  <UCard :ui="{ body: 'p-0' }">
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-document-text"
          class="w-4 h-4 text-brand-500 dark:text-brand-400"
        />
        <span class="text-sm font-medium text-gray-900 dark:text-white">
          نسخه‌های من
        </span>
      </div>
      <UButton
        color="primary"
        variant="soft"
        size="xs"
        icon="i-heroicons-arrow-up-tray"
        @click="$emit('upload')"
      >
        آپلود نسخه
      </UButton>
    </div>

    <div class="px-5 py-5">
      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="loading" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <USkeleton
              v-for="i in 2"
              :key="i"
              class="h-24 w-full rounded-xl"
            />
          </div>

          <div
            v-else-if="!prescriptions || prescriptions.length === 0"
            key="empty"
            class="flex flex-col items-center py-8 gap-4"
          >
            <UIcon
              name="i-heroicons-document-text"
              class="w-14 h-14 text-gray-300 dark:text-gray-600"
            />
            <div class="text-center">
              <p class="font-bold text-gray-700 dark:text-gray-300">
                نسخه‌ای آپلود نکرده‌اید
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                نسخه‌های پزشکی خود را بارگذاری کنید
              </p>
            </div>
            <UButton
              color="primary"
              icon="i-heroicons-arrow-up-tray"
              @click="$emit('upload')"
            >
              آپلود نسخه
            </UButton>
          </div>

          <div v-else key="content" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="rx in prescriptions"
              :key="rx.id"
              class="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-4 flex flex-col gap-3"
            >
              <div class="flex items-start justify-between gap-2">
                <div
                  class="w-9 h-9 rounded-lg flex items-center justify-center bg-brand-100 dark:bg-brand-900/20 flex-shrink-0"
                >
                  <UIcon
                    name="i-heroicons-document-text"
                    class="w-5 h-5 text-brand-500 dark:text-brand-400"
                  />
                </div>
                <UBadge :color="statusColor(rx.status)" variant="soft" size="xs">
                  {{ statusLabel(rx.status) }}
                </UBadge>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                  {{ rx.description || rx.id }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {{ rx.uploadedAt }}
                </p>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </UCard>
</template>

<script setup>
defineProps({
  prescriptions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['upload'])

const statusLabel = (status) => {
  const labels = {
    approved: 'تأیید شده',
    pending: 'در حال بررسی',
    rejected: 'رد شده',
  }
  return labels[status] ?? status
}

const statusColor = (status) => {
  const colors = {
    approved: 'success',
    pending: 'warning',
    rejected: 'error',
  }
  return colors[status] ?? 'neutral'
}
</script>
