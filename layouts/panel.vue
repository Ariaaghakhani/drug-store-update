<template>
  <div dir="rtl" class="font-dana">
    <Header />
    <main class="min-h-screen">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup>
import { useFavicon } from 'assets/composables/useFavicon.js'
useFavicon()
</script>
