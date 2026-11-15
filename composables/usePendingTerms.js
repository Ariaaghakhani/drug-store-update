// Terms the logged-in user still has to accept (GET api/auth/me/terms/pending, shared via useState).
// check() never throws: a failed check just means no dialog, so it can never block the app.
export const usePendingTerms = () => {
  const { $api, $auth } = useNuxtApp()
  const terms = useState('pending-terms', () => [])
  const accepting = useState('pending-terms-accepting', () => false)

  const check = async () => {
    if (import.meta.server || !$auth.loggedIn) return
    try {
      const response = await $api.auth.getPendingTerms()
      const list = response.data.data
      terms.value = Array.isArray(list) ? list : []
    } catch {
      // swallowed on purpose: a failed check must never block the app
    }
  }

  const accept = async () => {
    if (accepting.value) return false
    accepting.value = true
    try {
      await $api.auth.acceptPendingTerms()
      terms.value = []
      return true
    } catch {
      return false
    } finally {
      accepting.value = false
    }
  }

  const clear = () => {
    terms.value = []
  }

  return { terms, accepting, check, accept, clear }
}
