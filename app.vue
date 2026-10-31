<template>
  <div class="font-dana" dir="rtl">
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

<script setup>
const faLocale = defineLocale({
  name: 'Persian',
  code: 'fa',
  dir: 'rtl',
  messages: {},
})
useSeoMeta({
  title: 'CAPSULE کپسول',
  description: 'خرید آنلاین دارو و محصولات بهداشتی',
  ogTitle: 'CAPSULE کپسول',
  ogDescription: 'خرید آنلاین دارو و محصولات بهداشتی',
  ogImage: 'https://capsulepharmacy.ir/seo/banner.png',
  ogUrl: 'https://capsulepharmacy.ir',
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
