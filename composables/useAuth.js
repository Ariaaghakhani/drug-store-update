export const useAuth = () => {
  const nuxtApp = useNuxtApp()

  const isAuthenticated = () => {
    // Check for token synchronously to avoid race condition on page refresh
    if (process.client) {
      const token = localStorage.getItem('auth.local')
      return !!token
    }
    return false
  }

  const login = (token) => {
    if (nuxtApp.$auth) {
      nuxtApp.$auth.setToken(token)
    }
  }

  const logout = () => {
    if (nuxtApp.$auth) {
      nuxtApp.$auth.reset()
    }
  }

  return {
    isAuthenticated,
    login,
    logout,
  }
}
