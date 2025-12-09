export const useAuth = () => {
  const isAuthenticated = () => {
    if (import.meta.client) {
      const auth = localStorage.getItem('auth')
      return auth === 'token'
    }
    return false
  }

  const login = (token) => {
    if (import.meta.client) {
      localStorage.setItem('auth', token)
    }
  }

  const logout = () => {
    if (import.meta.client) {
      localStorage.removeItem('auth')
    }
  }

  return {
    isAuthenticated,
    login,
    logout,
  }
}
