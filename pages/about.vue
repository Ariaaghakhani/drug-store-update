<template>
  <UContainer>
    <div class="py-12">
      <!-- Page Header -->
      <div class="text-center mb-16">
        <h1
          class="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4"
        >
          درباره <span class="text-brand-500">ما</span>
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          ارائه‌دهنده معتبر خدمات دارویی و بهداشتی با بیش از ۱۰ سال تجربه
        </p>
      </div>

      <!-- Mission Section -->
      <div class="mb-20">
        <UCard>
          <div class="grid lg:grid-cols-2 gap-12 items-center p-8">
            <div>
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                ماموریت ما
              </h2>
              <p
                class="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6"
              >
                ما متعهد هستیم که دسترسی به داروها و محصولات بهداشتی با کیفیت را
                برای همه آسان کنیم. با استفاده از فناوری‌های نوین و تیم متخصص،
                خدماتی سریع، ایمن و قابل اعتماد ارائه می‌دهیم.
              </p>
              <p
                class="text-lg text-gray-600 dark:text-gray-400 leading-relaxed"
              >
                سلامتی شما، اولویت اول ماست.
              </p>
            </div>
            <div
              class="aspect-square rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-800 flex items-center justify-center"
            >
              <UIcon
                name="i-heroicons-heart"
                class="w-32 h-32 text-brand-500 opacity-30"
              />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Features Grid -->
      <div class="mb-20">
        <h2
          class="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12"
        >
          چرا ما را انتخاب کنید؟
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <UCard v-for="feature in features" :key="feature.title">
            <div class="text-center p-6">
              <div
                class="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-6"
              >
                <UIcon :name="feature.icon" class="w-8 h-8 text-brand-500" />
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {{ feature.title }}
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                {{ feature.description }}
              </p>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Stats -->
      <div class="mb-20">
        <div class="grid md:grid-cols-4 gap-8 text-center">
          <div v-for="stat in stats" :key="stat.label">
            <div class="text-4xl font-black text-brand-500 mb-2">
              {{ stat.value }}
            </div>
            <div class="text-gray-600 dark:text-gray-400">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- Contact CTA -->
      <UCard class="text-center">
        <div class="p-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            سوالی دارید؟
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
            تیم پشتیبانی ما ۲۴/۷ آماده پاسخگویی به شماست
          </p>
          <div class="flex flex-wrap gap-4 justify-center">
            <UButton size="xl" color="primary" icon="i-heroicons-phone">
              تماس با ما
            </UButton>
            <UButton
              size="xl"
              color="white"
              variant="outline"
              icon="i-heroicons-chat-bubble-left-right"
            >
              چت آنلاین
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AboutPage',

  data() {
    return {
      features: [
        {
          title: 'محصولات اصل',
          description:
            'تمامی محصولات ما اصل و دارای مجوز از سازمان غذا و دارو هستند',
          icon: 'i-heroicons-shield-check',
        },
        {
          title: 'ارسال سریع',
          description:
            'تحویل ۲۴ ساعته در اکثر شهرها و ارسال رایگان برای خریدهای بالای ۵۰۰ هزار تومان',
          icon: 'i-heroicons-truck',
        },
        {
          title: 'مشاوره رایگان',
          description:
            'داروسازان مجرب ما آماده ارائه مشاوره رایگان به شما هستند',
          icon: 'i-heroicons-chat-bubble-left-right',
        },
        {
          title: 'پرداخت امن',
          description:
            'تمامی تراکنش‌ها با بالاترین استانداردهای امنیتی محافظت می‌شوند',
          icon: 'i-heroicons-lock-closed',
        },
        {
          title: 'قیمت مناسب',
          description: 'بهترین قیمت‌ها با تخفیف‌های ویژه برای مشتریان وفادار',
          icon: 'i-heroicons-currency-dollar',
        },
        {
          title: 'پشتیبانی ۲۴/۷',
          description: 'تیم پشتیبانی ما همیشه در دسترس شماست',
          icon: 'i-heroicons-clock',
        },
      ],
      stats: [
        { value: '۵۰,۰۰۰+', label: 'مشتری راضی' },
        { value: '۱۰+', label: 'سال تجربه' },
        { value: '۱۰۰,۰۰۰+', label: 'محصول فروخته شده' },
        { value: '۹۹.۹٪', label: 'رضایت مشتریان' },
      ],
    }
  },

  head() {
    return {
      title: 'درباره ما | داروخانه آنلاین',
    }
  },
})
</script>
