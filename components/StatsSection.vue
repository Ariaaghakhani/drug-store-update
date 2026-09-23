<template>
  <section class="py-12">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
      <!-- Happy Customers -->
      <UCard class="hover:shadow-lg transition-shadow">
        <div class="text-center space-y-3 py-4">
          <div class="text-4xl lg:text-5xl font-black text-brand-500">
            {{ stats.customers }}
          </div>
          <div class="text-base text-gray-600 dark:text-gray-400 font-medium">
            {{ stats.customersLabel }}
          </div>
        </div>
      </UCard>

      <!-- Delivery Time -->
      <UCard class="hover:shadow-lg transition-shadow">
        <div class="text-center space-y-3 py-4">
          <div class="text-4xl lg:text-5xl font-black text-brand-500">
            {{ stats.deliveryTime }}
          </div>
          <div class="text-base text-gray-600 dark:text-gray-400 font-medium">
            {{ stats.deliveryLabel }}
          </div>
        </div>
      </UCard>

      <!-- Accuracy Rate -->
      <UCard class="hover:shadow-lg transition-shadow">
        <div class="text-center space-y-3 py-4">
          <div class="text-4xl lg:text-5xl font-black text-brand-500">
            {{ stats.accuracyRate }}
          </div>
          <div class="text-base text-gray-600 dark:text-gray-400 font-medium">
            {{ stats.accuracyLabel }}
          </div>
        </div>
      </UCard>
    </div>

    <!-- Next Delivery Info -->
    <div
      class="mt-8 p-6 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      <div class="flex items-center gap-4">
        <div
          class="w-14 h-14 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0"
        >
          <UIcon name="i-heroicons-truck" class="w-7 h-7 text-white" />
        </div>
        <div>
          <div class="font-bold text-gray-900 dark:text-white text-lg">
            ارسال بعدی
          </div>
          <div class="text-gray-600 dark:text-gray-400">امروز، ساعت ۱۴:۰۰</div>
        </div>
      </div>
      <UButton size="lg" color="primary" variant="soft"> پیگیری سفارش </UButton>
    </div>
  </section>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'StatsSection',

  data() {
    return {
      stats: {
        customers: '۵۰,۰۰۰+',
        customersLabel: 'مشتری راضی',
        deliveryTime: '۲۴ ساعت',
        deliveryLabel: 'زمان تحویل',
        accuracyRate: '۹۹.۹٪',
        accuracyLabel: 'دقت سفارش',
      },
    }
  },
})
</script>
