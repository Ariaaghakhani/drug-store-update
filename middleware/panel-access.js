// middleware/panel-access.js
export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.dev) return

  // Only run on client side
  if (import.meta.server) return

  const userStore = useUserStore()
  const { hasAccessToRoute, getAccessiblePaths } = useUserPanelTabs()

  // Check authentication
  const token = localStorage.getItem('auth.local')
  if (!token) {
    return navigateTo('/login?next=' + to.path)
  }

  const { $authReady } = useNuxtApp()
  await $authReady

  if (!userStore.currentUser?.person?.id) {
    return navigateTo('/login?next=' + to.path)
  }

  if (to.path === '/panel' || to.path === '/panel/') {
    return navigateTo('/panel/dashboard')
  }

  if (import.meta.dev) return

  if (!hasAccessToRoute(to.path)) {
    console.log('Access denied to:', to.path)
    console.log('Accessible paths:', getAccessiblePaths())

    // Redirect to dashboard
    return navigateTo('/panel/dashboard')
  }
})
