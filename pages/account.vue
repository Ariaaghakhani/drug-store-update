<template>
  <UContainer>
    <div class="py-12">
      <div class="max-w-4xl mx-auto">
        <!-- Page Header -->
        <div class="mb-12">
          <h1
            class="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4"
          >
            حساب <span class="text-brand-500">کاربری</span>
          </h1>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Sidebar Menu -->
          <div class="lg:col-span-1">
            <UCard>
              <nav class="space-y-2">
                <button
                  v-for="item in menuItems"
                  :key="item.id"
                  :class="[
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors',
                    activeTab === item.id
                      ? 'bg-brand-500 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
                  ]"
                  @click="activeTab = item.id"
                >
                  <UIcon :name="item.icon" class="w-5 h-5" />
                  <span class="font-medium">{{ item.label }}</span>
                </button>
              </nav>
            </UCard>
          </div>

          <!-- Content Area -->
          <div class="lg:col-span-2">
            <!-- Profile Tab -->
            <UCard v-if="activeTab === 'profile'">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                اطلاعات شخصی
              </h2>
              <div class="space-y-6">
                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      نام
                    </label>
                    <UInput placeholder="نام خود را وارد کنید" size="lg" />
                  </div>
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      نام خانوادگی
                    </label>
                    <UInput
                      placeholder="نام خانوادگی خود را وارد کنید"
                      size="lg"
                    />
                  </div>
                </div>
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    ایمیل
                  </label>
                  <UInput
                    type="email"
                    placeholder="example@email.com"
                    size="lg"
                  />
                </div>
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    شماره تلفن
                  </label>
                  <UInput placeholder="۰۹۱۲۳۴۵۶۷۸۹" size="lg" />
                </div>
                <UButton size="lg" color="primary"> ذخیره تغییرات </UButton>
              </div>
            </UCard>

            <!-- Orders Tab -->
            <UCard v-if="activeTab === 'orders'">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                سفارش‌های من
              </h2>
              <div class="space-y-4">
                <div
                  v-for="order in orders"
                  :key="order.id"
                  class="border border-gray-200 dark:border-gray-800 rounded-lg p-6"
                >
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <div class="font-bold text-gray-900 dark:text-white">
                        سفارش #{{ order.id }}
                      </div>
                      <div
                        class="text-sm text-gray-500 dark:text-gray-400 mt-1"
                      >
                        {{ order.date }}
                      </div>
                    </div>
                    <UBadge
                      :color="order.status === 'delivered' ? 'green' : 'blue'"
                    >
                      {{ getStatusLabel(order.status) }}
                    </UBadge>
                  </div>
                  <div class="space-y-2 mb-4">
                    <div
                      v-for="item in order.items"
                      :key="item"
                      class="text-sm text-gray-600 dark:text-gray-400"
                    >
                      • {{ item }}
                    </div>
                  </div>
                  <div
                    class="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-800"
                  >
                    <div class="font-bold text-brand-500">
                      {{ order.total.toLocaleString('fa-IR') }} تومان
                    </div>
                    <UButton size="sm" variant="outline">
                      جزئیات سفارش
                    </UButton>
                  </div>
                </div>
              </div>
            </UCard>

            <!-- Addresses Tab -->
            <UCard v-if="activeTab === 'address'">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  آدرس‌های من
                </h2>
                <UButton color="primary" icon="i-heroicons-plus">
                  آدرس جدید
                </UButton>
              </div>
              <div class="space-y-4">
                <UCard v-for="address in addresses" :key="address.id">
                  <div class="flex justify-between items-start">
                    <div>
                      <div class="font-bold text-gray-900 dark:text-white mb-2">
                        {{ address.title }}
                      </div>
                      <p class="text-gray-600 dark:text-gray-400 mb-2">
                        {{ address.address }}
                      </p>
                      <p class="text-sm text-gray-500">
                        {{ address.phone }}
                      </p>
                    </div>
                    <div class="flex gap-2">
                      <UButton
                        size="sm"
                        variant="ghost"
                        icon="i-heroicons-pencil"
                        square
                      />
                      <UButton
                        size="sm"
                        variant="ghost"
                        icon="i-heroicons-trash"
                        color="red"
                        square
                      />
                    </div>
                  </div>
                </UCard>
              </div>
            </UCard>

            <!-- Prescriptions Tab -->
            <UCard v-if="activeTab === 'prescriptions'">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  نسخه‌های من
                </h2>
                <UButton color="primary" icon="i-heroicons-plus">
                  آپلود نسخه
                </UButton>
              </div>
              <div class="text-center py-12">
                <UIcon
                  name="i-heroicons-document-text"
                  class="w-20 h-20 text-gray-300 mx-auto mb-4"
                />
                <p class="text-gray-600 dark:text-gray-400">
                  نسخه‌ای آپلود نشده است
                </p>
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AccountPage',

  data() {
    return {
      activeTab: 'profile',
      menuItems: [
        { id: 'profile', label: 'اطلاعات شخصی', icon: 'i-heroicons-user' },
        { id: 'orders', label: 'سفارش‌ها', icon: 'i-heroicons-shopping-bag' },
        { id: 'addresses', label: 'آدرس‌ها', icon: 'i-heroicons-map-pin' },
        {
          id: 'prescriptions',
          label: 'نسخه‌ها',
          icon: 'i-heroicons-document-text',
        },
      ],
      orders: [
        {
          id: '۱۰۲۳',
          date: '۱۴۰۳/۰۷/۲۵',
          status: 'delivered',
          items: ['ویتامین D3', 'امگا-۳'],
          total: 328000,
        },
        {
          id: '۱۰۲۲',
          date: '۱۴۰۳/۰۷/۲۰',
          status: 'processing',
          items: ['ایبوپروفن', 'مولتی ویتامین'],
          total: 244900,
        },
      ],
      addresses: [
        {
          id: '1',
          title: 'منزل',
          address: 'تهران، خیابان ولیعصر، پلاک ۱۲۳',
          phone: '۰۹۱۲۳۴۵۶۷۸۹',
        },
      ],
    }
  },

  head() {
    return {
      title: 'حساب کاربری | داروخانه آنلاین',
    }
  },

  methods: {
    getStatusLabel(status: string): string {
      const labels: Record<string, string> = {
        delivered: 'تحویل داده شده',
        processing: 'در حال پردازش',
        shipped: 'ارسال شده',
      }
      return labels[status] || status
    },
  },
})
</script>
