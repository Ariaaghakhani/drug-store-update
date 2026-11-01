<template>
  <UModal :open="open" :ui="{ content: 'sm:max-w-md p-0 gap-0 overflow-hidden' }" @update:open="emit('update:open', $event)">
    <template #content>
      <div class="flex flex-col font-dana" dir="rtl">
        <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div class="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-heroicons-identification" class="w-4 h-4 text-brand-500" />
          </div>
          <h3 class="flex-1 text-sm font-semibold text-gray-900 dark:text-white">
            {{ user?.staff ? 'تغییر نقش' : 'دادن نقش کارکنان' }}
          </h3>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="بستن"
            @click="emit('update:open', false)"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>

        <div class="px-5 py-5 space-y-3">
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ user?.fullName }}</p>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">نقش‌های کارکنان</label>
            <USelectMenu
              v-model="selected"
              :items="roleItems"
              value-key="value"
              multiple
              :search-input="false"
              placeholder="انتخاب نقش"
              class="w-full"
            />
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            <template v-if="user?.isCustomer">نقش مشتری همیشه می‌ماند. بدون نقش کارکنان، کاربر فقط مشتری خواهد بود.</template>
            <template v-else>یک کارمند دست‌کم به یک نقش نیاز دارد.</template>
            با ذخیره، کاربر از دستگاه‌هایش خارج می‌شود.
          </p>
        </div>

        <div class="flex gap-3 px-5 pb-5">
          <UButton variant="soft" color="neutral" class="flex-1 justify-center" :disabled="loading" @click="emit('update:open', false)">انصراف</UButton>
          <UButton
            color="primary"
            class="flex-1 justify-center"
            :loading="loading"
            :disabled="!selected.length && !user?.isCustomer"
            @click="emit('save', selected)"
          >
            ذخیره
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup>
const props = defineProps({
  open: { type: Boolean, required: true },
  user: { type: Object, default: null },
  roleItems: { type: Array, required: true },
  initialRoleIds: { type: Array, required: true },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:open', 'save'])

const selected = ref([])

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) selected.value = [...props.initialRoleIds]
  }
)
</script>
