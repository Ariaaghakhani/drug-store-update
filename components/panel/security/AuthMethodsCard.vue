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
            <div class="flex items-center gap-3">
              <USkeleton class="w-9 h-9 rounded-lg flex-shrink-0" />
              <div class="space-y-1.5">
                <USkeleton class="h-3.5 w-28" />
                <USkeleton class="h-3 w-40" />
              </div>
            </div>
            <USkeleton class="h-8 w-16 rounded-lg" />
          </div>
        </div>
      </UCard>

      <UCard v-else key="content" :ui="{ body: 'p-0' }">
        <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-brand-500 flex-shrink-0" />
          <h3 class="text-sm font-medium text-gray-900 dark:text-white">احراز هویت</h3>
        </div>

        <!-- Password -->
        <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-lock-closed" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">رمز عبور</p>
              <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">آخرین تغییر: ۵ روز پیش</p>
            </div>
          </div>
          <UButton variant="soft" color="neutral" size="lg" icon="i-heroicons-lock-closed" @click="emit('change-password')">
            تغییر رمز عبور
          </UButton>
        </div>

        <!-- SMS toggle -->
        <div class="flex items-center justify-between px-4 sm:px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-chat-bubble-left" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">تأیید پیامکی</p>
              <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">۰۹۱۲***۴۵۶</p>
            </div>
          </div>
          <USwitch
            :model-value="smsEnabled"
            size="lg"
            :ui="switchUi"
            @update:model-value="emit('update:smsEnabled', $event)"
          />
        </div>
      </UCard>
    </Transition>
  </div>
</template>

<script setup>
defineProps({
  loading: Boolean,
  smsEnabled: Boolean,
})

const emit = defineEmits(['change-password', 'update:smsEnabled'])

const switchUi = {
  base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
}
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
