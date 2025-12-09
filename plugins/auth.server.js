export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('auth', {
    user: null,
    loggedIn: false,
    setUser: () => {},
    setToken: () => {},
    fetchUser: () => {},
    reset: () => {},
  })
})
