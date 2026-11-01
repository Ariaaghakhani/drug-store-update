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
      :model-value="activeFilter"
      :items="ACTIVE_ITEMS"
      class="w-36"
      @update:model-value="(v) => emit('update:activeFilter', v)"
    />
    <USelect
      :model-value="lockedFilter"
      :items="LOCKED_ITEMS"
      class="w-36"
      @update:model-value="(v) => emit('update:lockedFilter', v)"
    />
  </div>
</template>

<script setup>
defineProps({
  searchQuery: { type: String, required: true },
  activeFilter: { type: String, required: true },
  lockedFilter: { type: String, required: true },
})

const emit = defineEmits([
  'update:searchQuery',
  'update:activeFilter',
  'update:lockedFilter',
])

const ACTIVE_ITEMS = [
  { label: 'فعال و غیرفعال', value: 'all' },
  { label: 'فعال', value: 'true' },
  { label: 'غیرفعال', value: 'false' },
]
const LOCKED_ITEMS = [
  { label: 'قفل و بازشده', value: 'all' },
  { label: 'قفل‌شده', value: 'true' },
  { label: 'بدون قفل', value: 'false' },
]
</script>
