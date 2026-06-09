<template>
  <div class="relative">
    <Transition name="sk">
      <UCard v-if="loading" key="sk" :ui="{ body: 'p-0' }" class="ring-1 ring-[var(--color-danger)]/25 dark:ring-[var(--color-danger)]/20">
        <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <USkeleton class="w-4 h-4 rounded flex-shrink-0" />
          <USkeleton class="h-4 w-20" />
        </div>
        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="i in 2" :key="i" class="flex items-center justify-between px-4 sm:px-6 py-4">
            <div class="space-y-1.5">
              <USkeleton class="h-3.5 w-36" />
              <USkeleton class="h-3 w-64" />
            </div>
            <USkeleton class="h-9 w-24 rounded-lg" />
          </div>
        </div>
      </UCard>

      <UCard v-else key="content" :ui="{ body: 'p-0' }" class="ring-1 ring-[var(--color-danger)]/25 dark:ring-[var(--color-danger)]/20">
        <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 flex-shrink-0" style="color: var(--color-danger)" />
          <h3 class="text-sm font-medium" style="color: var(--color-danger)">منطقه خطر</h3>
        </div>
        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          <div class="flex items-center justify-between px-4 sm:px-6 py-4">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">پایان همه جلسات فعال</p>
              <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">از تمام دستگاه‌های متصل خارج خواهید شد</p>
            </div>
            <UButton variant="outline" color="error" size="lg" @click="emit('end-sessions')">پایان جلسات</UButton>
          </div>
          <div class="flex items-center justify-between px-4 sm:px-6 py-4">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">حذف حساب کاربری</p>
              <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">این عملیات غیرقابل بازگشت است و تمام اطلاعات شما حذف خواهد شد</p>
            </div>
            <UButton variant="outline" color="error" size="lg" @click="emit('delete-account')">حذف حساب</UButton>
          </div>
        </div>
      </UCard>
    </Transition>
  </div>
</template>

<script setup>
defineProps({ loading: Boolean })

const emit = defineEmits(['end-sessions', 'delete-account'])
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
