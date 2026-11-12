// The logged-in user's profile photo (api/auth/me/avatar, open to every logged-in user), shared by the panel header and
// the profile page through useState so a change shows everywhere at once.

// Same limits as BACK (AdminProfileServiceImpl); checked here only for a friendlier message
export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024

export function avatarFileError(file) {
  if (!AVATAR_TYPES.includes(file.type)) return 'فقط عکس JPG، PNG یا WebP'
  if (file.size > AVATAR_MAX_BYTES) return 'حجم عکس باید حداکثر ۲ مگابایت باشد'
  return null
}

export function useMyAvatar() {
  const app = useNuxtApp()
  const url = useState('my-avatar-url', () => null)
  const saving = useState('my-avatar-saving', () => false)

  // A failed read just shows the initials
  async function load() {
    try {
      const response = await app.$api.auth.getMyAvatar()
      url.value = response.data.data?.avatarUrl ?? null
    } catch {
      url.value = null
    }
  }

  // Throws BACK's error so the caller can toast its message
  async function change(file) {
    saving.value = true
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await app.$api.auth.changeMyAvatar({ data: formData })
      url.value = response.data.data?.avatarUrl ?? null
    } finally {
      saving.value = false
    }
  }

  async function remove() {
    saving.value = true
    try {
      await app.$api.auth.removeMyAvatar()
      url.value = null
    } finally {
      saving.value = false
    }
  }

  const reset = () => (url.value = null)

  // The same flow with checks and toasts, shared by the profile card and the panel header menu
  const toast = useAppToast()

  async function changeWithFeedback(file) {
    const problem = avatarFileError(file)
    if (problem) return toast.error('عکس پذیرفته نشد', problem)
    try {
      await change(file)
      toast.success('عکس پروفایل به‌روز شد')
    } catch (error) {
      toast.error('آپلود عکس ناموفق بود', error?.response?.data?.message)
    }
  }

  async function removeWithFeedback() {
    try {
      await remove()
      toast.success('عکس پروفایل حذف شد')
    } catch (error) {
      toast.error('حذف عکس ناموفق بود', error?.response?.data?.message)
    }
  }

  return { url, saving, load, change, remove, reset, changeWithFeedback, removeWithFeedback }
}
