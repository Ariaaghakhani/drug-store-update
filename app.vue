<template>
  <div class="font-dana" :dir="$dir.value">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const { $dir } = useNuxtApp()

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
</script>
