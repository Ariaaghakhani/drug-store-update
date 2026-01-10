<template>
  <div class="space-y-6">
    <!-- Admin Stats -->
    <div class="grid sm:grid-cols-4 gap-4">
      <UCard
        v-for="stat in adminStats"
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

    <!-- Admin Quick Actions -->
    <UCard>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        مدیریت سریع
      </h3>
      <div class="grid sm:grid-cols-3 gap-3">
        <UButton
          v-for="action in adminActions"
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

const adminStats = [
  {
    label: 'کل کاربران',
    value: '1,234',
    icon: 'i-heroicons-users',
    color:
      'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  },
  {
    label: 'سفارشات امروز',
    value: '45',
    icon: 'i-heroicons-shopping-bag',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  {
    label: 'محصولات',
    value: '567',
    icon: 'i-heroicons-cube',
    color:
      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  },
  {
    label: 'درآمد امروز',
    value: '12M تومان',
    icon: 'i-heroicons-banknotes',
    color:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  },
]

const adminActions = [
  {
    label: 'مدیریت کاربران',
    icon: 'i-heroicons-users',
    color: 'purple',
    tab: 'users',
  },
  {
    label: 'مدیریت محصولات',
    icon: 'i-heroicons-cube',
    color: 'blue',
    tab: 'products',
  },
  {
    label: 'گزارشات',
    icon: 'i-heroicons-chart-bar',
    color: 'green',
    tab: 'reports',
  },
]
</script>
