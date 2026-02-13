<!-- pages/panel.vue -->
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <UContainer class="lg:py-8 py-4 pb-28 lg:pb-8">
      <ClientOnly>
        <div v-if="userStore.currentUser">
          <div class="grid lg:grid-cols-4 gap-6">
            <!-- Desktop Sidebar -->
            <aside class="hidden lg:block lg:col-span-1">
              <UCard class="flex flex-col">
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
                <nav class="space-y-1 pt-6 flex-1">
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
                </nav>

                <!-- Quick Links + Logout (separated) -->
                <div
                  class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-1"
                >
                  <NuxtLink
                    to="/"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <UIcon
                      name="i-heroicons-home"
                      class="w-5 h-5 flex-shrink-0"
                    />
                    <span>صفحه اصلی</span>
                  </NuxtLink>
                  <NuxtLink
                    to="/medications"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <UIcon
                      name="i-heroicons-squares-2x2"
                      class="w-5 h-5 flex-shrink-0"
                    />
                    <span>محصولات</span>
                  </NuxtLink>
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
                </div>
              </UCard>
            </aside>

            <!-- Main Content -->
            <main class="lg:col-span-3">
              <NuxtPage class="h-full" />
            </main>
          </div>
        </div>
      </ClientOnly>
    </UContainer>

    <!-- Mobile Bottom Navigation -->
    <ClientOnly>
      <div v-if="userStore.currentUser" class="lg:hidden">
        <!-- Profile Slide-up Menu Backdrop -->
        <Transition name="fade">
          <div
            v-if="isProfileMenuOpen"
            class="fixed inset-0 z-40 bg-black/40 dark:bg-black/60"
            @click="isProfileMenuOpen = false"
          />
        </Transition>

        <!-- Profile Slide-up Menu -->
        <Transition name="slide-up">
          <div
            v-if="isProfileMenuOpen"
            dir="rtl"
            class="fixed bottom-16 inset-x-0 z-50 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl"
          >
            <!-- User Info -->
            <div
              class="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800"
            >
              <div
                class="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <span class="text-base font-bold text-white">{{
                  userInitials
                }}</span>
              </div>
              <div class="flex flex-1 min-w-0 flex-wrap *:w-full gap-y-2">
                <p class="font-semibold text-gray-900 dark:text-white truncate">
                  {{ userFullName }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{
                    userStore.currentUser.username ||
                    userStore.currentUser.person?.phoneNumber
                  }}
                </p>
              </div>
            </div>

            <!-- Menu Items -->
            <nav class="px-3 py-3 space-y-0.5">
              <NuxtLink
                v-for="item in menuItems"
                :key="item.id"
                :to="item.to"
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                active-class="!bg-teal-50 dark:!bg-teal-900/20 !text-teal-600 dark:!text-teal-400 font-medium"
                @click="isProfileMenuOpen = false"
              >
                <UIcon :name="item.icon" class="w-5 h-5 flex-shrink-0" />
                <span class="flex-1">{{ item.label }}</span>
                <UBadge
                  v-if="item.badge !== undefined"
                  color="gray"
                  variant="subtle"
                  size="xs"
                  >{{ item.badge }}</UBadge
                >
              </NuxtLink>
            </nav>

            <!-- Dark/Light + Logout -->
            <div
              class="pb-4 pt-1 border-t border-gray-100 dark:border-gray-800 mx-3 space-y-0.5"
            >
              <button
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                @click="toggleColorMode"
              >
                <UIcon
                  :name="
                    colorMode === 'dark'
                      ? 'i-heroicons-sun'
                      : 'i-heroicons-moon'
                  "
                  class="w-5 h-5 flex-shrink-0"
                />
                <span>{{ colorMode === 'dark' ? 'حالت روز' : 'حالت شب' }}</span>
              </button>
              <button
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                @click="handleLogout"
              >
                <UIcon
                  name="i-heroicons-arrow-right-on-rectangle"
                  class="w-5 h-5 flex-shrink-0"
                />
                <span>خروج از حساب</span>
              </button>
            </div>
          </div>
        </Transition>

        <!-- Bottom Bar -->
        <nav
          dir="rtl"
          class="fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-center justify-around h-16 px-4">
            <!-- Home -->
            <NuxtLink
              to="/"
              class="flex flex-col items-center gap-1 py-2 px-4 text-gray-500 dark:text-gray-400 transition-colors hover:text-teal-600 dark:hover:text-teal-400"
            >
              <UIcon name="i-heroicons-home" class="w-6 h-6" />
              <span class="text-[10px]">خانه</span>
            </NuxtLink>

            <!-- Products -->
            <NuxtLink
              to="/medications"
              class="flex flex-col items-center gap-1 py-2 px-4 text-gray-500 dark:text-gray-400 transition-colors"
              active-class="!text-teal-600 dark:!text-teal-400"
            >
              <UIcon name="i-heroicons-squares-2x2" class="w-6 h-6" />
              <span class="text-[10px]">محصولات</span>
            </NuxtLink>

            <!-- Profile (opens menu) -->
            <button
              class="flex flex-col items-center gap-1 py-2 px-4 transition-colors"
              :class="
                isProfileMenuOpen
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-gray-500 dark:text-gray-400'
              "
              @click="isProfileMenuOpen = !isProfileMenuOpen"
            >
              <UIcon name="i-heroicons-user-circle" class="w-6 h-6" />
              <span class="text-[10px]">پروفایل</span>
            </button>
          </div>
        </nav>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup>
const route = useRoute()
const userStore = useUserStore()

definePageMeta({
  layout: 'panel',
  middleware: (to) => {
    if (import.meta.client) {
      const token = localStorage.getItem('auth.local')
      if (!token) {
        return navigateTo('/login?next=panel')
      }

      if (to.path === '/panel' || to.path === '/panel/') {
        return navigateTo('/panel/dashboard')
      }

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

const _colorMode = useColorMode()
const colorMode = computed(() => _colorMode.value)
const toggleColorMode = () => {
  _colorMode.preference = _colorMode.value === 'dark' ? 'light' : 'dark'
}

const isProfileMenuOpen = ref(false)

// Close profile menu on route change
watch(
  () => route.path,
  () => {
    isProfileMenuOpen.value = false
  }
)

// Methods
const handleLogout = async () => {
  isProfileMenuOpen.value = false
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
/* Fade backdrop */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide-up menu */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
