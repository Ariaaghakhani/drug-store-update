import { defineStore } from 'pinia'
import { ref } from 'vue'

// TEMPORARY: Remove this when backend /api/auth/me endpoint is ready
const USER_STORAGE_KEY = 'user.data'

export const useUserStore = defineStore('userStore', () => {
  // TEMPORARY: Initialize from localStorage until API endpoint is ready
  const storedUser = process.client ? localStorage.getItem(USER_STORAGE_KEY) : null
  const currentUser = ref(storedUser ? JSON.parse(storedUser) : null)

  const setUser = (user) => {
    currentUser.value = user
    // TEMPORARY: Persist to localStorage until API endpoint is ready
    if (process.client) {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    }
  }

  const clearUser = () => {
    currentUser.value = null
    // TEMPORARY: Clear from localStorage
    if (process.client) {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  }

  return {
    currentUser,
    setUser,
    clearUser,
  }
})
