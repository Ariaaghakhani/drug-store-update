import { reactive, ref, readonly } from 'vue'
import { navigateTo } from '#app'
import { logoutAndResetAuthentication } from '~/utils/auth.js'
import { useUserStore } from '~/stores/user.js'

export const tokenLocalStorageKey = 'auth.local'
export const cachedToken = ref(null)

export default defineNuxtPlugin(async (nuxtApp) => {
  const _user = ref(null)
  const _loggedIn = ref(false)
  cachedToken.value = localStorage.getItem(tokenLocalStorageKey)
  const userStore = useUserStore()

  const initializeAuthorizedSession = () => {
    console.log('[Auth Plugin] initializeAuthorizedSession called')
    _loggedIn.value = true
  }

  const terminateAuthorizedSession = () => {
    console.log('[Auth Plugin] terminateAuthorizedSession called')
    console.trace('[Auth Plugin] Stack trace for terminateAuthorizedSession')
    _loggedIn.value = false
    _user.value = null
    localStorage.removeItem(tokenLocalStorageKey)
    cachedToken.value = null
    userStore.clearUser()
  }

  // Watch for user changes
  watch(_user, (newVal, oldVal) => {
    console.log('[Auth Plugin] _user changed from:', oldVal, 'to:', newVal)
    if (newVal === null && oldVal !== null) {
      console.trace('[Auth Plugin] User was cleared! Stack trace:')
    }
  })

  const auth = reactive({
    user: readonly(_user),
    loggedIn: readonly(_loggedIn),
    setUser(userData) {
      _user.value = userData
      if (!userData) {
        userStore.clearUser()
        return
      }
      userStore.setUser(userData)
      return userData
    },
    setToken(token) {
      if (token) {
        const prefixedToken = `${token}`

        localStorage.setItem(tokenLocalStorageKey, prefixedToken)
        cachedToken.value = prefixedToken
        initializeAuthorizedSession(prefixedToken)
      } else {
        terminateAuthorizedSession()
      }
    },
    async fetchUser({ fetchFromRead = true } = {}) {
      try {
        const response = await nuxtApp.$api.auth.fetchUser({ fetchFromRead })
        console.log('[Auth Plugin] fetchUser response:', response.data)
        this.setUser(response.data)
        console.log('[Auth Plugin] User set in auth:', _user.value)
        console.log(
          '[Auth Plugin] User set in userStore:',
          userStore.currentUser
        )
      } catch (error) {
        console.error('[Auth Plugin] fetchUser error:', error)
        const responseCode = error?.response?.status
        if ([401, 403].includes(responseCode)) {
          logoutAndResetAuthentication(nuxtApp, {
            callLogout: true,
          })
        }
      }
    },
    reset() {
      this.setToken(null)
      navigateTo('/')
    },
  })

  nuxtApp.provide('auth', auth)

  const token = cachedToken.value
  console.log(
    '[Auth Plugin] Initializing with token:',
    token ? 'exists' : 'none'
  )
  if (token) {
    initializeAuthorizedSession(token)

    // TEMPORARY: Check if user is already in userStore from localStorage
    if (userStore.currentUser) {
      console.log(
        '[Auth Plugin] User loaded from localStorage (temporary until API endpoint is ready)'
      )
      _user.value = userStore.currentUser
    } else {
      // Try to fetch from API (will be available tomorrow)
      console.log('[Auth Plugin] Fetching user data...')
      // await auth.fetchUser()
    }
    console.log('[Auth Plugin] Initialization complete')
  }
})
