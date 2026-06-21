<template>
  <div class="flex flex-wrap gap-3 py-4 border-b border-gray-100 dark:border-gray-800">
    <UInput
      :model-value="searchQuery"
      placeholder="جستجو نام یا برند..."
      icon="i-heroicons-magnifying-glass"
      class="flex-1 min-w-52"
      @update:model-value="(v: string) => emit('update:searchQuery', v)"
    />
    <USelect
      :model-value="categoryFilter"
      :items="categoryItems"
      class="w-48"
      @update:model-value="(v: string) => emit('update:categoryFilter', v)"
    />
  </div>
</template>

<script setup lang="ts">
interface SelectItem {
  label: string
  value: string
}

defineProps<{
  searchQuery: string
  categoryFilter: string
  categoryItems: SelectItem[]
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:categoryFilter': [value: string]
}>()
</script>