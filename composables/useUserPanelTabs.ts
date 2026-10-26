// composables/useUserPanelTabs.js (or .ts)

interface RouteItem {
  id: string
  label: string
  icon: string
  to: string
  badge?: number
}

type UserRole = 'customer' | 'admin' | 'owner'

export const useUserPanelTabs = () => {
  const userStore = useUserStore()

  // Define routes for each role
  const roleBasedRoutes: Record<UserRole, RouteItem[]> = {
    customer: [
      {
        id: 'dashboard',
        label: 'داشبورد',
        icon: 'i-heroicons-rectangle-group',
        to: '/panel/dashboard',
      },
      {
        id: 'orders',
        label: 'سفارشات',
        icon: 'i-heroicons-shopping-bag',
        to: '/panel/orders',
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
        to: '/panel/address',
      },
      {
        id: 'security',
        label: 'امنیت',
        icon: 'i-heroicons-shield-check',
        to: '/panel/security',
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
  const getUserRole = (): UserRole => {
    // BACK's real logged-in user shape (`UserDTO`/`TokenResponse.user`) has `roles: string[]`
    // (backend role names, e.g. `ROLE_STORE_ADMIN`/`ROLE_CUSTOMER`/a custom staff role name) —
    // there is no singular `role` field. `ROLE_STORE_ADMIN` is the tenant's full-access owner;
    // any other non-customer role is a lesser-privileged staff account, mapped to 'admin'.
    const roles = userStore.currentUser?.roles
    if (Array.isArray(roles) && roles.length > 0) {
      if (roles.includes('ROLE_STORE_ADMIN')) return 'owner'
      if (roles.includes('ROLE_CUSTOMER')) return 'customer'
      return 'admin'
    }

    // Legacy/mock fallback: some seed data still uses a singular `role` string directly.
    const role = userStore.currentUser?.role
    const validRoles: UserRole[] = ['customer', 'admin', 'owner']
    return validRoles.includes(role as UserRole) ? (role as UserRole) : 'admin'
  }

  // Get routes for current user role
  const getRoutesForRole = (): RouteItem[] => {
    const role = getUserRole()
    return roleBasedRoutes[role] || roleBasedRoutes.customer
  }

  // Get all menu items
  const getMenuItems = (): RouteItem[] => {
    return getRoutesForRole()
  }

  // Check if user has access to a route
  const hasAccessToRoute = (path: string): boolean => {
    const routes = getRoutesForRole()
    // Match the exact route or any nested detail route (e.g. /panel/products/5)
    return routes.some(
      (item) => item.to === path || path.startsWith(`${item.to}/`)
    )
  }

  // Get all accessible route paths for current user
  const getAccessiblePaths = (): string[] => {
    const routes = getRoutesForRole()
    return routes.map((item) => item.to)
  }

  return {
    getUserRole,
    getRoutesForRole,
    getMenuItems,
    hasAccessToRoute,
    getAccessiblePaths,
  }
}
