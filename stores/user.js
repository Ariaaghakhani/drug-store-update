import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

// TEMPORARY: Remove this when backend /api/auth/me endpoint is ready
const USER_STORAGE_KEY = 'user.data'

export const useUserStore = defineStore('userStore', () => {
  // Helper to read from localStorage
  const readFromStorage = () => {
    if (!process.client) return null
    const stored = localStorage.getItem(USER_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  }

  // Initialize from localStorage
  const currentUser = ref(readFromStorage())

  // Watch for storage events (when localStorage changes in other tabs/windows)
  if (process.client) {
    window.addEventListener('storage', (event) => {
      if (event.key === USER_STORAGE_KEY) {
        console.log('[UserStore] localStorage changed externally, syncing...')
        currentUser.value = event.newValue ? JSON.parse(event.newValue) : null
      }
    })

    // Poll localStorage every 500ms to detect changes (for same-tab updates)
    setInterval(() => {
      const stored = readFromStorage()
      const currentStringified = currentUser.value ? JSON.stringify(currentUser.value) : null
      const storedStringified = stored ? JSON.stringify(stored) : null

      if (currentStringified !== storedStringified) {
        console.log('[UserStore] localStorage changed, syncing from storage')
        currentUser.value = stored
      }
    }, 500)
  }

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
