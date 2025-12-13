<template>
  <div :dir="$dir.value" class="font-dana">
    <Header />
    <main class="min-h-screen">
      <NuxtPage />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { useFavicon } from 'assets/composables/useFavicon.js'

const { $dir } = useNuxtApp()

useFavicon()
</script>
