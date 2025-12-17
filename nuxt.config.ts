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
    '@nuxtjs/i18n',
  ],
  i18n: {
    locales: [
      {
        code: 'fa',
        name: 'فارسی',
        dir: 'rtl',
        file: 'fa.json',
      },
      {
        code: 'en',
        name: 'English',
        dir: 'ltr',
        file: 'en.json',
      },
    ],
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'fa',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },
  css: ['~/assets/style/main.css'],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      meta: [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'داروپلاس' },
      ],
      link: [{ rel: 'apple-touch-icon', href: '/seo/pwa-512x512.png' }],
    },
  },
  eslint: {},
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'دارو پلاس',
      short_name: 'داروپلاس',
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
          src: '/seo/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
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
      BACKEND_URL: 'https://lanelle-unbronzed-carpologically.ngrok-free.dev/',
      CMS_URL: 'https://ancient-balance-34dc5d8db0.strapiapp.com',
    },
  },
})
