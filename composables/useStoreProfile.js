// Store feature flags from the public `GET /api/store-profile` (StoreProfileDTO). Loaded once per app and shared.
// Until it loads (or if it fails) optional features read as OFF and ordering as ON, so nothing is blocked by a failed call.
export const useStoreProfile = () => {
  const profile = useState('store-profile', () => null)
  const loading = useState('store-profile-loading', () => false)

  const load = async () => {
    if (profile.value || loading.value) return
    loading.value = true
    try {
      const { $api } = useNuxtApp()
      const response = await $api.storefront.getStoreProfile()
      profile.value = response.data.data ?? null
    } catch {
      profile.value = null
    } finally {
      loading.value = false
    }
  }

  if (import.meta.client) load()

  const flag = (name) => Boolean(profile.value?.[name])

  return {
    profile,
    load,
    orderingEnabled: computed(() => profile.value?.orderingEnabled !== false),
    orderingClosedMessage: computed(() => profile.value?.orderingClosedMessage || ''),
    wishlistEnabled: computed(() => flag('wishlistEnabled')),
    walletEnabled: computed(() => flag('walletEnabled')),
    stockAlertsEnabled: computed(() => flag('stockAlertsEnabled')),
    goodsQuestionsEnabled: computed(() => flag('goodsQuestionsEnabled')),
    prescriptionEnabled: computed(() => flag('prescriptionEnabled')),
    expiryRequired: computed(() => flag('expiryRequired')),
    variantsEnabled: computed(() => flag('variantsEnabled')),
  }
}
