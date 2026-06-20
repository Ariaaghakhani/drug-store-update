<template>
  <div class="space-y-4">
    <UCard :ui="{ body: 'p-5' }">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-100 dark:bg-brand-900/20">
          <UIcon
            name="i-heroicons-chart-pie"
            class="w-5 h-5 text-brand-500 dark:text-brand-400"
          />
        </div>
        <div>
          <h1 class="text-lg font-black text-gray-900 dark:text-white">
            داشبورد <span class="text-brand-500">مالک</span>
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            در حال توسعه
          </p>
        </div>
      </div>
    </UCard>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-green-100 dark:bg-green-900/20">
            <UIcon name="i-heroicons-banknotes" class="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">درآمد</p>
            <p class="text-sm text-gray-400 dark:text-gray-600 font-medium">TODO</p>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/20">
            <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">روند فروش</p>
            <p class="text-sm text-gray-400 dark:text-gray-600 font-medium">TODO</p>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-brand-100 dark:bg-brand-900/20">
            <UIcon name="i-heroicons-cube" class="w-5 h-5 text-brand-500 dark:text-brand-400" />
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">پرفروش‌ترین</p>
            <p class="text-sm text-gray-400 dark:text-gray-600 font-medium">TODO</p>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/20">
            <UIcon name="i-heroicons-users" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">فعالیت کارکنان</p>
            <p class="text-sm text-gray-400 dark:text-gray-600 font-medium">TODO</p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup>
</script>
