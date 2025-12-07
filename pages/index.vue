<template>
  <div>
    <!-- Hero Section - Full Width Background -->
    <div
      class="bg-gradient-to-b from-brand-50 to-white dark:from-brand-500 dark:to-gray-900"
    >
      <UContainer>
        <HeroSection />
      </UContainer>
    </div>

    <UContainer>
      <CategoriesCarousel />
    </UContainer>

    <!-- Featured Products - Contained -->
    <UContainer>
      <FeaturedProducts />
    </UContainer>

    <!-- Popular Medications - Full Width Background -->
    <div class="bg-gray-50 dark:bg-gray-900 py-16">
      <UContainer>
        <PopularMedications />
      </UContainer>
    </div>

    <!-- Chatbot Widget - Fixed Position -->
    <ChatbotWidget />
  </div>
</template>

<script setup>
import { useAsyncData } from '#app'
// const app = useNuxtApp()
useAsyncData('index-page-events', async () => {
  await new Promise((resolve) => setTimeout(resolve, 3000))
  console.log(window.$nuxt)
  // try {
  //   const response = await app.$api.auth.events()
  //   console.log(response)
  // } catch (error) {
  //   console.log(error)
  // }
})
useHead({
  title: 'داروخانه آنلاین | سلامتی در درب منزل',
  meta: [
    {
      name: 'description',
      content:
        'دارو و محصولات بهداشتی خود را با تحویل ایمن در منزل دریافت کنید. داروسازان مجرب ۲۴/۷ در خدمت شما',
    },
    {
      property: 'og:title',
      content: 'داروخانه آنلاین | سلامتی در درب منزل',
    },
    {
      property: 'og:description',
      content:
        'دارو و محصولات بهداشتی خود را با تحویل ایمن در منزل دریافت کنید',
    },
  ],
})
</script>
