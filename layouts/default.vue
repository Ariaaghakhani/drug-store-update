<template>
  <div dir="rtl" class="font-dana">
    <Header />
    <div
      v-if="!orderingEnabled"
      class="bg-warning/10 text-warning border-b border-warning/30 text-center text-sm py-2 px-4"
      role="status"
    >
      {{ orderingClosedMessage || 'در حال حاضر سفارش آنلاین پذیرفته نمی‌شود.' }}
    </div>
    <main class="min-h-screen">
      <NuxtPage />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { useFavicon } from 'assets/composables/useFavicon.js'
useFavicon()

const { orderingEnabled, orderingClosedMessage } = useStoreProfile()
</script>
