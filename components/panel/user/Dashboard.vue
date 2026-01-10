<template>
  <div class="space-y-6">
    <!-- Stats Cards -->
    <div class="grid sm:grid-cols-3 gap-4">
      <UCard
        v-for="stat in stats"
        :key="stat.label"
        :ui="{ body: { padding: 'p-4 sm:p-5' } }"
      >
        <div class="flex items-center gap-4">
          <div
            :class="[
              'w-12 h-12 rounded-lg flex items-center justify-center',
              stat.color,
            ]"
          >
            <UIcon :name="stat.icon" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ stat.label }}
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ stat.value }}
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Quick Actions -->
    <UCard>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        دسترسی سریع
      </h3>
      <div class="grid sm:grid-cols-2 gap-3">
        <UButton
          v-for="action in quickActions"
          :key="action.label"
          :color="action.color"
          variant="soft"
          block
          :icon="action.icon"
          @click="$emit('change-tab', action.tab)"
        >
          {{ action.label }}
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup>
defineEmits(['change-tab'])

const stats = [
  {
    label: 'سفارشات',
    value: '0',
    icon: 'i-heroicons-shopping-bag',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  {
    label: 'در انتظار پرداخت',
    value: '0',
    icon: 'i-heroicons-clock',
    color:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  },
  {
    label: 'تکمیل شده',
    value: '0',
    icon: 'i-heroicons-check-circle',
    color:
      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  },
]

const quickActions = [
  {
    label: 'مشاهده سفارشات',
    icon: 'i-heroicons-shopping-bag',
    color: 'teal',
    tab: 'orders',
  },
  {
    label: 'ویرایش پروفایل',
    icon: 'i-heroicons-user',
    color: 'blue',
    tab: 'profile',
  },
  {
    label: 'مدیریت آدرس‌ها',
    icon: 'i-heroicons-map-pin',
    color: 'purple',
    tab: 'addresses',
  },
  {
    label: 'خرید محصولات',
    icon: 'i-heroicons-shopping-cart',
    color: 'green',
    tab: 'orders',
  },
]
</script>
