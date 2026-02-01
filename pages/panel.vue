<!-- pages/panel.vue (Tabs Version - Simplified) -->
<template>
  <UContainer class="py-8 lg:py-12">
    <ClientOnly>
      <div v-if="userStore.currentUser">
        <!-- Mobile Tabs -->
        <div class="lg:hidden mb-6">
          <!-- User Info Card -->
          <!--          <UCard class="mb-4">-->
          <!--            <div class="flex items-center gap-3 py-2">-->
          <!--              <div-->
          <!--                class="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center"-->
          <!--              >-->
          <!--                <span class="text-lg font-bold text-white">{{-->
          <!--                  userInitials-->
          <!--                }}</span>-->
          <!--              </div>-->
          <!--              <div class="flex-1">-->
          <!--                <p class="font-semibold text-gray-900 dark:text-white">-->
          <!--                  {{ userFullName }}-->
          <!--                </p>-->
          <!--                <p class="text-xs text-gray-600 dark:text-gray-400">-->
          <!--                  {{-->
          <!--                    userStore.currentUser.email ||-->
          <!--                    userStore.currentUser.person?.phoneNumber-->
          <!--                  }}-->
          <!--                </p>-->
          <!--              </div>-->
          <!--              <UBadge :color="roleBadgeColor" variant="subtle">-->
          <!--                {{ roleLabel }}-->
          <!--              </UBadge>-->
          <!--            </div>-->
          <!--          </UCard>-->

          <!-- Horizontal Scrollable Tabs -->
          <div class="relative bg-white dark:bg-gray-900">
            <!-- Scroll Container -->
            <div
              ref="tabsContainer"
              class="flex gap-6 overflow-x-auto"
              style="scrollbar-width: none; -ms-overflow-style: none"
            >
              <NuxtLink
                v-for="item in menuItems"
                :key="item.id"
                :to="item.to"
                class="pb-3 pt-1 whitespace-nowrap text-sm transition-all flex-shrink-0 relative"
                active-class="text-teal-600 dark:text-teal-400 font-semibold border-teal-600 dark:border-teal-400 border-b-2"
                inactive-class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border-transparent"
              >
                <span>{{ item.label }}</span>
                <UBadge
                  v-if="item.badge !== undefined"
                  color="gray"
                  variant="subtle"
                  size="xs"
                  class="ml-1"
                >
                  {{ item.badge }}
                </UBadge>
              </NuxtLink>

              <!-- Logout Tab -->
              <button
                class="pb-3 pt-1 whitespace-nowrap text-sm transition-all flex-shrink-0 border-b-2 border-transparent text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                @click="handleLogout"
              >
                خروج
              </button>
            </div>
          </div>
        </div>

        <div class="grid lg:grid-cols-4 gap-6">
          <!-- Desktop Sidebar -->
          <aside class="hidden lg:block lg:col-span-1">
            <UCard>
              <!-- Profile Section -->
              <div
                class="text-center pb-6 border-b border-gray-200 dark:border-gray-700"
              >
                <div class="relative inline-block">
                  <div
                    class="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <span class="text-2xl font-bold text-white">
                      {{ userInitials }}
                    </span>
                  </div>
                  <div
                    class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"
                  />
                </div>

                <h3
                  class="text-lg font-bold text-gray-900 dark:text-white mt-4"
                >
                  {{ userFullName }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{
                    userStore.currentUser.email ||
                    userStore.currentUser.person?.phoneNumber
                  }}
                </p>

                <!-- Role Badge -->
                <UBadge :color="roleBadgeColor" variant="subtle" class="mt-2">
                  {{ roleLabel }}
                </UBadge>
              </div>

              <!-- Navigation Menu -->
              <nav class="space-y-1 pt-6">
                <NuxtLink
                  v-for="item in menuItems"
                  :key="item.id"
                  :to="item.to"
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  active-class="!bg-teal-50 dark:!bg-teal-900/20 !text-teal-600 dark:!text-teal-400 font-medium"
                >
                  <UIcon :name="item.icon" class="w-5 h-5 flex-shrink-0" />
                  <span>{{ item.label }}</span>
                  <UBadge
                    v-if="item.badge !== undefined"
                    color="gray"
                    variant="subtle"
                    size="xs"
                    class="mr-auto"
                  >
                    {{ item.badge }}
                  </UBadge>
                </NuxtLink>

                <!-- Logout Button -->
                <button
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  @click="handleLogout"
                >
                  <UIcon
                    name="i-heroicons-arrow-right-on-rectangle"
                    class="w-5 h-5 flex-shrink-0"
                  />
                  <span>خروج از حساب</span>
                </button>
              </nav>
            </UCard>
          </aside>

          <!-- Main Content -->
          <main class="lg:col-span-3">
            <NuxtPage />
          </main>
        </div>
      </div>
    </ClientOnly>
  </UContainer>
