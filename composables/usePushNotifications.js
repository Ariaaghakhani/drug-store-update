// composables/usePushNotifications.js
// Web push through Firebase Cloud Messaging. The Firebase SDK is only used here to turn this browser into an FCM token
// (getToken/deleteToken) and is imported lazily, so it never lands in the main bundle. Showing a push is the job of
// public/firebase-messaging-sw.js, registered at Firebase's default URL and scope so it never competes with the PWA's
// workbox worker at '/'. BACK keeps the token per user (PUT api/notifications/my/devices).
// Config: runtimeConfig.public.firebase (NUXT_PUBLIC_FIREBASE_*); without it push stays hidden and the inbox still works.
const TOKEN_STORAGE_KEY = 'push.token'
// Set when the user turns push off on this browser, so the silent sync() on app load doesn't turn it back on
const OPT_OUT_STORAGE_KEY = 'push.opted-out'
const SW_URL = '/firebase-messaging-sw.js'
const SW_SCOPE = '/firebase-cloud-messaging-push-scope'
// Logout must not hang on a slow or blocked Google endpoint
const DISABLE_TIMEOUT_MS = 1500

let firebasePromise = null

function loadFirebase(config) {
  if (!firebasePromise) {
    firebasePromise = (async () => {
      const [{ initializeApp, getApps }, messaging] = await Promise.all([
        import('firebase/app'),
        import('firebase/messaging'),
      ])
      if (!(await messaging.isSupported())) return null
      const app =
        getApps()[0] ??
        initializeApp({
          apiKey: config.apiKey,
          authDomain: config.authDomain,
          projectId: config.projectId,
          storageBucket: config.storageBucket,
          messagingSenderId: config.messagingSenderId,
          appId: config.appId,
        })
      return { messaging: messaging.getMessaging(app), getToken: messaging.getToken, deleteToken: messaging.deleteToken }
    })().catch(() => null)
  }
  return firebasePromise
}

const readPermission = () =>
  import.meta.client && typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'

const readStored = (key) => {
  if (!import.meta.client) return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const writeStored = (key, value) => {
  try {
    if (value) localStorage.setItem(key, value)
    else localStorage.removeItem(key)
  } catch {
    // private mode: just not remembered across reloads
  }
}

// Browser-only state, shared by every caller. Not useState: the server's "unsupported" would be serialized into the
// payload and win over the real permission on the client.
let clientState = null
const pushState = () => {
  const create = () => ({
    permission: ref(readPermission()),
    token: ref(readStored(TOKEN_STORAGE_KEY)),
    optedOut: ref(readStored(OPT_OUT_STORAGE_KEY) === '1'),
    busy: ref(false),
  })
  if (!import.meta.client) return create()
  clientState ??= create()
  return clientState
}

export const usePushNotifications = () => {
  const { $api } = useNuxtApp()
  const config = useRuntimeConfig().public.firebase ?? {}
  const configured = Boolean(
    config.apiKey && config.projectId && config.messagingSenderId && config.appId && config.vapidKey
  )

  // permission: 'default' | 'granted' | 'denied' | 'unsupported'
  const { permission, token, optedOut, busy } = pushState()

  const supported = computed(
    () =>
      configured &&
      import.meta.client &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      typeof Notification !== 'undefined'
  )
  const enabled = computed(() => supported.value && permission.value === 'granted' && Boolean(token.value))

  async function register() {
    const firebase = await loadFirebase(config)
    if (!firebase) throw new Error('push.unsupported')
    const registration = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE })
    const newToken = await firebase.getToken(firebase.messaging, {
      vapidKey: config.vapidKey,
      serviceWorkerRegistration: registration,
    })
    if (!newToken) throw new Error('push.no-token')
    await $api.notification.registerDevice({
      data: { token: newToken, userAgent: navigator.userAgent.slice(0, 300) },
    })
    token.value = newToken
    writeStored(TOKEN_STORAGE_KEY, newToken)
  }

  // Asks for permission, so call it from a click. Resolves true once this browser is registered with BACK.
  async function enable() {
    if (!supported.value || busy.value) return false
    busy.value = true
    try {
      permission.value = await Notification.requestPermission()
      if (permission.value !== 'granted') return false
      optedOut.value = false
      writeStored(OPT_OUT_STORAGE_KEY, null)
      await register()
      return true
    } finally {
      busy.value = false
    }
  }

  // Silent refresh on app load (FCM rotates tokens; BACK moves a shared browser to whoever is logged in). Never prompts.
  async function sync() {
    permission.value = readPermission()
    if (!supported.value || permission.value !== 'granted' || optedOut.value) return
    try {
      await register()
    } catch {
      // Firebase unreachable or blocked: the inbox poll still covers this browser
    }
  }

  // Logout (default) or the user's "turn off on this device" (`optOut: true`, remembered so sync() leaves it off).
  // Call before the auth token is cleared: the unregister request is sent synchronously, then FCM gets a moment
  // and we move on. Never throws.
  async function disable({ optOut = false } = {}) {
    if (optOut) {
      optedOut.value = true
      writeStored(OPT_OUT_STORAGE_KEY, '1')
    }
    const current = token.value
    token.value = null
    writeStored(TOKEN_STORAGE_KEY, null)
    if (!current) return
    const work = (async () => {
      await $api.notification.unregisterDevice({ data: { token: current } }).catch(() => {})
      const firebase = await loadFirebase(config)
      if (firebase) await firebase.deleteToken(firebase.messaging).catch(() => {})
    })()
    await Promise.race([work, new Promise((resolve) => setTimeout(resolve, DISABLE_TIMEOUT_MS))])
  }

  return { configured, supported, permission, token, optedOut, enabled, busy, enable, sync, disable }
}
