<!-- components/panel/PanelSectionTabs.vue -->
<template>
  <nav class="flex flex-wrap gap-2" dir="rtl" aria-label="بخش‌ها">
    <NuxtLink
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      :aria-current="isActive(tab) ? 'page' : undefined"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
      :class="
        isActive(tab)
          ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      "
    >
      <UIcon v-if="tab.icon" :name="tab.icon" class="w-4 h-4" />
      {{ tab.label }}
    </NuxtLink>
  </nav>
</template>

<script setup>
// Horizontal section switcher for multi-page panel areas (e.g. the settings sub-pages). Active comes from the route.
defineProps({
  tabs: { type: Array, required: true },
})

const route = useRoute()

const isActive = (tab) => {
  const path = route.path
  return tab.exact ? path === tab.to : path === tab.to || path.startsWith(tab.to + '/')
}
</script>
