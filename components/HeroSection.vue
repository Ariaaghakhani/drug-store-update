<template>
  <section class="py-12">
    <div class="flex gap-12 lg:gap-16 content-start flex-wrap md:flex-nowrap">
      <!-- Image/Illustration -->
      <div
        class="flex w-full md:w-2/5 rounded-3xl bg-gradient-to-b from-brand-100 to-brand-300 dark:from-brand-900 dark:to-brand-800 justify-center relative shadow-2xl items-start overflow-hidden"
      >
        <HeroCarousel />
      </div>

      <!-- Text Content -->
      <div class="space-y-8 w-full md:w-3/5 flex flex-wrap *:w-full">
        <div class="space-y-8 order-2 md:order-1">
          <!-- AI Badge -->
          <div
            class="flex max-w-fit items-center gap-2 px-4 py-2 rounded-full bg-brand-100 dark:bg-brand-900/50 text-sm"
          >
            <UIcon
              class="text-brand-800 dark:text-white w-5 h-5"
              name="i-heroicons-sparkles"
            />
            <span class="text-brand-800 dark:text-white font-medium w-fit"
              >دستیار هوشمند آنلاین</span
            >
          </div>

          <!-- Main Heading -->
          <div>
            <h1
              class="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 dark:text-white leading-tight"
            >
              سلامتی شما،
              <span class="text-brand-500 dark:text-brand-400 block mt-2"
                >در درب منزل</span
              >
            </h1>
          </div>

          <!-- Description -->
          <p
            class="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl"
          >
            دارو و محصولات بهداشتی خود را با تحویل ایمن در منزل دریافت کنید.
            داروسازان مجرب ۲۴/۷ با پشتیبانی هوش مصنوعی در خدمت شما هستند.
          </p>
        </div>

        <!-- Large ChatGPT-style Search Input -->
        <div class="relative order-1 md:order-2">
          <UTextarea
            v-model="searchQuery"
            :rows="1"
            :padded="true"
            autoresize
            size="xl"
            class="w-full [&_textarea]:min-h-24 [&_textarea]:max-h-24 [&_textarea]:py-3 [&_textarea]:pe-20 [&_textarea]:rounded-2xl [&_textarea]:dark:bg-gray-900/50"
            placeholder="نام دارو یا محصول مورد نظر خود را جستجو کنید..."
            @keydown.enter.prevent="handleSearch"
          />
          <UButton
            icon="i-heroicons-magnifying-glass"
            size="lg"
            :disabled="!searchQuery"
            class="absolute end-5 top-1/2 -translate-y-1/2"
            @click="handleSearch"
          />
        </div>

        <!-- Features List -->
        <div class="space-y-8 order-3">
          <div class="flex flex-wrap gap-6 text-base">
            <div class="flex items-center gap-2">
              <UIcon
                class="text-brand-500 w-6 h-6"
                name="i-heroicons-check-circle"
              />
              <span class="font-medium">تایید سازمان غذا و دارو</span>
            </div>
            <div class="flex items-center gap-2">
              <UIcon
                class="text-brand-500 w-6 h-6"
                name="i-heroicons-check-circle"
              />
              <span class="font-medium">پشتیبانی ۲۴ ساعته</span>
            </div>
            <div class="flex items-center gap-2">
              <UIcon
                class="text-brand-500 w-6 h-6"
                name="i-heroicons-check-circle"
              />
              <span class="font-medium">ارسال رایگان</span>
            </div>
          </div>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 pt-4">
            <UButton
              class="justify-center"
              color="primary"
              icon="i-heroicons-shopping-bag"
              size="xl"
              to="/medications"
            >
              مشاهده داروها
            </UButton>
            <UButton
              class="justify-center"
              color="white"
              icon="i-heroicons-chat-bubble-left-right"
              size="xl"
              variant="outline"
              @click="openChat"
            >
              گفتگو با دستیار هوشمند
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { useChatStore } from '~/stores/chat'

export default {
  name: 'HeroSection',

  data() {
    return {
      searchQuery: '',
    }
  },

  methods: {
    openChat() {
      const chatStore = useChatStore()
      chatStore.toggleChat()
    },

    handleSearch() {
      if (this.searchQuery.trim()) {
        this.$router.push(
          `/medications?search=${encodeURIComponent(this.searchQuery)}`
        )
      }
    },

    autoResize(event) {
      const textarea = event.target

      // Always maintain centered padding regardless of content
      textarea.style.paddingTop = 'calc((96px - 1.5em) / 2)'
      textarea.style.paddingBottom = 'calc((96px - 1.5em) / 2)'

      textarea.style.height = 'auto'
      const newHeight = Math.min(textarea.scrollHeight, 200)
      textarea.style.height = newHeight + 'px'

      // Recalculate padding if height changes
      if (newHeight > 96) {
        textarea.style.paddingTop = '1.25rem'
        textarea.style.paddingBottom = '1.25rem'
      }
    },
  },
}
</script>

<style scoped>
textarea::placeholder {
  line-height: 1.5;
}
</style>
