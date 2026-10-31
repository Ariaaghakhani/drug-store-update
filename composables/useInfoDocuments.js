// Loads one of the public text pages (about / terms / privacy / return policy) into InfoDocument's `documents` shape.
// `fetcher(api)` returns the API promise; `map(data)` turns the response `data` into [{key,title,content,meta?}].
export const useInfoDocuments = (fetcher, map) => {
  const app = useNuxtApp()
  const documents = ref([])
  const loading = ref(true)

  onMounted(async () => {
    try {
      const response = await fetcher(app.$api.storefront)
      documents.value = map(response.data.data)
    } catch {
      documents.value = []
    } finally {
      loading.value = false
    }
  })

  return { documents, loading }
}

export const formatInfoDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : `آخرین بروزرسانی: ${date.toLocaleDateString('fa-IR')}`
}
