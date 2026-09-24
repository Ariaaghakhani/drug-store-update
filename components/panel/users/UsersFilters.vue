<template>
  <div class="flex flex-wrap gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
    <UInput
      :model-value="searchQuery"
      placeholder="جستجو نام یا شماره موبایل..."
      icon="i-heroicons-magnifying-glass"
      class="flex-1 min-w-52"
      @update:model-value="(v) => emit('update:searchQuery', v)"
    />
    <USelect
      :model-value="roleFilter"
      :items="roleFilterItems"
      class="w-40"
      @update:model-value="(v) => emit('update:roleFilter', v)"
    />
    <USelect
      :model-value="statusFilter"
      :items="statusFilterItems"
      class="w-40"
      @update:model-value="(v) => emit('update:statusFilter', v)"
    />
  </div>
</template>

<script setup>
defineProps({
  searchQuery: { type: String, required: true },
  roleFilter: { type: String, required: true },
  statusFilter: { type: String, required: true },
  roleFilterItems: { type: Array, required: true },
  statusFilterItems: { type: Array, required: true },
})

const emit = defineEmits(['update:searchQuery', 'update:roleFilter', 'update:statusFilter'])
</script>