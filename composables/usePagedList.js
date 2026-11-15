// composables/usePagedList.js
// Shared paging for panel lists. fetchPage({ page, size }) receives the BACKEND page (0-based by default) and returns
// the API promise; res.data.data is a PageResponse { content, totalElements, totalPages }.
// `page` here is the 1-based UPagination ref; the backend page is page.value - 1 + backendBase.
// Responses are guarded by a request counter, so a slow older response never overwrites a newer one.
export const usePagedList = (fetchPage, { size = 20, filters, backendBase = 0 } = {}) => {
  const items = ref([])
  const total = ref(0)
  const totalPages = ref(0)
  const page = ref(1)
  const loading = ref(true)
  const error = ref(null)
  const forbidden = ref(false)

  let latestRequest = 0

  async function load() {
    const request = ++latestRequest
    loading.value = true
    try {
      const response = await fetchPage({ page: page.value - 1 + backendBase, size })
      if (request !== latestRequest) return
      const pageData = response?.data?.data
      items.value = pageData?.content ?? []
      total.value = pageData?.totalElements ?? 0
      totalPages.value = pageData?.totalPages ?? 0
      error.value = null
      forbidden.value = false
    } catch (err) {
      if (request !== latestRequest) return
      items.value = []
      total.value = 0
      totalPages.value = 0
      error.value = err
      forbidden.value = err?.response?.status === 403
    } finally {
      if (request === latestRequest) loading.value = false
    }
  }

  // Page change reloads; a filter change jumps to page 1 (the page watch loads when it actually moves)
  watch(page, () => load())
  if (filters) {
    watch(
      filters,
      () => {
        if (page.value === 1) load()
        else page.value = 1
      },
      { deep: true }
    )
  }

  // Client-side only: onMounted never runs during SSR
  onMounted(load)

  return { items, total, totalPages, page, loading, error, forbidden, reload: load }
}
