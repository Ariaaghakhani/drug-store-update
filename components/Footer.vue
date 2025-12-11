<template>
  <footer
    class="bg-gray-900 dark:bg-gray-950 text-gray-400 py-12 lg:py-16 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 lg:px-8">
      <!-- Footer Top -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pb-8 lg:pb-12 mb-8 lg:mb-12 border-b border-gray-800 dark:border-gray-900"
      >
        <!-- Brand Section -->
        <div class="sm:col-span-2 lg:col-span-1">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 flex items-center justify-center">
              <svg
                width="40"
                height="40"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="16" cy="16" r="16" fill="#14B8A6" />
                <circle cx="16" cy="16" r="8" fill="white" />
              </svg>
            </div>
            <span class="text-xl font-black text-white">دارو پلاس</span>
          </div>
          <p class="text-sm leading-7 mb-6 text-gray-400">
            داروخانه آنلاین قابل اعتماد شما که راه‌حل‌های سلامت و تندرستی را با
            فناوری پیشرفته و مراقبت شخصی‌سازی شده ارائه می‌دهد.
          </p>
          <div class="flex items-center gap-3">
            <a
              href="#"
              class="w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-teal-400 hover:bg-teal-950 transition-all"
              aria-label="اینستاگرام"
            >
              <UIcon name="i-heroicons-camera" class="w-5 h-5" />
            </a>
            <a
              href="#"
              class="w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-teal-400 hover:bg-teal-950 transition-all"
              aria-label="تلگرام"
            >
              <UIcon name="i-heroicons-paper-airplane" class="w-5 h-5" />
            </a>
            <a
              href="#"
              class="w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-teal-400 hover:bg-teal-950 transition-all"
              aria-label="واتساپ"
            >
              <UIcon
                name="i-heroicons-chat-bubble-left-right"
                class="w-5 h-5"
              />
            </a>
            <a
              href="#"
              class="w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-teal-400 hover:bg-teal-950 transition-all"
              aria-label="توییتر"
            >
              <UIcon name="i-heroicons-at-symbol" class="w-5 h-5" />
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-base font-bold text-white mb-4">دسترسی سریع</h3>
          <ul class="space-y-3">
            <li>
              <NuxtLink
                to="/upload"
                class="text-sm text-gray-400 hover:text-teal-400 transition-colors inline-block"
              >
                بارگذاری نسخه
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/search"
                class="text-sm text-gray-400 hover:text-teal-400 transition-colors inline-block"
              >
                جستجوی دارو
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/products"
                class="text-sm text-gray-400 hover:text-teal-400 transition-colors inline-block"
              >
                محصولات سلامت
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/blog"
                class="text-sm text-gray-400 hover:text-teal-400 transition-colors inline-block"
              >
                وبلاگ سلامتی
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/ai-assistant"
                class="text-sm text-gray-400 hover:text-teal-400 transition-colors inline-block"
              >
                دستیار هوش مصنوعی
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h3 class="text-base font-bold text-white mb-4">پشتیبانی</h3>
          <ul class="space-y-3">
            <li>
              <NuxtLink
                to="/help"
                class="text-sm text-gray-400 hover:text-teal-400 transition-colors inline-block"
              >
                مرکز راهنمایی
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/contact-pharmacist"
                class="text-sm text-gray-400 hover:text-teal-400 transition-colors inline-block"
              >
                تماس با داروساز
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/track-order"
                class="text-sm text-gray-400 hover:text-teal-400 transition-colors inline-block"
              >
                پیگیری سفارش
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/returns"
                class="text-sm text-gray-400 hover:text-teal-400 transition-colors inline-block"
              >
                بازگشت کالا
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/privacy"
                class="text-sm text-gray-400 hover:text-teal-400 transition-colors inline-block"
              >
                حریم خصوصی
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Contact Us -->
        <div>
          <h3 class="text-base font-bold text-white mb-4">تماس با ما</h3>
          <ul class="space-y-4 mb-6">
            <li class="flex items-center gap-3">
              <UIcon
                name="i-heroicons-phone"
                class="w-5 h-5 text-teal-400 flex-shrink-0"
              />
              <span class="text-sm text-gray-400">۰۲۱-۱۲۳۴۵۶۷۸</span>
            </li>
            <li class="flex items-center gap-3">
              <UIcon
                name="i-heroicons-envelope"
                class="w-5 h-5 text-teal-400 flex-shrink-0"
              />
              <span class="text-sm text-gray-400">support@daroplus.ir</span>
            </li>
            <li class="flex items-center gap-3">
              <UIcon
                name="i-heroicons-clock"
                class="w-5 h-5 text-teal-400 flex-shrink-0"
              />
              <span class="text-sm text-gray-400">پشتیبانی ۲۴/۷</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div
        class="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-start"
      >
        <p class="text-sm text-gray-500">
          © ۱۴۰۳ دارو پلاس. تمام حقوق محفوظ است. داروخانه مجاز - شماره پروانه:
          ۱۲۳۴۵۶۷
        </p>
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/terms"
            class="text-sm text-gray-400 hover:text-white transition-colors"
          >
            شرایط استفاده
          </NuxtLink>
          <span class="text-gray-700">•</span>
          <NuxtLink
            to="/privacy"
            class="text-sm text-gray-400 hover:text-white transition-colors"
          >
            حریم خصوصی
          </NuxtLink>
          <span class="text-gray-700">•</span>
          <NuxtLink
            to="/accessibility"
            class="text-sm text-gray-400 hover:text-white transition-colors"
          >
            دسترسی‌پذیری
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// No logic needed for footer
</script>
