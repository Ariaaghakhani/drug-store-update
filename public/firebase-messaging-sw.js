// Push service worker for Firebase Cloud Messaging. composables/usePushNotifications.js registers it at Firebase's
// default URL and scope (/firebase-cloud-messaging-push-scope), so it never competes with the PWA's workbox worker
// at '/'. It deliberately does not load the Firebase SDK: BACK sends data-only messages
// ({type, title, body, link, tag}) and this worker shows them itself, so nothing depends on a CDN.
//
// - A tab of the site is visible → the push goes to that tab (plugins/notifications.client.js shows a toast and
//   refreshes the bell) instead of an OS notification.
// - Otherwise → an OS notification; clicking it focuses an open tab and asks it to route to `link`, or opens one.

const ICON = '/seo/pwa-192x192.png'
const FALLBACK_LINK = '/panel/notifications'

const parsePayload = (event) => {
  try {
    return event.data ? event.data.json() : {}
  } catch {
    return {}
  }
}

// Only same-site paths: a push must never send the user to another origin
const safeLink = (link) =>
  typeof link === 'string' && link.startsWith('/') && !link.startsWith('//') ? link : FALLBACK_LINK

const siteWindows = async () => {
  const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  return all.filter((client) => new URL(client.url).origin === self.location.origin)
}

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('push', (event) => {
  const payload = parsePayload(event)
  const data = payload.data || {}
  const message = {
    title: data.title || payload.notification?.title || 'کپسول',
    body: data.body || payload.notification?.body || '',
    link: safeLink(data.link),
    type: data.type || '',
    tag: data.tag || '',
  }

  event.waitUntil(
    (async () => {
      const visible = (await siteWindows()).filter((client) => client.visibilityState === 'visible')
      if (visible.length) {
        visible.forEach((client) => client.postMessage({ source: 'capsule-push', kind: 'received', ...message }))
        return
      }
      await self.registration.showNotification(message.title, {
        body: message.body,
        icon: ICON,
        badge: ICON,
        dir: 'rtl',
        lang: 'fa',
        // Same tag (e.g. ORDER:12) replaces the older notification of that order instead of stacking
        tag: message.tag || undefined,
        renotify: Boolean(message.tag),
        data: { link: message.link },
      })
    })()
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const link = safeLink(event.notification.data?.link)

  event.waitUntil(
    (async () => {
      const [client] = await siteWindows()
      if (client) {
        await client.focus()
        client.postMessage({ source: 'capsule-push', kind: 'open', link })
        return
      }
      await self.clients.openWindow(link)
    })()
  )
})
