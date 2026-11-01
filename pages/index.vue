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

    <!-- Hides itself while BACK keeps categories behind login -->
    <UContainer>
      <CategoriesCarousel />
    </UContainer>

    <UContainer>
      <BrandsStrip />
    </UContainer>

    <!-- Product sections from GET api/storefront/home -->
    <UContainer>
      <HomeSections />
    </UContainer>

    <!-- Chatbot Widget - Fixed Position -->
    <ChatbotWidget />
  </div>
</template>

<script setup>
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
