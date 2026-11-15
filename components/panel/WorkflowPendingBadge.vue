<!-- components/panel/WorkflowPendingBadge.vue -->
<template>
  <UBadge v-if="state?.pending" color="warning" variant="subtle">
    <UIcon name="i-heroicons-clock" class="w-4 h-4" />
    {{ label }}
  </UBadge>
</template>

<script setup>
// Shown on an entity whose write is waiting for a workflow approval (`workflow.pending` in the DTO).
const props = defineProps({
  state: { type: Object, default: null },
})

const label = computed(() => {
  const steps = props.state?.activeSteps
  return steps?.length ? `در انتظار تأیید: ${steps.join('، ')}` : 'در انتظار تأیید'
})
</script>
