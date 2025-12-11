<template>
  <div class="font-dana" :dir="currentLocale?.dir || 'rtl'">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const { locale, locales } = useI18n()

// Get current locale config for direction
const currentLocale = computed(() =>
  (locales.value as any[]).find(l => l.code === locale.value)
)

// Watch for locale changes and update HTML dir attribute
watch(() => locale.value, (newLocale) => {
  const localeConfig = (locales.value as any[]).find(l => l.code === newLocale)
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('dir', localeConfig?.dir || 'rtl')
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
