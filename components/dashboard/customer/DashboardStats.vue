<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <UCard :ui="{ body: 'p-4 sm:p-5' }">
      <div class="relative">
        <Transition name="sk">
          <div v-if="!loading" key="content" class="flex items-center gap-4">
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center bg-amber-100 dark:bg-amber-900/20 flex-shrink-0"
            >
              <UIcon
                name="i-heroicons-clock"
                class="w-5 h-5 text-amber-600 dark:text-amber-400"
              />
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                در حال ارسال
              </p>
              <p class="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                {{ formatCount(pendingCount) }}
              </p>
            </div>
          </div>
          <div v-else key="loading" class="flex items-center gap-4">
            <USkeleton class="w-11 h-11 rounded-xl flex-shrink-0" />
            <div class="space-y-2 flex-1">
              <USkeleton class="h-4 w-20" />
              <USkeleton class="h-7 w-10" />
            </div>
          </div>
        </Transition>
      </div>
    </UCard>

    <UCard :ui="{ body: 'p-4 sm:p-5' }">
      <div class="relative">
        <Transition name="sk">
          <div v-if="!loading" key="content" class="flex items-center gap-4">
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center bg-green-100 dark:bg-green-900/20 flex-shrink-0"
            >
              <UIcon
                name="i-heroicons-check-circle"
                class="w-5 h-5 text-green-600 dark:text-green-400"
              />
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                تکمیل شده
              </p>
              <p class="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                {{ formatCount(completedCount) }}
              </p>
            </div>
          </div>
          <div v-else key="loading" class="flex items-center gap-4">
            <USkeleton class="w-11 h-11 rounded-xl flex-shrink-0" />
            <div class="space-y-2 flex-1">
              <USkeleton class="h-4 w-20" />
              <USkeleton class="h-7 w-10" />
            </div>
          </div>
        </Transition>
      </div>
    </UCard>

    <UCard :ui="{ body: 'p-4 sm:p-5' }">
      <div class="relative">
        <Transition name="sk">
          <div v-if="!loading" key="content" class="flex items-center gap-4">
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center bg-brand-100 dark:bg-brand-900/20 flex-shrink-0"
            >
              <UIcon
                name="i-heroicons-banknotes"
                class="w-5 h-5 text-brand-500 dark:text-brand-400"
              />
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                مجموع خرید
              </p>
              <p class="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                {{ formatThousands(totalSpent) }}
              </p>
            </div>
          </div>
          <div v-else key="loading" class="flex items-center gap-4">
            <USkeleton class="w-11 h-11 rounded-xl flex-shrink-0" />
            <div class="space-y-2 flex-1">
              <USkeleton class="h-4 w-20" />
              <USkeleton class="h-7 w-28" />
            </div>
          </div>
        </Transition>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { useFormat } from '@/composables/useFormat'

defineProps({
  pendingCount: { type: Number, default: 0 },
  completedCount: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
})

const { formatCount, formatThousands } = useFormat()
</script>
