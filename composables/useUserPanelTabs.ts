// composables/useUserPanelTabs.ts
type UserRole = 'customer' | 'admin' | 'owner'

interface TabItem {
  id: string
  label: string
  icon: string
  component: string
  badge?: number
}

interface MenuItem extends TabItem {
  isAction?: boolean
}

export const useUserPanelTabs = () => {
  const userStore = useUserStore()

  // Define tabs for each role
  const roleBasedTabs: Record<UserRole, TabItem[]> = {
    customer: [
      {
        id: 'dashboard',
        label: 'داشبورد',
        icon: 'i-heroicons-home',
        component: 'PanelUserDashboard',
      },
      {
        id: 'orders',
        label: 'سفارشات',
        icon: 'i-heroicons-shopping-bag',
        component: 'PanelUserOrders',
        badge: 0,
      },
      {
        id: 'profile',
        label: 'اطلاعات شخصی',
        icon: 'i-heroicons-user',
        component: 'PanelUserProfile',
      },
      {
        id: 'addresses',
        label: 'آدرس‌ها',
        icon: 'i-heroicons-map-pin',
        component: 'PanelUserAddress',
      },
    ],
    admin: [
      {
        id: 'dashboard',
        label: 'داشبورد مدیریت',
        icon: 'i-heroicons-home',
        component: 'PanelAdminAdminDashboard',
      },
      {
        id: 'users',
        label: 'مدیریت کاربران',
        icon: 'i-heroicons-users',
        component: 'PanelAdminUsersManagement',
      },
      {
        id: 'orders',
        label: 'مدیریت سفارشات',
        icon: 'i-heroicons-shopping-bag',
        component: 'PanelAdminOrdersManagement',
        badge: 5,
      },
      {
        id: 'profile',
        label: 'اطلاعات شخصی',
        icon: 'i-heroicons-user',
        component: 'PanelUserProfile',
      },
    ],
    owner: [
      {
        id: 'dashboard',
        label: 'داشبورد مدیریت',
        icon: 'i-heroicons-home',
        component: 'PanelAdminAdminDashboard',
      },
      {
        id: 'users',
        label: 'مدیریت کاربران',
        icon: 'i-heroicons-users',
        component: 'PanelAdminUsersManagement',
      },
      {
        id: 'profile',
        label: 'اطلاعات شخصی',
        icon: 'i-heroicons-user',
        component: 'PanelUserProfile',
      },
    ],
  }

  // Get user role with proper typing
  const getUserRole = (): UserRole => {
    const role = userStore.currentUser?.role as UserRole | undefined
    return role && ['customer', 'admin', 'owner'].includes(role)
      ? role
      : 'customer'
  }

  // Get tabs for current user role
  const getTabsForRole = (): TabItem[] => {
    const role = getUserRole()
    return roleBasedTabs[role]
  }

  // Get all menu items including logout
  const getMenuItems = (): MenuItem[] => {
    const tabs = getTabsForRole()
    return [
      ...tabs,
      {
        id: 'logout',
        label: 'خروج از حساب',
        icon: 'i-heroicons-arrow-right-on-rectangle',
        component: '',
        isAction: true,
      },
    ]
  }

  return {
    getUserRole,
    getTabsForRole,
    getMenuItems,
  }
}
