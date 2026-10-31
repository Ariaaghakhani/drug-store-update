// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@pinia/nuxt',
    '@nuxt/ui',
    '@vite-pwa/nuxt',
  ],
  css: ['~/assets/style/main.css'],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      meta: [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'کپسول' },
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/seo/pwa-512x512.png' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
      htmlAttrs: {
        dir: 'rtl',
        lang: 'fa',
      },
    },
  },
  eslint: {},
  routeRules: {
    '/panel/**': { ssr: false },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'CAPSULE کپسول',
      short_name: 'کپسول',
      theme_color: '#2C7A7B',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
      icons: [
        {
          src: '/seo/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/seo/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/seo/pwa-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
    },
  },
  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },
  runtimeConfig: {
    public: {
      // BACKEND_URL: 'https://lanelle-unbronzed-carpologically.ngrok-free.dev/',
      BACKEND_URL: 'http://localhost:8081',
      CMS_URL: 'https://ancient-balance-34dc5d8db0.strapiapp.com',
      // Firebase web app config for push (Project settings → General → Your apps; vapidKey: Cloud Messaging →
      // Web Push certificates). Public values, not secrets. Override per environment with NUXT_PUBLIC_FIREBASE_*
      // (e.g. NUXT_PUBLIC_FIREBASE_API_KEY, NUXT_PUBLIC_FIREBASE_VAPID_KEY). Empty = push UI hidden, inbox still works.
      firebase: {
        apiKey: 'AIzaSyDZHvmDcfJaaJujewgetXj776LcNGyKrrM',
        authDomain: 'capsule-pharmacy-c1985.firebaseapp.com',
        projectId: 'capsule-pharmacy-c1985',
        storageBucket: 'capsule-pharmacy-c1985.firebasestorage.app',
        messagingSenderId: '578896930773',
        appId: '1:578896930773:web:a16f262856a22adf357f5c',
        vapidKey: 'BFm3mzLEFDp6id-uEwla_ETLFqLk9fUB8Ir2idmRYzfDDYGsxilaT8fY0eAG3UNuHnpWvC6o82itGtXIdX3TH-0',
      },
    },
  },
})
