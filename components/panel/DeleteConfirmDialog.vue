<template>
  <UModal :open="open" :ui="{ content: 'sm:max-w-md p-0 gap-0 overflow-hidden' }" @update:open="emit('update:open', $event)">
    <template #content>
      <div class="flex flex-col font-dana" dir="rtl">
        <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div class="w-8 h-8 rounded-lg bg-error/15 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-error" />
          </div>
          <h3 class="flex-1 text-sm font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="emit('update:open', false)"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>

        <div class="px-5 py-5">
          <p class="text-sm text-gray-600 dark:text-gray-300 leading-6">
            {{ message }}
          </p>
          <p v-if="itemName" class="mt-2 text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
            «{{ itemName }}»
          </p>
        </div>

        <div class="flex gap-3 px-5 pb-5">
          <UButton variant="soft" color="neutral" class="flex-1 justify-center" @click="emit('update:open', false)">
            انصراف
          </UButton>
          <UButton color="error" class="flex-1 justify-center" @click="emit('confirm')">
            {{ confirmLabel }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup>
defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, default: 'تأیید حذف' },
  message: { type: String, default: 'آیا از حذف این مورد مطمئن هستید؟ این عملیات قابل بازگشت نیست.' },
  itemName: { type: String, default: '' },
  confirmLabel: { type: String, default: 'حذف' },
})

const emit = defineEmits(['update:open', 'confirm'])
</script>
