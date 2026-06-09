<template>
  <div class="relative">
    <Transition name="sk">
      <UCard v-if="loading" key="sk" :ui="{ body: 'p-0' }">
        <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <USkeleton class="w-4 h-4 rounded flex-shrink-0" />
          <USkeleton class="h-4 w-28" />
        </div>
        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="i in 3" :key="i" class="flex items-center justify-between px-4 sm:px-6 py-4">
            <div class="space-y-1.5">
              <USkeleton class="h-3.5 w-36" />
              <USkeleton class="h-3 w-56" />
            </div>
            <USkeleton class="h-6 w-11 rounded-full" />
          </div>
        </div>
      </UCard>

      <UCard v-else key="content" :ui="{ body: 'p-0' }">
        <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <UIcon name="i-heroicons-bell" class="w-4 h-4 text-brand-500 flex-shrink-0" />
          <h3 class="text-sm font-medium text-gray-900 dark:text-white">اعلان‌های امنیتی</h3>
        </div>
        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="notif in notifications" :key="notif.id" class="flex items-center justify-between px-4 sm:px-6 py-4">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ notif.label }}</p>
              <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{{ notif.description }}</p>
            </div>
            <USwitch
              :model-value="notif.enabled"
              size="lg"
              :ui="switchUi"
              @update:model-value="emit('toggle', notif.id, $event)"
            />
          </div>
        </div>
      </UCard>
    </Transition>
  </div>
</template>

<script setup lang="ts">
export interface SecurityNotification {
  id: string
  label: string
  description: string
  enabled: boolean
}

defineProps<{
  loading?: boolean
  notifications: SecurityNotification[]
}>()

const emit = defineEmits<{
  toggle: [id: string, enabled: boolean]
}>()

const switchUi = {
  base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
}
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
