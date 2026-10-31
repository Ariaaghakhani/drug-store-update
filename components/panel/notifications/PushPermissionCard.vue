<template>
  <UCard v-if="push.configured && mounted" :ui="{ body: 'p-0' }">
    <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
      <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4 text-brand-500 flex-shrink-0" />
      <h3 class="text-sm font-medium text-gray-900 dark:text-white">اعلان روی این دستگاه</h3>
    </div>

    <div class="flex items-center gap-4 px-4 sm:px-6 py-4 flex-wrap sm:flex-nowrap">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" :class="state.tile">
        <UIcon :name="state.icon" class="w-5 h-5" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-900 dark:text-white">{{ state.title }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ state.description }}</p>
      </div>

      <UButton
        v-if="state.key === 'off' || state.key === 'retry'"
        color="primary"
        size="lg"
        icon="i-heroicons-bell"
        :loading="push.busy.value"
        @click="turnOn"
      >
        {{ state.key === 'retry' ? 'تلاش دوباره' : 'فعال‌سازی' }}
      </UButton>
      <UButton
        v-else-if="state.key === 'on'"
        color="neutral"
        variant="soft"
        size="lg"
        :loading="turningOff"
        @click="turnOff"
      >
        غیرفعال‌سازی
      </UButton>
    </div>
  </UCard>
</template>

<script setup>
// Opt-in for web push on this browser. Hidden when Firebase isn't configured (runtimeConfig.public.firebase); the
// in-app inbox works either way.
const toast = useAppToast()
const push = usePushNotifications()

const turningOff = ref(false)
// Notification.permission only exists in the browser; render after mount so SSR and client agree
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})

const TILE_ON = 'bg-success/10 dark:bg-success/20 text-success'
const TILE_OFF = 'bg-brand-50 dark:bg-brand-900/20 text-brand-500 dark:text-brand-400'
const TILE_BLOCKED = 'bg-warning/10 dark:bg-warning/20 text-warning'

const state = computed(() => {
  if (!push.supported.value) {
    return {
      key: 'unsupported',
      icon: 'i-heroicons-no-symbol',
      tile: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
      title: 'مرورگر شما از اعلان پشتیبانی نمی‌کند',
      description: 'اعلان‌ها همچنان در همین صفحه و زنگوله‌ی پنل نمایش داده می‌شوند. در آیفون، سایت را به صفحه‌ی اصلی اضافه کنید.',
    }
  }
  if (push.permission.value === 'denied') {
    return {
      key: 'blocked',
      icon: 'i-heroicons-bell-slash',
      tile: TILE_BLOCKED,
      title: 'اعلان‌ها در مرورگر مسدود شده است',
      description: 'از تنظیمات سایت در مرورگر (آیکون قفل کنار نشانی) اجازه‌ی اعلان را روشن کنید و صفحه را دوباره باز کنید.',
    }
  }
  if (push.enabled.value) {
    return {
      key: 'on',
      icon: 'i-heroicons-bell-alert',
      tile: TILE_ON,
      title: 'اعلان‌ها روشن است',
      description: 'وضعیت سفارش، پاسخ پشتیبانی و پیام‌های مهم را حتی وقتی سایت بسته است دریافت می‌کنید.',
    }
  }
  if (push.permission.value === 'granted' && !push.optedOut.value) {
    return {
      key: 'retry',
      icon: 'i-heroicons-exclamation-triangle',
      tile: TILE_BLOCKED,
      title: 'اتصال به سرویس اعلان برقرار نشد',
      description: 'اجازه داده شده، ولی ثبت این دستگاه انجام نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.',
    }
  }
  return {
    key: 'off',
    icon: 'i-heroicons-bell',
    tile: TILE_OFF,
    title: 'اعلان‌های لحظه‌ای را روشن کنید',
    description: 'از ارسال سفارش، پاسخ پشتیبانی و موجود شدن کالا بلافاصله باخبر شوید.',
  }
})

async function turnOn() {
  try {
    const ok = await push.enable()
    if (ok) toast.success('اعلان‌ها روشن شد')
  } catch (error) {
    console.warn('[Push] Enabling failed:', error)
    toast.error('روشن کردن اعلان‌ها ناموفق بود', 'دسترسی به سرویس اعلان برقرار نشد')
  }
}

async function turnOff() {
  turningOff.value = true
  try {
    await push.disable({ optOut: true })
    toast.success('اعلان‌ها روی این دستگاه خاموش شد')
  } finally {
    turningOff.value = false
  }
}
</script>
