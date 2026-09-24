<template>
  <div class="flex flex-wrap gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
    <UInput
      :model-value="searchQuery"
      placeholder="جستجو نام یا برند..."
      icon="i-heroicons-magnifying-glass"
      class="flex-1 min-w-52"
      @update:model-value="(v) => emit('update:searchQuery', v)"
    />
    <USelect
      :model-value="categoryFilter"
      :items="categoryItems"
      class="w-48"
      @update:model-value="(v) => emit('update:categoryFilter', v)"
    />
  </div>
</template>

<script setup>
defineProps({
  searchQuery: { type: String, required: true },
  categoryFilter: { type: String, required: true },
  categoryItems: { type: Array, required: true },
})

const emit = defineEmits(['update:searchQuery', 'update:categoryFilter'])
</script>