<!-- pages/panel/orders.vue -->
<template>
  <UCard>
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">
        سفارشات من
      </h3>
      <UButton variant="soft" size="sm" icon="i-heroicons-funnel">
        فیلتر
      </UButton>
    </div>

    <div class="text-center py-16">
      <div
        class="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4"
      >
        <UIcon
          name="i-heroicons-shopping-bag"
          class="w-12 h-12 text-gray-400 dark:text-gray-600"
        />
      </div>
      <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        هنوز سفارشی ثبت نشده است
      </h4>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        شما می‌توانید از فروشگاه ما خرید کنید
      </p>
      <UButton to="/products" icon="i-heroicons-shopping-cart">
        مشاهده محصولات
      </UButton>
    </div>
  </UCard>
</template>

<script setup>
useHead({
  title: 'سفارشات | پنل کاربری',
})
</script>
