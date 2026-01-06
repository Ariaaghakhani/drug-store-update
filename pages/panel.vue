<template>
  <UContainer>
    <ClientOnly class="py-12">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-12">
        <div>
          <h1
            class="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4"
          >
            پنل <span class="text-brand-500">کاربری</span>
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            مدیریت حساب کاربری و سفارشات
          </p>
        </div>
        <UButton color="red" variant="outline" @click="handleLogout">
          خروج از حساب کاربری
        </UButton>
      </div>

      <!-- User Profile Card -->
      <div v-if="userStore.currentUser" class="grid lg:grid-cols-3 gap-8">
        <!-- Profile Info -->
        <div class="lg:col-span-1">
          <UCard>
            <div class="text-center space-y-4">
              <div
                class="w-24 h-24 mx-auto bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center"
              >
                <UIcon
                  name="i-heroicons-user"
                  class="w-12 h-12 text-teal-600 dark:text-teal-400"
                />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                  {{ userFullName || 'کاربر' }} گرامی
                </h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  خوش آمدید
                </p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Quick Actions -->
        <div class="lg:col-span-2 space-y-4">
          <UCard>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
              دسترسی سریع
            </h3>
            <div class="grid md:grid-cols-2 gap-4">
              <NuxtLink
                to="/cart"
                class="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-400 transition-all"
              >
                <div
                  class="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center"
                >
                  <UIcon
                    name="i-heroicons-shopping-cart"
                    class="w-6 h-6 text-teal-600 dark:text-teal-400"
                  />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 dark:text-white">
                    سبد خرید
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    مشاهده سبد خرید
                  </p>
                </div>
              </NuxtLink>

              <NuxtLink
                to="/medications"
                class="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-400 transition-all"
              >
                <div
                  class="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center"
                >
                  <UIcon
                    name="i-heroicons-beaker"
                    class="w-6 h-6 text-teal-600 dark:text-teal-400"
                  />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 dark:text-white">
                    داروها
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    مشاهده محصولات
                  </p>
                </div>
              </NuxtLink>
            </div>
          </UCard>

          <!-- Orders Section -->
          <UCard>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
              سفارشات اخیر
            </h3>
            <div class="text-center py-12">
              <UIcon
                name="i-heroicons-shopping-bag"
                class="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4"
              />
              <p class="text-gray-600 dark:text-gray-400">
                شما هنوز سفارشی ثبت نکرده‌اید
              </p>
            </div>
          </UCard>
        </div>
      </div>
    </ClientOnly>
  </UContainer>
</template>

<script setup>
definePageMeta({
  middleware: () => {
    // Check for token synchronously to avoid race condition on page refresh
    if (process.client) {
      const token = localStorage.getItem('auth.local')
      if (!token) {
        return navigateTo('/login?next=panel')
      }
    }
  },
})
const app = useNuxtApp()
const userStore = useUserStore()

const userFullName = computed(
  () => app.$auth.user.person.firstName + ' ' + app.$auth.user.person.lastName
)
// Set page meta
useHead({
  title: 'پنل کاربری | داروخانه آنلاین',
})

// Logout handler
const handleLogout = async () => {
  try {
    app.$auth.reset()
    navigateTo('/')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>
