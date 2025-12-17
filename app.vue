<template>
  <div class="font-dana" :dir="$dir.value">
    <UApp
      :toaster="{ position: 'top-center', duration: 3000 }"
      :ui="{ toast: { slots: { title: 'text-right' } } }"
      :locale="faLocale"
    >
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UApp>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const { $dir } = useNuxtApp()

const faLocale = defineLocale({
  name: 'Persian',
  code: 'fa',
  dir: 'rtl',
  messages: {},
})

// Watch for locale changes and update HTML dir attribute
watch(() => locale.value, (newLocale) => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('dir', $dir.value.value)
    document.documentElement.setAttribute('lang', newLocale)
  }
}, { immediate: true })

useSeoMeta({
  title: 'دارو پلاس',
  description: 'خرید آنلاین دارو و محصولات بهداشتی',
  ogTitle: 'دارو پلاس',
  ogDescription: 'خرید آنلاین دارو و محصولات بهداشتی',
  ogImage: 'https://drug-store-update.vercel.app/seo/banner.png',
  ogUrl: 'https://drug-store-update.vercel.app',
  ogType: 'website',
  ogLocale: 'fa_IR',
  twitterCard: 'summary_large_image',
})

// TODO: REMOVE BEFORE PRODUCTION - Suppressing router warnings
if (import.meta.dev) {
  const warn = console.warn
  console.warn = (...args) =>
    args[0]?.includes?.('No match found') ? null : warn(...args)
}
</script>

<style>
.layout-enter-active,
.layout-leave-active {
  transition: opacity 0.3s;
}
.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}
</style>
