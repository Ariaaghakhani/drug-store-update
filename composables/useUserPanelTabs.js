// composables/useUserPanelTabs.js
import { PANEL_MENUS, FALLBACK_MENUS_BY_ROLE } from '~/utils/panelMenus.js'

const menuByKey = new Map(PANEL_MENUS.map((menu) => [menu.key, menu]))

// Registry entry + optional overrides; `id` mirrors `key` for the panel.vue templates.
const buildItem = (key, overrides = {}) => {
  const base = menuByKey.get(key)
  if (!base) return null
  const item = { ...base, id: key }
  for (const [field, value] of Object.entries(overrides)) {
    if (value !== undefined && value !== null) item[field] = value
  }
  return item
}

export const useUserPanelTabs = () => {
  const userStore = useUserStore()
  const { profile: storeProfile } = useStoreProfile()

  // Menus tied to a store feature flag are hidden until the flag is known to be on
  const isFlagOn = (item, ignoreFlags = false) => ignoreFlags || !item.flag || Boolean(storeProfile.value?.[item.flag])

  // Get user role
  const getUserRole = () => {
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
    return ['customer', 'admin', 'owner'].includes(role) ? role : 'admin'
  }

  // Staff menus derived from BACK's grants (userStore.permissions = `[{module, action}]`, allowed only): a registry menu
  // shows when the user holds READ on any of its `modules`; `always` menus (profile) show for everyone. Customers always
  // use the fallback list, and so does a staff user whose permissions are missing/empty/match nothing.
  const getPermissionRoutes = (ignoreFlags = false) => {
    if (getUserRole() === 'customer') return null
    const granted = userStore.permissions
    if (!Array.isArray(granted) || granted.length === 0) return null

    const readable = new Set(granted.filter((p) => p.action === 'READ').map((p) => p.module))
    const items = PANEL_MENUS.filter(
      (menu) => menu.always || menu.modules?.some((module) => readable.has(module))
    )
      .map((menu) => buildItem(menu.key))
      .filter((item) => item && isFlagOn(item, ignoreFlags))

    return items.length > 1 ? items : null
  }

  // Role-based lists, used until/unless BACK's menus endpoint answers with something usable.
  const getFallbackRoutes = (ignoreFlags = false) => {
    const entries = FALLBACK_MENUS_BY_ROLE[getUserRole()] ?? FALLBACK_MENUS_BY_ROLE.customer
    return entries
      .map(({ key, ...overrides }) => buildItem(key, overrides))
      .filter((item) => item && isFlagOn(item, ignoreFlags))
  }

  // Get routes for current user
  // `ignoreFlags` is for route access: the store profile loads async, so a hard reload on /panel/wallet must not be
  // bounced before the flag is known (the page itself shows its own "disabled" state)
  const getRoutesForRole = (ignoreFlags = false) =>
    getPermissionRoutes(ignoreFlags) ?? getFallbackRoutes(ignoreFlags)

  // Get all menu items
  const getMenuItems = () => getRoutesForRole()

  // Check if user has access to a route
  const hasAccessToRoute = (path) => {
    const routes = getRoutesForRole(true)
    // Match the exact route or any nested detail route (e.g. /panel/products/5)
    return routes.some((item) => item.to === path || path.startsWith(`${item.to}/`))
  }

  // Get all accessible route paths for current user
  const getAccessiblePaths = () => getRoutesForRole(true).map((item) => item.to)

  // Re-fetch the user's grants from BACK. Any failure just clears the cache so the role-based fallback applies; it never
  // throws. Customers skip the call (their menu is static).
  const refreshMenus = async () => {
    if (getUserRole() === 'customer') {
      userStore.setPermissions(null)
      return
    }
    try {
      const { $api } = useNuxtApp()
      const response = await $api.auth.getMyPermissions({ data: { allowed: true, actions: ['READ'] } })
      const rows = response.data.data ?? []
      const seen = new Set()
      userStore.setPermissions(
        rows
          .filter((row) => row.allowed !== false)
          .map((row) => ({ module: row.module, action: row.action }))
          .filter((row) => !seen.has(row.module + row.action) && seen.add(row.module + row.action))
      )
    } catch {
      userStore.setPermissions(null)
    }
  }

  return {
    getUserRole,
    getRoutesForRole,
    getMenuItems,
    hasAccessToRoute,
    getAccessiblePaths,
    refreshMenus,
  }
}
