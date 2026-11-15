<!-- components/panel/workflow/StepIssueList.vue -->
<template>
  <ul v-if="issues.length" class="space-y-1">
    <li
      v-for="(item, i) in issues"
      :key="i"
      class="flex items-start gap-1 text-xs"
      :class="item.level === 'error' ? 'text-error' : 'text-warning'"
    >
      <UIcon
        :name="item.level === 'error' ? 'i-heroicons-exclamation-circle' : 'i-heroicons-exclamation-triangle'"
        class="w-4 h-4 flex-shrink-0"
      />
      <span>{{ item.message }}</span>
    </li>
  </ul>
</template>

<script setup>
// The problems of one part of the step editor: errors (`text-error`, they block «تأیید») and warnings (`text-warning`, they do not).
// Props: `issues` (`[{level: 'error' | 'warning', message}]`, from `validateStep` in utils/workflowStep.js). Presentational.
defineProps({
  issues: { type: Array, default: () => [] },
})
</script>
