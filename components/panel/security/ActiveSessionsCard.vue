<template>
  <div class="relative">
    <Transition name="sk">
      <UCard v-if="loading" key="sk" :ui="{ body: 'p-0' }">
        <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-2">
            <USkeleton class="w-4 h-4 rounded flex-shrink-0" />
            <USkeleton class="h-4 w-20" />
          </div>
          <USkeleton class="h-7 w-36 rounded-lg" />
        </div>
        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="i in 3" :key="i" class="flex items-center gap-3 px-4 sm:px-6 py-4">
            <USkeleton class="w-9 h-9 rounded-lg flex-shrink-0" />
            <div class="flex-1 space-y-1.5">
              <USkeleton class="h-3.5 w-28" />
              <USkeleton class="h-3 w-40" />
              <USkeleton class="h-3 w-32" />
            </div>
            <div class="flex flex-col items-end gap-1.5">
              <USkeleton class="h-3 w-16" />
              <USkeleton class="h-7 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      </UCard>

      <UCard v-else key="content" :ui="{ body: 'p-0' }">
        <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-computer-desktop" class="w-4 h-4 text-brand-500 flex-shrink-0" />
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">جلسات فعال</h3>
          </div>
          <UButton variant="soft" color="error" size="sm" icon="i-heroicons-arrow-right-on-rectangle" @click="emit('revoke-all')">
            خروج از همه دستگاه‌ها
          </UButton>
        </div>

        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          <div
            v-for="session in sessions"
            :key="session.id"
            :class="['flex items-center gap-3 px-4 sm:px-6 py-4', session.current && 'bg-brand-500/5 dark:bg-brand-500/10']"
          >
            <div :class="['w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', session.current ? 'bg-brand-500/15 text-brand-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400']">
              <UIcon :name="session.icon" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ session.device }}</p>
                <UBadge v-if="session.current" color="primary" variant="subtle" size="sm">فعلی</UBadge>
              </div>
              <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{{ session.browser }}</p>
              <p class="text-[11px] text-gray-400 dark:text-gray-500">{{ session.location }} · {{ session.ip }}</p>
            </div>
            <div class="flex-shrink-0 flex flex-col items-end gap-1.5">
              <p class="text-[11px] text-gray-400 dark:text-gray-500">{{ session.lastActive }}</p>
              <UButton v-if="!session.current" variant="soft" color="error" size="sm" icon="i-heroicons-x-circle" @click="emit('revoke', session.id)">
                لغو دسترسی
              </UButton>
            </div>
          </div>
        </div>
      </UCard>
    </Transition>
  </div>
</template>

<script setup>
defineProps({
  loading: Boolean,
  sessions: Array,
})

const emit = defineEmits(['revoke', 'revoke-all'])
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
