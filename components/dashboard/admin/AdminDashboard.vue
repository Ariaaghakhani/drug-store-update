<template>
  <div class="space-y-4">
    <UCard :ui="{ body: 'p-5' }">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-100 dark:bg-brand-900/20">
          <UIcon
            name="i-heroicons-squares-2x2"
            class="w-5 h-5 text-brand-500 dark:text-brand-400"
          />
        </div>
        <div>
          <h1 class="text-lg font-black text-gray-900 dark:text-white">
            داشبورد <span class="text-brand-500">مدیر</span>
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            در حال توسعه
          </p>
        </div>
      </div>
    </UCard>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-100 dark:bg-amber-900/20">
            <UIcon name="i-heroicons-shopping-bag" class="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">صف سفارشات</p>
            <p class="text-sm text-gray-400 dark:text-gray-600 font-medium">TODO</p>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/20">
            <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">بررسی نسخه</p>
            <p class="text-sm text-gray-400 dark:text-gray-600 font-medium">TODO</p>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-red-100 dark:bg-red-900/20">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">هشدار موجودی</p>
            <p class="text-sm text-gray-400 dark:text-gray-600 font-medium">TODO</p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup>
</script>