</template>

<script setup>
const route = useRoute()
const userStore = useUserStore()
const { hasAccessToRoute } = useUserPanelTabs()

definePageMeta({
  middleware: (to) => {
    if (import.meta.client) {
      // Check authentication
      const token = localStorage.getItem('auth.local')
      if (!token) {
        return navigateTo('/login?next=panel')
      }

      // If accessing /panel root, redirect to dashboard
      if (to.path === '/panel' || to.path === '/panel/') {
        return navigateTo('/panel/dashboard')
      }

      // Check if user has access to this specific route
      const { hasAccessToRoute } = useUserPanelTabs()
      if (!hasAccessToRoute(to.path)) {
        console.log('Access denied to:', to.path)
        return navigateTo('/panel/dashboard')
      }
    }
  },
})

const app = useNuxtApp()
const toast = useToast()
const { getMenuItems, getUserRole } = useUserPanelTabs()

// Refs
const tabsContainer = ref(null)

// Computed
const userFullName = computed(() => {
  const user = userStore.currentUser || app.$auth.user
  if (!user?.person) return 'کاربر'
  return `${user.person.firstName} ${user.person.lastName}`.trim() || 'کاربر'
})

const userInitials = computed(() => {
  const user = userStore.currentUser || app.$auth.user
  if (!user?.person) return 'ک'
  const first = user.person.firstName?.[0] || ''
  const last = user.person.lastName?.[0] || ''
  return (first + last).toUpperCase() || 'ک'
})

const userRole = computed(() => getUserRole())

const roleLabel = computed(() => {
  const labels = {
    customer: 'مشتری',
    admin: 'مدیر',
    owner: 'مالک',
  }
  return labels[userRole.value] || 'کاربر'
})

const roleBadgeColor = computed(() => {
  const colors = {
    customer: 'blue',
    admin: 'purple',
    owner: 'orange',
  }
  return colors[userRole.value] || 'gray'
})

const menuItems = computed(() => getMenuItems())

// Auto-scroll to active tab on mount and route change
const scrollToActiveTab = () => {
  if (import.meta.client && tabsContainer.value) {
    nextTick(() => {
      const activeTab = tabsContainer.value?.querySelector(
        '.text-teal-600, .dark\\:text-teal-400'
      )
      if (activeTab) {
        activeTab.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        })
      }
    })
  }
}

watch(
  () => route.path,
  () => {
    scrollToActiveTab()
  }
)

onMounted(() => {
  scrollToActiveTab()
})

// Methods
const handleLogout = async () => {
  try {
    app.$auth.reset()
    toast.add({
      title: 'خروج موفق',
      description: 'شما با موفقیت از حساب کاربری خارج شدید',
      color: 'green',
    })
    await navigateTo('/')
  } catch (error) {
    console.error('Logout error:', error)
    toast.add({
      title: 'خطا',
      description: 'مشکلی در خروج از حساب پیش آمد',
      color: 'red',
    })
  }
}

// SEO
useHead({
  title: 'پنل کاربری | داروخانه آنلاین',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>

<style scoped>
/* Hide scrollbar but keep functionality */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
