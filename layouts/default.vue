<template>
  <div :dir="currentLocale?.dir || 'rtl'" class="font-dana">
    <Header />
    <main class="min-h-screen">
      <NuxtPage />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { useFavicon } from 'assets/composables/useFavicon.js'

const { locale, locales } = useI18n()

// Get current locale config for direction
const currentLocale = computed(() =>
  (locales.value as any[]).find(l => l.code === locale.value)
)

useFavicon()
</script>
