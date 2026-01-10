<!-- pages/panel.vue -->
<template>
  <UContainer class="py-8 lg:py-12">
    <ClientOnly>
      <div v-if="userStore.currentUser" class="grid lg:grid-cols-4 gap-6">
        <!-- Sidebar -->
        <aside class="lg:col-span-1">
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

              <h3 class="text-lg font-bold text-gray-900 dark:text-white mt-4">
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
              <button
                v-for="item in menuItems"
                :key="item.id"
                :class="[
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors',
                  item.id === 'logout'
                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : activeTab === item.id
                      ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                ]"
                @click="handleMenuClick(item)"
              >
                <UIcon :name="item.icon" class="w-5 h-5 flex-shrink-0" />
                <span>{{ item.label }}</span>
                <UBadge
                  v-if="item.badge !== undefined"
                  :color="activeTab === item.id ? 'teal' : 'gray'"
                  variant="subtle"
                  size="xs"
                  class="mr-auto"
                >
                  {{ item.badge }}
                </UBadge>
              </button>
            </nav>
          </UCard>
        </aside>

        <!-- Main Content -->
        <main class="lg:col-span-3">
          <!-- Debug info (remove after fixing) -->
          <div
            v-if="false"
            class="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded"
          >
            <p>Active Tab: {{ activeTab }}</p>
            <p>Current Component: {{ currentTabComponent }}</p>
            <p>User Role: {{ userRole }}</p>
            <p>
              Available Tabs: {{ availableTabs.map((t) => t.id).join(', ') }}
            </p>
          </div>

          <Transition name="fade" mode="out-in">
            <component
              :is="currentTabComponent"
              :key="activeTab"
              v-model="profileForm"
              :is-loading="isUpdating"
              @change-tab="handleTabChange"
              @submit="handleUpdateProfile"
              @reset="resetProfileForm"
            />
          </Transition>
        </main>
      </div>
    </ClientOnly>
  </UContainer>
</template>

<script setup>
definePageMeta({
  middleware: () => {
    if (import.meta.client) {
      const token = localStorage.getItem('auth.local')
      if (!token) {
        return navigateTo('/login?next=panel')
      }
    }
  },
})

const app = useNuxtApp()
const userStore = useUserStore()
const toast = useToast()
const { getTabsForRole, getMenuItems, getUserRole } = useUserPanelTabs()

// State
const activeTab = ref('dashboard')
const isUpdating = ref(false)
const profileForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
})

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

const availableTabs = computed(() => getTabsForRole())

const menuItems = computed(() => getMenuItems())

const currentTabComponent = computed(() => {
  const tab = availableTabs.value.find((t) => t.id === activeTab.value)
  console.log('Current tab:', activeTab.value, 'Component:', tab?.component)
  return tab?.component || 'PanelUserDashboard'
})

// Methods
const handleMenuClick = (item) => {
  if (item.isAction) {
    if (item.id === 'logout') {
      handleLogout()
    }
  } else {
    activeTab.value = item.id
  }
}

const handleTabChange = (tabId) => {
  activeTab.value = tabId
}

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

const loadUserData = () => {
  const user = userStore.currentUser || app.$auth.user
  if (user?.person) {
    profileForm.value = {
      firstName: user.person.firstName || '',
      lastName: user.person.lastName || '',
      email: user.email || '',
      phone: user.person.phoneNumber || '',
    }
  }
}

const resetProfileForm = () => {
  loadUserData()
}

const handleUpdateProfile = async (formData) => {
  isUpdating.value = true
  try {
    // Add your API call here to update profile
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.add({
      title: 'موفق',
      description: 'اطلاعات شما با موفقیت به‌روزرسانی شد',
      color: 'green',
    })
  } catch (error) {
    console.error('Update error:', error)
    toast.add({
      title: 'خطا',
      description: 'مشکلی در به‌روزرسانی اطلاعات پیش آمد',
      color: 'red',
    })
  } finally {
    isUpdating.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadUserData()
})

// SEO
useHead({
  title: 'پنل کاربری | داروخانه آنلاین',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>

<style scoped>
/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
