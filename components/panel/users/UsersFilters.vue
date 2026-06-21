<template>
  <div class="flex flex-wrap gap-3 py-4 border-b border-gray-100 dark:border-gray-800">
    <UInput
      :model-value="searchQuery"
      placeholder="جستجو نام یا شماره موبایل..."
      icon="i-heroicons-magnifying-glass"
      class="flex-1 min-w-52"
      @update:model-value="(v: string) => emit('update:searchQuery', v)"
    />
    <USelect
      :model-value="roleFilter"
      :items="roleFilterItems"
      class="w-40"
      @update:model-value="(v: string) => emit('update:roleFilter', v)"
    />
    <USelect
      :model-value="statusFilter"
      :items="statusFilterItems"
      class="w-40"
      @update:model-value="(v: string) => emit('update:statusFilter', v)"
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
  roleFilter: string
  statusFilter: string
  roleFilterItems: SelectItem[]
  statusFilterItems: SelectItem[]
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:roleFilter': [value: string]
  'update:statusFilter': [value: string]
}>()
</script>