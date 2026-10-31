// composables/useNotifications.js
// Shared in-app inbox state (BACK's /api/notifications/my): the unread count and the latest few items for the bell.
// Push (usePushNotifications) only tells us something arrived; this inbox is the source of truth, so it also polls
// while a panel tab is visible — browsers without push, or blocked from Firebase, still see new notifications.
const RECENT_SIZE = 6
const POLL_MS = 60_000

let pollTimer = null
let pollers = 0

export const useNotifications = () => {
  const { $api } = useNuxtApp()
  const unread = useState('notifications-unread', () => 0)
  const recent = useState('notifications-recent', () => [])
  const recentLoading = useState('notifications-recent-loading', () => false)
  const recentLoaded = useState('notifications-recent-loaded', () => false)

  async function refreshUnread() {
    try {
      const response = await $api.notification.getUnreadCount()
      unread.value = response.data.data?.unread ?? 0
    } catch {
      // keep the last known count
    }
  }

  async function loadRecent() {
    recentLoading.value = true
    try {
      const response = await $api.notification.listNotifications({ params: { page: 0, size: RECENT_SIZE } })
      recent.value = response.data.data?.content ?? []
    } catch {
      recent.value = []
    } finally {
      recentLoading.value = false
      recentLoaded.value = true
    }
  }

  // Optimistic: the item (and its copy in the bell list) turns read at once, the count is re-read if BACK refuses
  async function markRead(notification) {
    if (!notification || notification.readAt) return
    const readAt = new Date().toISOString()
    notification.readAt = readAt
    const inBell = recent.value.find((item) => item.id === notification.id)
    if (inBell) inBell.readAt = readAt
    unread.value = Math.max(0, unread.value - 1)
    try {
      await $api.notification.markRead(notification.id)
    } catch {
      await refreshUnread()
    }
  }

  async function markAllRead() {
    await $api.notification.markAllRead()
    const readAt = new Date().toISOString()
    recent.value.forEach((item) => {
      item.readAt ??= readAt
    })
    unread.value = 0
  }

  // A push reached a visible tab (plugins/notifications.client.js)
  function onPushReceived() {
    refreshUnread()
    if (recentLoaded.value) loadRecent()
  }

  // Shared timer: several mounted callers poll once; hidden tabs skip the call
  function startPolling() {
    pollers += 1
    if (pollTimer) return
    pollTimer = setInterval(() => {
      if (document.visibilityState === 'visible') refreshUnread()
    }, POLL_MS)
  }

  function stopPolling() {
    pollers = Math.max(0, pollers - 1)
    if (pollers === 0 && pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  function reset() {
    unread.value = 0
    recent.value = []
    recentLoaded.value = false
  }

  return {
    unread,
    recent,
    recentLoading,
    recentLoaded,
    refreshUnread,
    loadRecent,
    markRead,
    markAllRead,
    onPushReceived,
    startPolling,
    stopPolling,
    reset,
  }
}
