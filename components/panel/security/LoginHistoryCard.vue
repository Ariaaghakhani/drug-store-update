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
        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="entry in history" :key="entry.id" class="flex items-center gap-3 px-4 sm:px-6 py-4">
            <div :class="['w-2 h-2 rounded-full flex-shrink-0', entry.success ? 'bg-brand-500' : 'bg-[var(--color-danger)]']" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ entry.action }}</p>
                <UBadge v-if="entry.suspicious" color="error" variant="subtle" size="sm">مشکوک</UBadge>
              </div>
              <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{{ entry.device }} · {{ entry.ip }}</p>
            </div>
            <p class="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0">{{ entry.time }}</p>
          </div>
        </div>
      </UCard>
    </Transition>
  </div>
</template>

<script setup lang="ts">
export interface LoginEntry {
  id: number
  success: boolean
  suspicious: boolean
  action: string
  device: string
  ip: string
  time: string
}

defineProps<{
  loading?: boolean
  history: LoginEntry[]
}>()
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
