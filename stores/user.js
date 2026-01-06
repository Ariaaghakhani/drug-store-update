import { defineStore } from 'pinia'
import { ref } from 'vue'

const USER_STORAGE_KEY = 'user.data'

export const useUserStore = defineStore('userStore', () => {
  // Initialize from localStorage if available
  const storedUser = process.client ? localStorage.getItem(USER_STORAGE_KEY) : null
  const currentUser = ref(storedUser ? JSON.parse(storedUser) : null)

  const setUser = (user) => {
    currentUser.value = user
    // Persist to localStorage
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
    // Clear from localStorage
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
