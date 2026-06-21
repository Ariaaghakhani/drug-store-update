<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <UCard v-for="metric in metrics" :key="metric.label" :ui="{ body: 'p-4' }">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          :class="metric.bgClass"
        >
          <UIcon :name="metric.icon" class="w-5 h-5" :class="metric.iconClass" />
        </div>
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ metric.label }}</p>
          <p class="text-xl font-black text-gray-900 dark:text-white leading-tight">
            {{ metric.value.toLocaleString('fa-IR') }}
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
interface Metric {
  label: string
  value: number
  icon: string
  bgClass: string
  iconClass: string
}

defineProps<{
  metrics: Metric[]
}>()
</script>