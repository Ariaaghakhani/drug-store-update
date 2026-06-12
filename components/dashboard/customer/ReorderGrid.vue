<template>
  <UCard :ui="{ body: 'p-0' }">
    <div class="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-4 h-4 text-brand-500 dark:text-brand-400"
      />
      <span class="text-sm font-medium text-gray-900 dark:text-white">
        دوباره بخرید
      </span>
    </div>

    <div class="px-5 py-5">
      <div class="relative">
        <Transition name="sk">
          <div
            v-if="loading"
            key="loading"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            <USkeleton v-for="i in 4" :key="i" class="h-24 w-full rounded-xl" />
          </div>

          <div
            v-else-if="!items || items.length === 0"
            key="empty"
            class="flex flex-col items-center py-8 gap-3"
          >
            <UIcon
              name="i-heroicons-shopping-bag"
              class="w-14 h-14 text-gray-300 dark:text-gray-600"
            />
            <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
              سابقه خریدی برای نمایش وجود ندارد
            </p>
          </div>

          <div
            v-else
            key="content"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            <div
              v-for="item in items"
              :key="item.id"
              class="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-4 flex flex-col gap-3"
            >
              <div
                class="w-9 h-9 rounded-lg flex items-center justify-center bg-brand-100 dark:bg-brand-900/20"
              >
                <UIcon
                  name="i-heroicons-cube"
                  class="w-5 h-5 text-brand-500 dark:text-brand-400"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug">
                  {{ item.nameFa }}
                </p>
                <p class="text-xs text-brand-500 dark:text-brand-400 font-medium mt-1">
                  {{ formatPrice(item.price) }}
                </p>
              </div>
              <UButton
                color="primary"
                variant="soft"
                size="xs"
                icon="i-heroicons-plus"
                block
                @click="$emit('add', item)"
              >
                افزودن
              </UButton>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </UCard>
</template>

<script setup>
import { useFormat } from '@/composables/useFormat'

defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['add'])

const { formatPrice } = useFormat()
</script>
