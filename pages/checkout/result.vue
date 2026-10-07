<template>
  <UContainer>
    <div class="py-20 flex flex-col items-center text-center max-w-md mx-auto">
      <UIcon :name="resultView.icon" class="w-20 h-20" :class="resultView.iconClass" />

      <h1 class="text-2xl font-black text-gray-900 dark:text-white mt-6 mb-2">
        {{ resultView.title }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        {{ resultView.description }}
      </p>

      <div
        v-if="orderId"
        class="w-full rounded-xl bg-gray-50 dark:bg-gray-800/60 p-4 mb-8 text-sm space-y-2"
      >
        <div class="flex justify-between">
          <span class="text-gray-500 dark:text-gray-400">شماره سفارش</span>
          <span class="font-bold text-gray-900 dark:text-white">{{
            orderId.toLocaleString('fa-IR')
          }}</span>
        </div>
        <div v-if="refId" class="flex justify-between">
          <span class="text-gray-500 dark:text-gray-400">کد پیگیری</span>
          <span class="font-bold text-gray-900 dark:text-white" dir="ltr">{{
            refId
          }}</span>
        </div>
      </div>

      <div class="flex gap-3">
        <UButton color="primary" to="/account" icon="i-heroicons-list-bullet">
          مشاهده سفارش‌های من
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          to="/medications"
          icon="i-heroicons-shopping-bag"
        >
          ادامه خرید
        </UButton>
      </div>
    </div>
  </UContainer>
</template>

<script setup>
const route = useRoute()

const status = computed(() => route.query.status ?? null)
const orderId = computed(() => {
  const value = Number(route.query.orderId)
  return Number.isFinite(value) && route.query.orderId ? value : null
})
const refId = computed(() => route.query.refId ?? route.query.paymentToken ?? null)

const SUCCESS_STATUSES = ['COMPLETED', 'VERIFIED']
const FAILURE_STATUSES = ['FAILED', 'CANCELED', 'EXPIRED']

const resultView = computed(() => {
  if (SUCCESS_STATUSES.includes(status.value)) {
    return {
      icon: 'i-heroicons-check-circle',
      iconClass: 'text-success',
      title: 'پرداخت با موفقیت انجام شد',
      description: 'سفارش شما ثبت شد و به زودی پردازش می‌شود.',
    }
  }

  if (FAILURE_STATUSES.includes(status.value)) {
    return {
      icon: 'i-heroicons-x-circle',
      iconClass: 'text-error',
      title: 'پرداخت ناموفق بود',
      description: 'متاسفانه پرداخت شما انجام نشد. می‌توانید دوباره تلاش کنید.',
    }
  }

  return {
    icon: 'i-heroicons-clock',
    iconClass: 'text-warning',
    title: 'در انتظار تایید پرداخت',
    description: 'نتیجه پرداخت هنوز دریافت نشده است؛ لطفاً سفارش‌های خود را بررسی کنید.',
  }
})

useHead({ title: 'نتیجه پرداخت | داروخانه آنلاین' })
</script>
