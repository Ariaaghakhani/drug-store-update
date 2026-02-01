// middleware/panel-access.js
export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side
  if (import.meta.server) return

  const userStore = useUserStore()
  const { hasAccessToRoute, getAccessiblePaths } = useUserPanelTabs()

  // Check authentication
  const token = localStorage.getItem('auth.local')
  if (!token) {
    return navigateTo('/login?next=' + to.path)
  }

  // If accessing /panel root, redirect to dashboard
  if (to.path === '/panel' || to.path === '/panel/') {
    return navigateTo('/panel/dashboard')
  }

  // Check if user has access to this specific route
  if (!hasAccessToRoute(to.path)) {
    // Log for debugging
    console.log('Access denied to:', to.path)
    console.log('Accessible paths:', getAccessiblePaths())

    // Redirect to dashboard
    return navigateTo('/panel/dashboard')
  }
})
