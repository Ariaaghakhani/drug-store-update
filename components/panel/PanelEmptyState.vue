<!-- components/panel/PanelEmptyState.vue -->
<template>
  <div class="text-center py-16">
    <div
      class="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4"
    >
      <UIcon :name="iconName" class="w-10 h-10 text-gray-400 dark:text-gray-600" />
    </div>
    <h4 class="text-base font-bold text-gray-900 dark:text-white mb-2">{{ title }}</h4>
    <p v-if="text" class="text-sm text-gray-500 dark:text-gray-400 mb-6">{{ text }}</p>
    <!-- A 403 has no action: retrying cannot grant access -->
    <div v-if="variant !== 'forbidden' && $slots.action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup>
// Empty, failed-load and forbidden states for panel lists (DESIGN_SYSTEM "Empty / loading / error states").
const DEFAULT_ICONS = {
  empty: 'i-heroicons-inbox',
  error: 'i-heroicons-exclamation-triangle',
  forbidden: 'i-heroicons-lock-closed',
}

const props = defineProps({
  icon: { type: String, default: '' },
  title: { type: String, required: true },
  text: { type: String, default: '' },
  variant: {
    type: String,
    default: 'empty',
    validator: (value) => ['empty', 'error', 'forbidden'].includes(value),
  },
})

const iconName = computed(() => props.icon || DEFAULT_ICONS[props.variant])
</script>
