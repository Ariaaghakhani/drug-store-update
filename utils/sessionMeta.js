// The login log only ever shows the latest attempts, on the user's own security page and on a user's detail page
export const LOGIN_HISTORY_SIZE = 5

// Login session (BACK's SessionDTO) → the row ActiveSessionsCard renders.
const DEVICE_ICONS = {
  Windows: 'i-heroicons-computer-desktop',
  macOS: 'i-heroicons-computer-desktop',
  Linux: 'i-heroicons-computer-desktop',
  Android: 'i-heroicons-device-phone-mobile',
  iOS: 'i-heroicons-device-phone-mobile',
  App: 'i-heroicons-device-phone-mobile',
}

export const mapSession = (session) => ({
  id: session.id,
  current: session.current,
  icon: DEVICE_ICONS[session.device] ?? 'i-heroicons-question-mark-circle',
  device: session.device ?? 'نامشخص',
  browser: session.browser ?? 'نامشخص',
  location: session.location ?? 'نامشخص',
  ip: session.ip ?? 'نامشخص',
  lastActive: session.lastActiveAt ? new Date(session.lastActiveAt).toLocaleString('fa-IR') : '',
})
