// The store's product category tree (GET api/categories/tree?scope=PRODUCT), shared app-wide via useState.
//
// BACK doesn't expose this to guests yet (it answers 401 — see BACKEND_REQUESTS.md), so a 401/403 is not an error:
// `status` becomes 'unavailable' and the category UI hides itself. Once BACK opens the endpoint nothing here changes.
//   status: 'idle' | 'loading' | 'ready' | 'unavailable' (no access or nothing to show) | 'failed' (network/server error)
export const useStoreCategories = () => {
  const tree = useState('store-categories', () => [])
  const status = useState('store-categories-status', () => 'idle')

  const load = async (force = false) => {
    if (status.value === 'loading' || (!force && ['ready', 'unavailable'].includes(status.value))) return
    status.value = 'loading'
    try {
      const { $api } = useNuxtApp()
      const response = await $api.storefront.getCategoryTree()
      tree.value = response.data.data ?? []
      status.value = tree.value.length > 0 ? 'ready' : 'unavailable'
    } catch (error) {
      tree.value = []
      status.value = [401, 403].includes(error?.response?.status) ? 'unavailable' : 'failed'
    }
  }

  if (import.meta.client) load()

  // id → category, for showing the selected one's name
  const byId = computed(() => {
    const map = new Map()
    const walk = (nodes) =>
      nodes.forEach((node) => {
        map.set(node.id, node)
        walk(node.children ?? [])
      })
    walk(tree.value)
    return map
  })

  return {
    tree,
    status,
    byId,
    load,
    available: computed(() => status.value === 'ready'),
  }
}
