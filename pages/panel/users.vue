<!-- pages/panel/users.vue (Admin only) -->
<template>
  <UCard>
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">
        مدیریت کاربران
      </h3>
      <div class="flex gap-2">
        <UInput
          placeholder="جستجوی کاربر..."
          icon="i-heroicons-magnifying-glass"
          class="w-64"
        />
        <UButton icon="i-heroicons-plus"> افزودن کاربر </UButton>
      </div>
    </div>

    <div class="text-center py-16">
      <UIcon
        name="i-heroicons-users"
        class="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4"
      />
      <p class="text-gray-600 dark:text-gray-400">بخش مدیریت کاربران</p>
    </div>
  </UCard>
</template>

<script setup>
// Add middleware to check admin role
definePageMeta({
  middleware: (to, from) => {
    const userStore = useUserStore()
    const role = userStore.currentUser?.role
    if (role !== 'admin' && role !== 'owner') {
      return navigateTo('/panel')
    }
  },
})

useHead({
  title: 'مدیریت کاربران | پنل مدیریت',
})
</script>
