<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }" class="overflow-hidden">
    <iframe
      :src="location.embedUrl"
      :title="`نقشه ${location.name}`"
      class="w-full h-64 border-0"
      loading="lazy"
      referrerpolicy="no-referrer"
    />
    <div class="p-4 sm:p-5">
      <div class="flex items-center gap-2 mb-1">
        <UIcon name="i-heroicons-map-pin" class="w-5 text-brand-500 dark:text-brand-400" />
        <h2 class="text-base font-black text-gray-900 dark:text-white">{{ location.name }}</h2>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">برای مسیریابی یکی از برنامه‌های نقشه را انتخاب کنید.</p>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="item in location.directions"
          :key="item.key"
          :to="item.url"
          target="_blank"
          rel="noopener"
          color="neutral"
          variant="outline"
          icon="i-heroicons-map"
        >
          {{ item.label }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup>
import { STORE_LOCATION } from '@/utils/storeLocation.js'

const location = STORE_LOCATION
</script>
