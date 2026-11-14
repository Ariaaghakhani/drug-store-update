<!-- pages/panel.vue -->
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <UContainer class="lg:py-8 py-4 pb-28 lg:pb-8">
      <ClientOnly>
        <div v-if="userStore.currentUser || isDev">
          <div class="grid lg:grid-cols-4 gap-6">
            <!-- Desktop Sidebar -->
            <aside
              class="hidden lg:block lg:col-span-1 sticky top-8 self-start"
            >
              <UCard class="flex flex-col">
                <!-- Logo & Brand -->
                <div
                  class="pb-6 border-b border-gray-200 dark:border-gray-700"
                >
                  <!-- same as the storefront Header: the logo goes to the home page -->
                  <NuxtLink to="/" aria-label="صفحه اصلی" class="inline-flex rounded-lg">
                    <BrandLogo />
                  </NuxtLink>
                </div>

                <!-- Navigation Menu -->
                <nav class="space-y-1 pt-6 flex-1">
                  <template v-for="(item, index) in menuItems" :key="item.id">
                    <p
                      v-if="item.group && item.group !== menuItems[index - 1]?.group"
                      class="px-4 pt-4 pb-1 text-xs font-medium text-gray-400 dark:text-gray-500"
                    >
                      {{ GROUP_LABELS[item.group] }}
                    </p>
                    <div
                      v-else-if="!item.group && menuItems[index - 1]?.group"
                      class="my-3 border-t border-gray-200 dark:border-gray-700"
                    />
                    <NuxtLink
                      :to="item.to"
                      class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      active-class="!bg-teal-50 dark:!bg-teal-900/20 !text-teal-600 dark:!text-teal-400 font-medium"
                    >
                      <UIcon :name="item.icon" class="w-5 h-5 flex-shrink-0" />
                      <span>{{ item.label }}</span>
                      <UBadge
                        v-if="item.badge !== undefined"
                        color="neutral"
                        variant="subtle"
                        size="xs"
                        class="mr-auto"
                      >
                        {{ item.badge }}
                      </UBadge>
                    </NuxtLink>
                  </template>
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
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
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
                    <span>{{
                      colorMode === 'dark' ? 'حالت روز' : 'حالت شب'
                    }}</span>
                  </button>
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
            <main class="lg:col-span-3 space-y-6">
              <!-- Profile Banner -->
              <UCard class="hidden md:block">
                <div class="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                  <!-- Photo + name open the account menu -->
                  <div class="flex-1 min-w-0">
                    <UDropdownMenu
                      dir="rtl"
                      :items="accountMenuItems"
                      :content="{ align: 'start' }"
                      :ui="{ content: 'font-dana w-64' }"
                    >
                      <button
                        type="button"
                        aria-label="منوی حساب کاربری"
                        class="group flex items-center gap-4 max-w-full rounded-xl p-1 -m-1 text-start hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                      >
                        <span
                          class="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full overflow-hidden flex items-center justify-center shadow-md flex-shrink-0"
                        >
                          <img v-if="avatar.url.value" :src="avatar.url.value" alt="" class="w-full h-full object-cover" />
                          <span v-else class="text-xl font-bold text-white">{{ userInitials }}</span>
                        </span>
                        <span class="min-w-0">
                          <span class="block text-base font-black text-gray-900 dark:text-white">
                            سلام،
                            <span class="text-brand-500 dark:text-brand-400">{{ userFullName }}</span>
                          </span>
                          <span class="block text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {{ roleLabel }}
                          </span>
                        </span>
                        <UIcon
                          name="i-heroicons-chevron-down"
                          class="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform group-data-[state=open]:rotate-180"
                        />
                      </button>

                      <template #account>
                        <div class="flex items-center gap-3 w-full py-1">
                          <span
                            class="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                          >
                            <img v-if="avatar.url.value" :src="avatar.url.value" alt="" class="w-full h-full object-cover" />
                            <span v-else class="text-sm font-bold text-white">{{ userInitials }}</span>
                          </span>
                          <span class="min-w-0 text-start">
                            <span class="block text-sm font-bold text-gray-900 dark:text-white truncate">{{ userFullName }}</span>
                            <span class="block text-xs font-normal text-gray-500 dark:text-gray-400">{{ roleLabel }}</span>
                          </span>
                        </div>
                      </template>
                    </UDropdownMenu>
                    <input
                      ref="avatarInput"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      class="hidden"
                      @change="onAvatarPicked"
                    />
                  </div>
                  <div class="flex-shrink-0 text-end">
                    <p class="text-xl font-black text-gray-900 dark:text-white leading-tight">
                      {{ todayWeekday }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {{ todayDate }}
                    </p>
                  </div>
                  <NotificationBell class="flex-shrink-0" />
                </div>
              </UCard>

              <NuxtPage class="h-full" />
            </main>
          </div>
        </div>
      </ClientOnly>
    </UContainer>

    <!-- Mobile Bottom Navigation -->
    <ClientOnly>
      <div v-if="userStore.currentUser || isDev" class="lg:hidden">
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
              <NuxtLink
                to="/panel/profile"
                aria-label="عکس پروفایل، رفتن به اطلاعات شخصی"
                class="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
              >
                <img v-if="avatar.url.value" :src="avatar.url.value" alt="" class="w-full h-full object-cover" />
                <span v-else class="text-base font-bold text-white">{{
                  userInitials
                }}</span>
              </NuxtLink>
              <div class="flex flex-1 min-w-0 flex-wrap *:w-full gap-y-2">
                <p class="font-semibold text-gray-900 dark:text-white truncate">
                  {{ userFullName }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{
                    userStore.currentUser?.username ||
                    userStore.currentUser?.person?.phoneNumber
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
                  color="neutral"
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

            <!-- Notifications -->
            <NuxtLink
              to="/panel/notifications"
              class="flex flex-col items-center gap-1 py-2 px-4 text-gray-500 dark:text-gray-400 transition-colors"
              active-class="!text-teal-600 dark:!text-teal-400"
            >
              <UChip :show="unreadCount > 0" color="error" size="md" inset>
                <UIcon name="i-heroicons-bell" class="w-6 h-6" />
              </UChip>
              <span class="text-[10px]">اعلان‌ها</span>
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
import NotificationBell from '@/components/panel/notifications/NotificationBell.vue'
import { GROUP_LABELS } from '~/utils/panelMenus.js'

const route = useRoute()
const userStore = useUserStore()
const isDev = import.meta.dev

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
const { getMenuItems, getUserRole, getRoleLabel, refreshMenus } = useUserPanelTabs()

// Keep the cached menus in sync with BACK (permissions can change between logins)
onMounted(refreshMenus)

// Unread count for the bell / bottom-nav badge; polled while the panel is open (push may be off or unreachable)
const notifications = useNotifications()
const push = usePushNotifications()
const unreadCount = computed(() => notifications.unread.value)
onMounted(() => {
  notifications.refreshUnread()
  notifications.startPolling()
})
onBeforeUnmount(notifications.stopPolling)

// Own photo in the header; photo + name open the account menu below
const avatar = useMyAvatar()
onMounted(avatar.load)

const avatarInput = ref(null)
const onAvatarPicked = (event) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (file) avatar.changeWithFeedback(file)
}

const roleLabel = computed(() => getRoleLabel())

// Groups render with separators; the first is the photo + name header (#account slot)
const accountMenuItems = computed(() => [
  [{ type: 'label', slot: 'account' }],
  [
    { label: 'داشبورد', icon: 'i-heroicons-rectangle-group', to: '/panel/dashboard' },
    {
      label: avatar.url.value ? 'تغییر عکس' : 'افزودن عکس',
      icon: 'i-heroicons-camera',
      onSelect: () => avatarInput.value?.click(),
    },
    ...(avatar.url.value
      ? [{ label: 'حذف عکس', icon: 'i-heroicons-trash', onSelect: avatar.removeWithFeedback }]
      : []),
  ],
  [
    { label: 'اطلاعات شخصی', icon: 'i-heroicons-user', to: '/panel/profile' },
    { label: 'رمز عبور و امنیت', icon: 'i-heroicons-shield-check', to: '/panel/security' },
  ],
  [{ label: 'خروج از حساب', icon: 'i-heroicons-arrow-right-on-rectangle', color: 'error', onSelect: handleLogout }],
])

// Open workflow tasks (mine + claimable) for the «کارتابل» menu badge; same polling pattern, staff with WORKFLOW_TASK only
const workflowTasks = useWorkflowTaskCount()
onMounted(() => {
  workflowTasks.refresh()
  workflowTasks.start()
})
onBeforeUnmount(workflowTasks.stop)
// The user can load after the panel mounts (hard reload): count as soon as it is known
watch(() => userStore.currentUser?.id, () => workflowTasks.refresh())

// Computed
const userFullName = computed(() => {
  const user = userStore.currentUser || app.$auth.user
  if (!user?.person) return 'دوست عزیز'
  return (
    `${user.person.firstName || ''} ${user.person.lastName || ''}`.trim() || 'دوست عزیز'
  )
})

const userInitials = computed(() => {
  const user = userStore.currentUser || app.$auth.user
  if (!user?.person) return 'ک'
  const first = user.person.firstName?.[0] || ''
  const last = user.person.lastName?.[0] || ''
  return (first + last).toUpperCase() || 'ک'
})


const todayWeekday = computed(() =>
  new Date().toLocaleDateString('fa-IR', { weekday: 'long' })
)

const todayDate = computed(() =>
  new Date().toLocaleDateString('fa-IR', { day: 'numeric', month: 'long', year: 'numeric' })
)

const userRole = computed(() => getUserRole())

const roleBadgeColor = computed(() => {
  const colors = {
    customer: 'blue',
    admin: 'purple',
    owner: 'orange',
  }
  return colors[userRole.value] || 'gray'
})

// The tasks entry carries the open count as a Persian-digit badge (undefined when there is nothing open)
const menuItems = computed(() => {
  const openTasks = (workflowTasks.count.value?.mine ?? 0) + (workflowTasks.count.value?.claimable ?? 0)
  return getMenuItems().map((item) =>
    item.key === 'tasks' && openTasks > 0 ? { ...item, badge: openTasks.toLocaleString('fa-IR') } : item
  )
})

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
    // Unregister this browser's push token while the access token is still valid
    await push.disable()
    // Revokes this device's refresh cookie; BACK identifies the session from the cookie, and a failure mustn't block logout
    await app.$api.auth.logout().catch(() => {})
    notifications.reset()
    avatar.reset()
    workflowTasks.reset()
    app.$auth.reset()
    toast.add({
      title: 'خروج موفق',
      description: 'شما با موفقیت از حساب کاربری خارج شدید',
      color: 'success',
    })
    await navigateTo('/')
  } catch (error) {
    console.error('Logout error:', error)
    toast.add({
      title: 'خطا',
      description: 'مشکلی در خروج از حساب پیش آمد',
      color: 'error',
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
