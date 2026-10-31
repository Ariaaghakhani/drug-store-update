// Foreground side of push (see public/firebase-messaging-sw.js): a push that reaches a visible tab becomes a toast and
// a bell refresh; a clicked OS notification asks an open tab to route to its link. Also refreshes this browser's FCM
// token whenever a session starts (app load or login, which doesn't reload the page), when the user already allowed
// notifications. Logout removes the token from BACK, so without this a re-login gets no push until the next reload.
const isSafeLink = (link) => typeof link === 'string' && link.startsWith('/') && !link.startsWith('//')

export default defineNuxtPlugin((nuxtApp) => {
  if (!('serviceWorker' in navigator)) return

  navigator.serviceWorker.addEventListener('message', (event) => {
    const message = event.data
    if (message?.source !== 'capsule-push') return

    if (message.kind === 'open') {
      if (isSafeLink(message.link)) nuxtApp.runWithContext(() => navigateTo(message.link))
      return
    }

    if (message.kind === 'received') {
      nuxtApp.runWithContext(() => {
        useNotifications().onPushReceived()
        useToast().add({
          title: message.title,
          description: message.body || undefined,
          icon: 'i-heroicons-bell',
          color: 'primary',
          actions: isSafeLink(message.link)
            ? [{ label: 'مشاهده', color: 'primary', variant: 'soft', onClick: () => navigateTo(message.link) }]
            : undefined,
        })
      })
    }
  })

  nuxtApp.hook('app:mounted', async () => {
    await nuxtApp.$authReady
    watch(
      () => nuxtApp.$auth.loggedIn,
      (loggedIn) => {
        if (loggedIn) nuxtApp.runWithContext(() => usePushNotifications().sync())
      },
      { immediate: true }
    )
  })
})
