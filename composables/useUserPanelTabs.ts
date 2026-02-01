// composables/useUserPanelTabs.js
export const useUserPanelTabs = () => {
  const userStore = useUserStore()

  // Define routes for each role
  const roleBasedRoutes = {
    customer: [
      {
        id: 'dashboard',
        label: 'داشبورد',
        icon: 'i-heroicons-home',
        to: '/panel/dashboard',
      },
      {
        id: 'orders',
        label: 'سفارشات',
        icon: 'i-heroicons-shopping-bag',
        to: '/panel/orders',
        badge: 0,
      },
      {
        id: 'profile',
        label: 'اطلاعات شخصی',
        icon: 'i-heroicons-user',
        to: '/panel/profile',
      },
      {
        id: 'addresses',
        label: 'آدرس‌ها',
        icon: 'i-heroicons-map-pin',
        to: '/panel/addresses',
      },
    ],
    admin: [
      {
        id: 'dashboard',
        label: 'داشبورد مدیریت',
        icon: 'i-heroicons-home',
        to: '/panel/dashboard',
      },
      {
        id: 'users',
        label: 'مدیریت کاربران',
        icon: 'i-heroicons-users',
        to: '/panel/users',
      },
      {
        id: 'products',
        label: 'مدیریت محصولات',
        icon: 'i-heroicons-cube',
        to: '/panel/products',
      },
      {
        id: 'orders',
        label: 'مدیریت سفارشات',
        icon: 'i-heroicons-shopping-bag',
        to: '/panel/orders',
        badge: 5,
      },
      {
        id: 'reports',
        label: 'گزارشات',
        icon: 'i-heroicons-chart-bar',
        to: '/panel/reports',
      },
      {
        id: 'profile',
        label: 'اطلاعات شخصی',
        icon: 'i-heroicons-user',
        to: '/panel/profile',
      },
    ],
    owner: [
      {
        id: 'dashboard',
        label: 'داشبورد مدیریت',
        icon: 'i-heroicons-home',
        to: '/panel/dashboard',
      },
      {
        id: 'analytics',
        label: 'تحلیل و آمار',
        icon: 'i-heroicons-chart-pie',
        to: '/panel/analytics',
      },
      {
        id: 'users',
        label: 'مدیریت کاربران',
        icon: 'i-heroicons-users',
        to: '/panel/users',
      },
      {
        id: 'products',
        label: 'مدیریت محصولات',
        icon: 'i-heroicons-cube',
        to: '/panel/products',
      },
      {
        id: 'orders',
        label: 'مدیریت سفارشات',
        icon: 'i-heroicons-shopping-bag',
        to: '/panel/orders',
        badge: 5,
      },
      {
        id: 'finance',
        label: 'مالی',
        icon: 'i-heroicons-banknotes',
        to: '/panel/finance',
      },
      {
        id: 'settings',
        label: 'تنظیمات',
        icon: 'i-heroicons-cog-6-tooth',
        to: '/panel/settings',
      },
      {
        id: 'profile',
        label: 'اطلاعات شخصی',
        icon: 'i-heroicons-user',
        to: '/panel/profile',
      },
    ],
  }

  // Get user role
  const getUserRole = () => {
    const role = userStore.currentUser?.role
    const validRoles = ['customer', 'admin', 'owner']
    return validRoles.includes(role) ? role : 'customer'
  }

  // Get routes for current user role
  const getRoutesForRole = () => {
    const role = getUserRole()
    return roleBasedRoutes[role] || roleBasedRoutes.customer
  }

  // Get all menu items
  const getMenuItems = () => {
    return getRoutesForRole()
  }

  // Check if user has access to a route
  const hasAccessToRoute = (routePath) => {
    const routes = getRoutesForRole()
    return routes.some((route) => route.to === routePath)
  }

  // Get all accessible route paths for current user
  const getAccessiblePaths = () => {
    const routes = getRoutesForRole()
    return routes.map((route) => route.to)
  }

  return {
    getUserRole,
    getRoutesForRole,
    getMenuItems,
    hasAccessToRoute,
    getAccessiblePaths,
  }
}
