// utils/auth.js
export const logoutAndResetAuthentication = async (nuxtApp, options = {}) => {
  const { callLogout = true } = options

  try {
    if (callLogout) {
      // Call backend logout endpoint if needed
      await nuxtApp.$api.auth.logout()
    }
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    // Clear all auth data
    if (nuxtApp.$auth) {
      nuxtApp.$auth.reset()
    }

    // Clear localStorage
    localStorage.removeItem('auth.local')

    // Clear any other auth-related data
    // e.g., remove cookies if you're managing any client-side
  }
}
