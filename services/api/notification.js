/**
 * Notification Service — in-app inbox + push device registration (BACK's UserNotificationController,
 * /api/notifications/my/**, any logged-in user, the user comes from the token).
 */
export default (apiCaller) => ({
  // GET, 0-based `page`, `size` 1..100, optional `unreadOnly` via config.params → PageResponse<UserNotificationDTO>
  listNotifications(config) {
    return apiCaller.get('api/notifications/my', config)
  },

  // → { unread }
  getUnreadCount() {
    return apiCaller.get('api/notifications/my/unread-count')
  },

  // → UserNotificationDTO (already read → unchanged)
  markRead(id) {
    return apiCaller.put(`api/notifications/my/${id}/read`)
  },

  // → { unread: 0 }
  markAllRead() {
    return apiCaller.put('api/notifications/my/read-all')
  },

  // body {token, userAgent?}; idempotent — re-sent on every panel load to refresh the device
  registerDevice(config) {
    return apiCaller.put('api/notifications/my/devices', config)
  },

  // body {token}; only removes the caller's own device row
  unregisterDevice(config) {
    return apiCaller.post('api/notifications/my/devices/remove', config)
  },
})
