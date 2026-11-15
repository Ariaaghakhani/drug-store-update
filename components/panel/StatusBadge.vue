<!-- components/panel/StatusBadge.vue -->
<template>
  <UBadge :color="meta.color" variant="subtle" :size="size">{{ meta.label }}</UBadge>
</template>

<script setup>
// Status pill for a `{label, color}` meta object (from utils/enumMeta.js `metaOf`, or a feature's *Meta helper).
defineProps({
  meta: { type: Object, required: true },
  size: { type: String, default: 'xs' },
})
</script>
