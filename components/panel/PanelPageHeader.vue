<!-- components/panel/PanelPageHeader.vue -->
<template>
  <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
    <div class="flex items-center gap-3 min-w-0">
      <div class="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0">
        <UIcon :name="icon" class="w-5 h-5 text-brand-500 dark:text-brand-400" />
      </div>
      <div class="min-w-0">
        <h1 class="text-lg font-black text-gray-900 dark:text-white">
          {{ title }}
          <span v-if="accent" class="text-brand-500 dark:text-brand-400">{{ accent }}</span>
        </h1>
        <p v-if="subtitle" class="text-xs text-gray-500 dark:text-gray-400">{{ subtitle }}</p>
      </div>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-2 ms-auto">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
// Panel page title row (DESIGN_SYSTEM "Admin page header"). `accent` is the brand-colored second word of the title.
defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  accent: { type: String, default: '' },
  subtitle: { type: String, default: '' },
})
</script>
