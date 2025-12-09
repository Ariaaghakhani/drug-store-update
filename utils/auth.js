export const tokenGeneratedAtLocalStorageKey = 'auth._token_generated_at.local'

export function logoutAndResetAuthentication(app, { callLogout = true } = {}) {
  if (callLogout && app.$auth.loggedIn) {
    app.$api.auth.logout().catch(() => {})
  }
  setTimeout(() => {
    app.$auth.reset()
  })
}
