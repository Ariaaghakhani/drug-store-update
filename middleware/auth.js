export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    // Check for token synchronously to avoid race condition on page refresh
    const token = localStorage.getItem('auth.local')

    if (!token) {
      // Store the intended destination
      const intendedRoute = to.fullPath

      // Redirect to login page with return URL
      return navigateTo({
        path: '/login',
        query: { redirect: intendedRoute },
      })
    }
  }
})
