<template>
  <UContainer>
    <div class="py-20 flex flex-col items-center text-center max-w-md mx-auto">
      <div class="relative w-full flex flex-col items-center">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="w-full flex flex-col items-center">
            <USkeleton class="w-20 h-20 rounded-full" />
            <USkeleton class="h-8 w-56 mt-6 mb-2" />
            <USkeleton class="h-5 w-72 mb-6" />
            <USkeleton class="h-24 w-full rounded-xl mb-8" />
          </div>

          <div v-else key="content" class="w-full flex flex-col items-center">
            <UIcon :name="resultView.icon" class="w-20 h-20" :class="resultView.iconClass" />

            <h1 class="text-2xl font-black text-gray-900 dark:text-white mt-6 mb-2">
              {{ resultView.title }}
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              {{ resultView.description }}
            </p>

            <div
              v-if="detailRows.length"
              class="w-full rounded-xl bg-gray-50 dark:bg-gray-800/60 p-4 mb-8 text-sm space-y-2"
            >
              <div v-for="row in detailRows" :key="row.label" class="flex justify-between">
                <span class="text-gray-500 dark:text-gray-400">{{ row.label }}</span>
                <span class="font-bold text-gray-900 dark:text-white" :dir="row.ltr ? 'ltr' : undefined">{{
                  row.value
                }}</span>
              </div>
            </div>

            <div class="flex gap-3">
              <UButton
                v-if="orderId"
                color="primary"
                :to="`/panel/orders/${orderId}`"
                icon="i-heroicons-list-bullet"
              >
                مشاهده سفارش
              </UButton>
              <UButton
                v-else
                color="primary"
                to="/panel/wallet"
                icon="i-heroicons-wallet"
              >
                مشاهده کیف پول
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
        </Transition>
      </div>
    </div>
  </UContainer>
</template>

<script setup>
// Post-payment landing page. BACK 302s the browser here after the bank callback:
// /checkout/result?status=…&orderId=… (or walletTopUp=true)&paymentToken=PAY-…
const route = useRoute()
const app = useNuxtApp()
const { formatPrice } = useFormat()

// BACK's PaymentStatus enum: COMPLETED/VERIFIED succeed; FAILED/CANCELED/EXPIRED fail; anything else is pending
const SUCCESS_STATUSES = ['COMPLETED', 'VERIFIED']
const FAILURE_STATUSES = ['FAILED', 'CANCELED', 'EXPIRED']

const paymentToken = computed(() =>
  typeof route.query.paymentToken === 'string' ? route.query.paymentToken : null
)
const orderId = computed(() => {
  const value = Number(route.query.orderId)
  return Number.isFinite(value) && route.query.orderId ? value : null
})
const isWalletTopUp = computed(() => route.query.walletTopUp === 'true')

const loading = ref(true)
const payment = ref(null)
const order = ref(null)

// The API result wins over the query string (the URL is user-editable); the query is only the fallback
const status = computed(() => payment.value?.status ?? route.query.status ?? null)

const resultView = computed(() => {
  if (SUCCESS_STATUSES.includes(status.value)) {
    return {
      icon: 'i-heroicons-check-circle',
      iconClass: 'text-success',
      title: 'پرداخت با موفقیت انجام شد',
      description: isWalletTopUp.value
        ? 'مبلغ به کیف پول شما اضافه شد.'
        : 'سفارش شما ثبت شد و به زودی پردازش می‌شود.',
    }
  }

  if (FAILURE_STATUSES.includes(status.value)) {
    return {
      icon: 'i-heroicons-x-circle',
      iconClass: 'text-error',
      title: 'پرداخت ناموفق بود',
      description:
        payment.value?.statusMessage ||
        'متاسفانه پرداخت شما انجام نشد. می‌توانید دوباره تلاش کنید.',
    }
  }

  return {
    icon: 'i-heroicons-clock',
    iconClass: 'text-warning',
    title: 'در انتظار تایید پرداخت',
    description: 'نتیجه پرداخت هنوز دریافت نشده است؛ لطفاً سفارش‌های خود را بررسی کنید.',
  }
})

const formatDateTime = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('fa-IR')
}

// The payment result is in Rials (currency "IRR"); the storefront displays Toman
const paymentAmountToman = computed(() => {
  const amount = payment.value?.amount
  if (amount == null) return null
  return payment.value.currency === 'IRR' ? amount / 10 : amount
})

const detailRows = computed(() => {
  const rows = []
  if (orderId.value) {
    rows.push({ label: 'شماره سفارش', value: orderId.value.toLocaleString('fa-IR') })
  }
  const paid = paymentAmountToman.value ?? order.value?.totalAmount
  if (paid != null) rows.push({ label: 'مبلغ', value: formatPrice(paid) })
  const refId = payment.value?.refId ?? paymentToken.value
  if (refId) rows.push({ label: 'کد پیگیری', value: refId, ltr: true })
  if (payment.value?.maskedCardNumber) {
    rows.push({ label: 'شماره کارت', value: payment.value.maskedCardNumber, ltr: true })
  }
  if (payment.value?.paidAt) {
    rows.push({ label: 'زمان پرداخت', value: formatDateTime(payment.value.paidAt) })
  }
  return rows
})

async function loadResult() {
  // The payment result is public; the order needs login. Either failing is fine — the page still renders from the query.
  const [paymentRes, orderRes] = await Promise.allSettled([
    paymentToken.value ? app.$api.payments.getPaymentResult(paymentToken.value) : Promise.reject(),
    orderId.value ? app.$api.orders.getOrder({ data: { id: orderId.value } }) : Promise.reject(),
  ])
  if (paymentRes.status === 'fulfilled') payment.value = paymentRes.value.data.data ?? null
  if (orderRes.status === 'fulfilled') order.value = orderRes.value.data.data ?? null
  loading.value = false
}

onMounted(loadResult)

useHead({ title: 'نتیجه پرداخت | داروخانه آنلاین' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
