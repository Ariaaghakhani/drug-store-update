<template>
  <div class="font-dana" dir="rtl">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
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
