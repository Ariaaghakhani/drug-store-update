<template>
  <UContainer>
    <div class="py-20 flex flex-col items-center text-center max-w-md mx-auto">
      <template v-if="!gatewayUrl">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-20 h-20 text-warning" />
        <h1 class="text-2xl font-black text-gray-900 dark:text-white mt-6 mb-2">
          لینک پرداخت یافت نشد
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          این صفحه مستقیماً باز نمی‌شود؛ لطفاً دوباره از سبد خرید اقدام کنید.
        </p>
        <UButton color="primary" to="/cart" icon="i-heroicons-shopping-cart">
          بازگشت به سبد خرید
        </UButton>
      </template>

      <template v-else>
        <UIcon
          name="i-heroicons-arrow-path"
          class="w-16 h-16 text-brand-500 dark:text-brand-400 animate-spin"
        />

        <h1 class="text-2xl font-black text-gray-900 dark:text-white mt-6 mb-2">
          در حال انتقال به <span class="text-brand-500">{{ gatewayLabel }}</span>
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          سفارش شما ثبت شد؛ چند لحظه صبر کنید تا به صفحه پرداخت منتقل شوید.
        </p>

        <div
          v-if="amount"
          class="w-full rounded-xl bg-gray-50 dark:bg-gray-800/60 p-4 mb-8 text-sm"
        >
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">مبلغ قابل پرداخت</span>
            <span class="font-bold text-gray-900 dark:text-white">{{ formatPrice(amount) }}</span>
          </div>
        </div>

        <UButton color="primary" icon="i-heroicons-arrow-left-end-on-rectangle" @click="goToGateway">
          ادامه به درگاه پرداخت
        </UButton>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-3">
          اگر انتقال خودکار انجام نشد، روی دکمه بالا بزنید
        </p>
      </template>
    </div>
  </UContainer>
</template>

<script setup>
const route = useRoute()
const { formatPrice } = useFormat()

const GATEWAY_LABELS = {
  MOCK: 'درگاه آزمایشی',
  ZARINPAL: 'زرین‌پال',
}

const gatewayUrl = computed(() => (typeof route.query.url === 'string' ? route.query.url : null))
const gatewayLabel = computed(() => GATEWAY_LABELS[route.query.gateway] ?? 'درگاه پرداخت')
const amount = computed(() => {
  const value = Number(route.query.amount)
  return Number.isFinite(value) && value > 0 ? value : null
})

let redirectTimer = null

const goToGateway = () => {
  if (gatewayUrl.value) navigateTo(gatewayUrl.value, { external: true })
}

onMounted(() => {
  if (gatewayUrl.value) {
    redirectTimer = setTimeout(goToGateway, 1200)
  }
})

onBeforeUnmount(() => {
  if (redirectTimer) clearTimeout(redirectTimer)
})

useHead({ title: 'انتقال به درگاه پرداخت | داروخانه آنلاین' })
</script>
