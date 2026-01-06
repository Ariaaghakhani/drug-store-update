import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('userStore', () => {
  const currentUser = ref(null)

  return {
    currentUser,
  }
})
