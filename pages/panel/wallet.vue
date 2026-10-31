<!-- pages/panel/wallet.vue -->
<template>
  <div class="space-y-4">
    <h3 class="text-xl font-black text-gray-900 dark:text-white">
      کیف <span class="text-brand-500">پول</span>
    </h3>

    <div v-if="profile && !walletEnabled" class="text-center py-16">
      <UIcon name="i-heroicons-wallet" class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto" />
      <h4 class="text-base font-bold text-gray-900 dark:text-white mt-4 mb-2">کیف پول فعال نیست</h4>
      <p class="text-sm text-gray-500 dark:text-gray-400">این فروشگاه از کیف پول استفاده نمی‌کند.</p>
    </div>

    <template v-else>
      <UCard>
        <div class="relative">
          <Transition name="sk">
            <div v-if="loadingWallet" key="skeleton" class="space-y-3">
              <USkeleton class="h-4 w-24" />
              <USkeleton class="h-9 w-48" />
            </div>
            <div v-else key="content" class="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">موجودی کیف پول</p>
                <p class="text-3xl font-black text-gray-900 dark:text-white mt-1">
                  {{ formatPrice(wallet?.balance ?? 0) }}
                </p>
              </div>
              <UButton color="primary" icon="i-heroicons-plus" @click="showTopUp = true">
                افزایش اعتبار
              </UButton>
            </div>
          </Transition>
        </div>
      </UCard>

      <UCard>
        <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">تراکنش‌ها</h4>
        <div class="relative">
          <Transition name="sk">
            <div v-if="loadingTransactions" key="skeleton" class="space-y-3">
              <USkeleton v-for="i in 3" :key="i" class="h-14 w-full rounded-xl" />
            </div>

            <div v-else-if="transactions.length" key="content">
              <div class="divide-y divide-gray-100 dark:divide-gray-800">
                <div v-for="tx in transactions" :key="tx.id" class="flex items-center gap-3 py-3">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">
                      {{ tx.typeLabel || tx.type }}
                      <NuxtLink
                        v-if="tx.orderId"
                        :to="`/panel/orders/${tx.orderId}`"
                        class="text-xs text-brand-500 dark:text-brand-400 hover:underline ms-1"
                      >
                        سفارش {{ tx.orderId.toLocaleString('fa-IR') }}
                      </NuxtLink>
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {{ formatDateTime(tx.createdAt) }}<template v-if="tx.note"> · {{ tx.note }}</template>
                    </p>
                  </div>
                  <div class="text-end flex-shrink-0">
                    <p
                      class="text-sm font-bold"
                      :class="Number(tx.amount) >= 0 ? 'text-success' : 'text-error'"
                      dir="ltr"
                    >
                      {{ Number(tx.amount) >= 0 ? '+' : '−' }}{{ Math.abs(Number(tx.amount)).toLocaleString('fa-IR') }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      مانده: {{ Number(tx.balanceAfter).toLocaleString('fa-IR') }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-if="totalPages > 1" class="flex justify-center pt-3">
                <UPagination v-model:page="pageNumber" :total="totalElements" :items-per-page="PAGE_SIZE" />
              </div>
            </div>

            <div v-else key="empty" class="text-center py-10">
              <UIcon name="i-heroicons-banknotes" class="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto" />
              <h4 class="text-base font-bold text-gray-900 dark:text-white mt-3 mb-1">تراکنشی وجود ندارد</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">با افزایش اعتبار، تراکنش‌ها اینجا نمایش داده می‌شوند</p>
            </div>
          </Transition>
        </div>
      </UCard>
    </template>

    <UModal v-model:open="showTopUp" title="افزایش اعتبار" description="مبلغ را به تومان وارد کنید و از طریق درگاه پرداخت کنید">
      <template #body>
        <form class="space-y-4" dir="rtl" @submit.prevent="topUp">
          <UFormField label="مبلغ (تومان)" :error="amountError">
            <UInput v-model="amount" inputmode="numeric" class="w-full" placeholder="۱۰۰٬۰۰۰" />
          </UFormField>
          <div class="flex gap-2 flex-wrap">
            <UButton
              v-for="preset in presets"
              :key="preset"
              color="neutral"
              variant="outline"
              size="xs"
              @click="amount = String(preset)"
            >
              {{ preset.toLocaleString('fa-IR') }}
            </UButton>
          </div>
          <UFormField label="درگاه پرداخت">
            <USelect v-model="gateway" :items="gatewayOptions" class="w-full" />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="outline" @click="showTopUp = false">انصراف</UButton>
            <UButton type="submit" color="primary" :loading="toppingUp">پرداخت</UButton>
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>

<script setup>
const PAGE_SIZE = 20

const app = useNuxtApp()
const toast = useAppToast()
const { formatPrice } = useFormat()
const { profile, walletEnabled } = useStoreProfile()

const wallet = ref(null)
const loadingWallet = ref(true)
const transactions = ref([])
const loadingTransactions = ref(true)
const pageNumber = ref(1) // UPagination is 1-based; BACK is 0-based
const totalElements = ref(0)
const totalPages = ref(0)

const formatDateTime = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('fa-IR')
}

async function fetchWallet() {
  try {
    wallet.value = (await app.$api.storefront.getMyWallet()).data.data ?? null
  } catch {
    wallet.value = null
  } finally {
    loadingWallet.value = false
  }
}

async function fetchTransactions() {
  loadingTransactions.value = true
  try {
    const response = await app.$api.storefront.listWalletTransactions({
      params: { page: pageNumber.value - 1, size: PAGE_SIZE },
    })
    const page = response.data.data
    transactions.value = page?.content ?? []
    totalElements.value = page?.totalElements ?? 0
    totalPages.value = page?.totalPages ?? 0
  } catch {
    transactions.value = []
  } finally {
    loadingTransactions.value = false
  }
}

watch(pageNumber, fetchTransactions)
onMounted(() => {
  fetchWallet()
  fetchTransactions()
})

// ---------- top-up ----------
const showTopUp = ref(false)
const toppingUp = ref(false)
const amount = ref('')
const amountError = ref('')
const gateway = ref('MOCK')
const presets = [100000, 500000, 1000000]
const gatewayOptions = [
  { value: 'MOCK', label: 'درگاه آزمایشی' },
  { value: 'ZARINPAL', label: 'زرین‌پال' },
]

async function topUp() {
  const value = Number(String(amount.value).replace(/[^\d]/g, ''))
  amountError.value = value > 0 ? '' : 'مبلغ معتبر وارد کنید'
  if (amountError.value) return

  toppingUp.value = true
  try {
    const response = await app.$api.storefront.topUpWallet({
      // The form is in Toman; BACK's amounts are Rials
      data: { amount: value * 10, gateway: gateway.value, returnOrigin: window.location.origin },
    })
    const result = response.data.data
    await navigateTo({
      path: '/checkout/redirect',
      query: { url: result.paymentUrl, gateway: gateway.value, amount: value },
    })
  } catch (error) {
    toast.error('شروع پرداخت ناموفق بود', paymentErrorMessage(error))
  } finally {
    toppingUp.value = false
  }
}

useHead({ title: 'کیف پول | پنل کاربری' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
