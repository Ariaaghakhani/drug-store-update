<template>
  <div>
    <div class="flex items-center gap-3 py-4">
      <div :class="['w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', address.isDefault ? 'bg-brand-500/15 text-brand-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400']">
        <UIcon :name="typeIcon" class="w-5 h-5" />
      </div>
      <p class="flex-1 text-sm font-medium text-gray-900 dark:text-white">{{ address.label }}</p>
      <UBadge v-if="address.isDefault" color="success" variant="subtle" size="md">پیش‌فرض</UBadge>
    </div>

    <div class="py-4 space-y-1.5">
      <p class="text-sm font-medium text-gray-900 dark:text-white">
        {{ address.province }}، {{ address.city }}<template v-if="address.district">، {{ address.district }}</template>
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ address.street }}</p>
    </div>

    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-3">
      <UButton
        v-if="!address.isDefault"
        color="primary"
        size="md"
        block
        class="sm:w-auto"
        @click="emit('set-default')"
      >
        تنظیم به عنوان پیش‌فرض
      </UButton>
      <span v-else class="hidden sm:block" />

      <div class="flex items-center gap-2">
        <UButton variant="soft" color="neutral" size="md" icon="i-heroicons-pencil-square" class="flex-1 sm:flex-none justify-center" @click="emit('edit')">
          ویرایش
        </UButton>
        <UButton variant="soft" color="error" size="md" icon="i-heroicons-trash" class="flex-1 sm:flex-none justify-center" :loading="deleting" @click="emit('delete')">
          حذف
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  address: Object,
  deleting: Boolean,
})

const emit = defineEmits(['edit', 'delete', 'set-default'])

const addressTypes = [
  { value: 'home', icon: 'i-heroicons-home' },
  { value: 'work', icon: 'i-heroicons-building-office' },
  { value: 'other', icon: 'i-heroicons-map-pin' },
]

const typeIcon = computed(
  () => addressTypes.find((t) => t.value === props.address.type)?.icon ?? 'i-heroicons-map-pin'
)
</script>
