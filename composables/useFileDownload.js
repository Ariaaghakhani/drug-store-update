// Blob downloads and previews for wrappers called with `{ responseType: 'blob' }`.
// plugins/api.js passes responseType through and wraps the Blob as `{ data: Blob }`, so the file is `res.data`.
// Error bodies of a blob request are blobs too: never read `.message` from them, just toast the generic error.
export const useFileDownload = () => {
  const toast = useAppToast()

  const blobFrom = (res) => {
    const blob = res?.data
    return blob instanceof Blob ? blob : null
  }

  // Saves the file to the device. Revokes the object URL right after the click.
  const download = async (requestPromise, fileName) => {
    try {
      const blob = blobFrom(await requestPromise)
      if (!blob) throw new Error('download.no-blob')
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || 'file'
      link.click()
      URL.revokeObjectURL(url)
      return true
    } catch {
      toast.error('خطا در دریافت فایل')
      return false
    }
  }

  // Returns an object URL for inline preview (e.g. <img>, <iframe>). The CALLER must revoke it,
  // typically in onBeforeUnmount. Resolves to null on failure (after a toast).
  const previewUrl = async (requestPromise) => {
    try {
      const blob = blobFrom(await requestPromise)
      if (!blob) throw new Error('preview.no-blob')
      return URL.createObjectURL(blob)
    } catch {
      toast.error('خطا در دریافت فایل')
      return null
    }
  }

  return { download, previewUrl }
}
