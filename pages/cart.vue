<template>
  <div>
    <UContainer>
      <div class="py-12">
        <!-- Page Header -->
        <div class="mb-12">
          <h1
            class="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4"
          >
            سبد <span class="text-brand-500">خرید</span>
          </h1>
        </div>

        <!-- Empty Cart -->
        <div v-if="!cartStore.hasItems" class="text-center py-20">
          <UIcon
            name="i-heroicons-shopping-cart"
            class="w-24 h-24 text-gray-300 mx-auto mb-6"
          />
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            سبد خرید شما خالی است
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-8">
            محصولی به سبد خرید اضافه نکرده‌اید
          </p>
          <UButton
            size="xl"
            color="primary"
            to="/medications"
            icon="i-heroicons-shopping-bag"
          >
            مشاهده محصولات
          </UButton>
        </div>

        <!-- Cart Items -->
        <div v-else class="grid lg:grid-cols-3 gap-8">
          <!-- Items List -->
          <div class="lg:col-span-2 space-y-4">
            <UCard v-for="item in cartStore.items" :key="item.id">
              <!-- Desktop Layout -->
              <div class="hidden md:flex gap-4">
                <!-- Product Image -->
                <div
                  class="w-12 h-12 md:w-24 md:h-24 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0"
                >
                  <UIcon
                    name="i-heroicons-cube"
                    class="w-6 h-6 md:w-12 md:h-12 text-gray-300"
                  />
                </div>

                <!-- Product Info -->
                <div class="flex-1 min-w-0">
                  <h3
                    class="font-bold text-lg text-gray-900 dark:text-white mb-1"
                  >
                    {{ item.name }}
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {{ item.category }}
                  </p>

                  <div class="flex items-center gap-4">
                    <!-- Quantity Controls -->
                    <div class="flex items-center gap-2">
                      <UButton
                        size="sm"
                        icon="i-heroicons-plus"
                        square
                        @click="increaseQuantity(item.id)"
                      />
                      <span class="w-12 text-center font-bold">{{
                        item.quantity
                      }}</span>
                      <UButton
                        size="sm"
                        icon="i-heroicons-minus"
                        square
                        @click="decreaseQuantity(item.id)"
                      />
                    </div>

                    <!-- Price -->
                    <div class="text-lg font-black text-brand-400">
                      {{ (item.price * item.quantity).toLocaleString('fa-IR') }}
                      تومان
                    </div>
                  </div>
                </div>

                <!-- Remove Button -->
                <UButton
                  variant="ghost"
                  icon="i-heroicons-trash"
                  square
                  @click="removeItem(item.id)"
                />
              </div>

              <!-- Mobile Layout -->
              <div class="md:hidden">
                <div class="flex gap-3 mb-4">
                  <!-- Product Image -->
                  <div
                    class="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0"
                  >
                    <UIcon
                      name="i-heroicons-cube"
                      class="w-10 h-10 text-gray-300"
                    />
                  </div>

                  <!-- Product Info -->
                  <div class="flex-1 min-w-0">
                    <h3
                      class="font-bold text-base text-gray-900 dark:text-white mb-1"
                    >
                      {{ item.name }}
                    </h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ item.category }}
                    </p>
                  </div>

                  <!-- Remove Button -->
                  <div class="self-start">
                    <UButton
                      variant="ghost"
                      icon="i-heroicons-trash"
                      size="sm"
                      square
                      @click="removeItem(item.id)"
                    />
                  </div>
                </div>

                <!-- Quantity and Price Row -->
                <div
                  class="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700"
                >
                  <!-- Quantity Controls -->
                  <div class="flex items-center gap-2">
                    <UButton
                      size="sm"
                      icon="i-heroicons-minus"
                      square
                      @click="decreaseQuantity(item.id)"
                    />
                    <span class="w-10 text-center font-bold text-sm">{{
                      item.quantity
                    }}</span>
                    <UButton
                      size="sm"
                      icon="i-heroicons-plus"
                      square
                      @click="increaseQuantity(item.id)"
                    />
                  </div>

                  <!-- Price -->
                  <div class="text-base font-black text-brand-500">
                    {{ (item.price * item.quantity).toLocaleString('fa-IR') }}
                    تومان
                  </div>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Order Summary -->
          <div class="lg:col-span-1">
            <UCard>
              <div class="space-y-4">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                  خلاصه سفارش
                </h3>

                <div
                  class="space-y-3 py-4 border-y border-gray-200 dark:border-gray-800"
                >
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400"
                      >جمع محصولات:</span
                    >
                    <span class="font-bold"
                      >{{
                        cartStore.subtotal.toLocaleString('fa-IR')
                      }}
                      تومان</span
                    >
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400"
                      >هزینه ارسال:</span
                    >
                    <span
                      class="font-black"
                      :class="shippingCost > 0 ? '' : 'text-brand-300'"
                    >
                      {{
                        shippingCost > 0
                          ? shippingCost.toLocaleString('fa-IR') + ' تومان'
                          : 'رایگان'
                      }}
                    </span>
                  </div>
                </div>

                <div class="flex justify-between text-lg">
                  <span class="font-bold text-gray-900 dark:text-white"
                    >جمع کل:</span
                  >
                  <span class="font-black text-brand-300 text-2xl">
                    {{ cartStore.total.toLocaleString('fa-IR') }} تومان
                  </span>
                </div>

                <UButton
                  block
                  size="xl"
                  color="primary"
                  icon="i-heroicons-shopping-bag"
                  @click="handleCheckout"
                >
                  تکمیل خرید
                </UButton>

                <div
                  class="text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  <UIcon
                    name="i-heroicons-shield-check"
                    class="w-4 h-4 inline"
                  />
                  پرداخت امن
                </div>
              </div>
            </UCard>

            <!-- Free Shipping Notice -->
            <UCard v-if="cartStore.subtotal < 500000" class="mt-4">
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-heroicons-truck"
                  class="w-6 h-6 text-brand-500"
                />
                <div class="text-sm">
                  <div class="font-bold text-gray-900 dark:text-white">
                    {{ (500000 - cartStore.subtotal).toLocaleString('fa-IR') }}
                    تومان تا ارسال رایگان
                  </div>
                  <div class="text-gray-500">برای خرید بالای ۵۰۰,۰۰۰ تومان</div>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </UContainer>

    <!-- Auth Modal -->
    <AuthModal v-model="showAuthModal" @authenticated="handleAuthenticated" />

    <UModal
      v-model:open="isCheckoutModalOpen"
      :ui="{ content: 'sm:max-w-lg p-0 gap-0 overflow-hidden' }"
    >
      <template #content>
        <div class="flex flex-col max-h-[90vh] font-dana" dir="rtl">
          <div
            class="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
          >
            <div class="flex items-center gap-3 px-5 py-4">
              <div
                class="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0"
              >
                <UIcon
                  name="i-heroicons-shopping-bag"
                  class="w-4 h-4 text-brand-500"
                />
              </div>
              <h3
                class="flex-1 text-sm font-semibold text-gray-900 dark:text-white"
              >
                {{ orderPlaced ? 'سفارش ثبت شد' : 'تکمیل خرید' }}
              </h3>
              <button
                class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                @click="closeCheckoutModal"
              >
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            v-if="orderPlaced"
            class="px-5 py-8 flex flex-col items-center text-center gap-4"
          >
            <UIcon
              name="i-heroicons-check-circle"
              class="w-16 h-16 text-success"
            />
            <div>
              <p class="font-bold text-gray-900 dark:text-white mb-1">
                سفارش شما با موفقیت ثبت شد
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                شماره سفارش:
                {{ orderPlaced.orderId?.toLocaleString('fa-IR') }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                مبلغ سفارش هنگام تحویل دریافت می‌شود
              </p>
            </div>
            <UButton color="primary" to="/account" @click="closeCheckoutModal">
              مشاهده سفارش‌های من
            </UButton>
          </div>

          <template v-else>
            <div class="overflow-y-auto flex-1 px-5 py-5 space-y-5">
              <div class="space-y-2">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  روش تحویل
                </p>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="method in deliveryMethods"
                    :key="method.value"
                    :class="[
                      'flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-colors',
                      deliveryMethod === method.value
                        ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 text-brand-500'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600',
                    ]"
                    @click="deliveryMethod = method.value"
                  >
                    <UIcon :name="method.icon" class="w-5 h-5" />
                    <span class="text-xs font-medium">{{ method.label }}</span>
                  </button>
                </div>
              </div>

              <UFormField
                v-if="deliveryMethod === 'DELIVERY'"
                label="آدرس ارسال"
                name="addressId"
              >
                <USelectMenu
                  v-model="selectedAddressObj"
                  :items="addressItems"
                  placeholder="انتخاب آدرس"
                  class="w-full"
                >
                  <template #item="{ item }">
                    <span class="font-dana">{{
                      item.title || item.fullAddress
                    }}</span>
                  </template>
                  <template #empty>
                    <span class="text-gray-400 font-dana"
                      >آدرسی ثبت نشده است</span
                    >
                  </template>
                </USelectMenu>
                <template v-if="!addresses.length" #help>
                  <NuxtLink to="/panel/address" class="text-brand-500">
                    افزودن آدرس جدید
                  </NuxtLink>
                </template>
              </UFormField>

              <label
                v-if="
                  deliveryMethod === 'DELIVERY' &&
                  quote?.payShippingOnDeliveryEnabled
                "
                :class="[
                  'flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-colors',
                  payShippingOnDelivery
                    ? 'bg-brand-500/5 dark:bg-brand-500/10 border-brand-500/40'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                ]"
              >
                <input
                  v-model="payShippingOnDelivery"
                  type="checkbox"
                  class="w-4 h-4 accent-[var(--color-brand-500)] flex-shrink-0"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300 select-none"
                  >هزینه ارسال هنگام تحویل پرداخت شود</span
                >
              </label>

              <div class="space-y-2">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  روش پرداخت
                </p>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    :class="[
                      'py-3 rounded-xl border-2 text-xs font-medium transition-colors',
                      paymentMethod === 'ONLINE'
                        ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 text-brand-500'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600',
                    ]"
                    @click="paymentMethod = 'ONLINE'"
                  >
                    پرداخت آنلاین
                  </button>
                  <button
                    :disabled="!quote?.cashOnDeliveryEnabled"
                    :class="[
                      'py-3 rounded-xl border-2 text-xs font-medium transition-colors',
                      !quote?.cashOnDeliveryEnabled
                        ? 'border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : paymentMethod === 'CASH_ON_DELIVERY'
                          ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 text-brand-500'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600',
                    ]"
                    @click="
                      quote?.cashOnDeliveryEnabled &&
                        (paymentMethod = 'CASH_ON_DELIVERY')
                    "
                  >
                    پرداخت در محل
                  </button>
                </div>
              </div>

              <UFormField
                v-if="paymentMethod === 'ONLINE'"
                label="درگاه پرداخت"
                name="gateway"
              >
                <USelectMenu
                  v-model="selectedGatewayObj"
                  :items="gatewayItems"
                  class="w-full"
                />
              </UFormField>

              <div
                class="space-y-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 p-4 text-sm"
              >
                <template v-if="isQuoting">
                  <USkeleton class="h-4 w-full" />
                  <USkeleton class="h-4 w-full" />
                  <USkeleton class="h-5 w-full" />
                </template>
                <template v-else-if="quote">
                  <div class="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>جمع کالاها</span>
                    <span>{{ formatPrice(quote.itemsTotal) }}</span>
                  </div>
                  <div class="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>هزینه ارسال</span>
                    <span>{{
                      quote.shippingCost > 0
                        ? formatPrice(quote.shippingCost)
                        : 'رایگان'
                    }}</span>
                  </div>
                  <div
                    class="flex justify-between font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700"
                  >
                    <span>مبلغ قابل پرداخت</span>
                    <span class="text-brand-500">{{
                      formatPrice(quote.total)
                    }}</span>
                  </div>
                  <p
                    v-if="quote.minOrderAmountMet === false"
                    class="text-error text-xs pt-1"
                  >
                    جمع سفارش کمتر از حداقل مجاز است
                  </p>
                </template>
              </div>

              <label
                class="flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-colors"
                :class="
                  acceptedTerms
                    ? 'bg-brand-500/5 dark:bg-brand-500/10 border-brand-500/40'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                "
              >
                <input
                  v-model="acceptedTerms"
                  type="checkbox"
                  class="w-4 h-4 accent-[var(--color-brand-500)] flex-shrink-0"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300 select-none">
                  قوانین و شرایط خرید را می‌پذیرم
                </span>
              </label>
            </div>

            <div
              class="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-5 py-4 flex justify-end gap-2"
            >
              <UButton variant="ghost" color="neutral" @click="closeCheckoutModal">
                انصراف
              </UButton>
              <UButton
                color="primary"
                :loading="isSubmittingCheckout"
                :disabled="
                  isQuoting ||
                  !quote ||
                  quote.minOrderAmountMet === false ||
                  (deliveryMethod === 'DELIVERY' && !selectedAddressId)
                "
                @click="confirmCheckout"
              >
                تایید و پرداخت
              </UButton>
            </div>
          </template>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import { useCartStore } from '~/stores/cart'
import { useUserStore } from '~/stores/user'

const app = useNuxtApp()
const cartStore = useCartStore()
const userStore = useUserStore()
const toast = useToast()
const { formatPrice } = useFormat()

const showAuthModal = ref(false)

const isCheckoutModalOpen = ref(false)
const isQuoting = ref(false)
const isSubmittingCheckout = ref(false)
const quote = ref(null)
const orderPlaced = ref(null)

const addresses = ref([])
const selectedAddressId = ref(null)

const deliveryMethod = ref('DELIVERY')
const payShippingOnDelivery = ref(false)
const paymentMethod = ref('ONLINE')
const gateway = ref('MOCK')
const acceptedTerms = ref(false)

const deliveryMethods = [
  { value: 'DELIVERY', label: 'ارسال به آدرس', icon: 'i-heroicons-truck' },
  { value: 'PICKUP', label: 'تحویل حضوری', icon: 'i-heroicons-building-storefront' },
]

const gatewayOptions = [
  { label: 'آزمایشی (Mock)', value: 'MOCK' },
  { label: 'زرین‌پال', value: 'ZARINPAL' },
]

const gatewayItems = gatewayOptions.map((g) => ({ ...g }))

const selectedGatewayObj = computed({
  get: () => gatewayItems.find((g) => g.value === gateway.value) ?? gatewayItems[0],
  set: (val) => {
    gateway.value = val?.value ?? 'MOCK'
  },
})

const addressItems = computed(() =>
  addresses.value.map((a) => ({
    ...a,
    label: a.title || a.fullAddress,
  }))
)

const selectedAddressObj = computed({
  get: () => addressItems.value.find((a) => a.id === selectedAddressId.value) ?? null,
  set: (val) => {
    selectedAddressId.value = val?.id ?? null
  },
})

const checkoutItems = computed(() =>
  cartStore.items.map((item) => ({
    goodsId: item.id,
    batchId: item.batchId ?? null,
    quantity: item.quantity,
  }))
)

const shippingCost = computed(() => (cartStore.subtotal > 500000 ? 0 : 59900))

async function loadAddresses() {
  const personId = userStore.currentUser?.person?.id
  if (!personId) {
    addresses.value = []
    return
  }
  try {
    const response = await app.$api.address.getAddresses({ data: { personId } })
    addresses.value = response.data.data ?? []
    const defaultAddress =
      addresses.value.find((a) => a.isDefault) ?? addresses.value[0] ?? null
    selectedAddressId.value = defaultAddress?.id ?? null
  } catch {
    addresses.value = []
  }
}

async function fetchQuote() {
  isQuoting.value = true
  try {
    const response = await app.$api.payments.quote({
      data: {
        items: checkoutItems.value,
        deliveryMethod: deliveryMethod.value,
        payShippingOnDelivery: payShippingOnDelivery.value,
      },
    })
    quote.value = response.data.data
  } catch (error) {
    quote.value = null
    const message = error?.response?.data?.message ?? 'خطا در محاسبه مبلغ سفارش'
    toast.add({ title: message, icon: 'i-heroicons-exclamation-circle', color: 'error' })
  } finally {
    isQuoting.value = false
  }
}

watch([deliveryMethod, payShippingOnDelivery], () => {
  if (isCheckoutModalOpen.value) fetchQuote()
})

function handleCheckout() {
  if (app.$auth.loggedIn) {
    proceedToCheckout()
  } else {
    return navigateTo('/login?redirect=/cart')
  }
}

function handleAuthenticated() {
  showAuthModal.value = false
  proceedToCheckout()
}

async function proceedToCheckout() {
  orderPlaced.value = null
  isCheckoutModalOpen.value = true
  await Promise.all([loadAddresses(), fetchQuote()])
}

function closeCheckoutModal() {
  isCheckoutModalOpen.value = false
}

async function confirmCheckout() {
  if (!acceptedTerms.value) {
    toast.add({
      title: 'برای ادامه باید قوانین و شرایط را بپذیرید',
      icon: 'i-heroicons-exclamation-circle',
      color: 'error',
    })
    return
  }

  if (deliveryMethod.value === 'DELIVERY' && !selectedAddressId.value) {
    toast.add({
      title: 'لطفاً یک آدرس برای ارسال انتخاب کنید',
      icon: 'i-heroicons-exclamation-circle',
      color: 'error',
    })
    return
  }

  isSubmittingCheckout.value = true
  try {
    const response = await app.$api.payments.checkout({
      data: {
        personId: userStore.currentUser?.person?.id,
        items: checkoutItems.value,
        deliveryMethod: deliveryMethod.value,
        addressId: deliveryMethod.value === 'DELIVERY' ? selectedAddressId.value : null,
        payShippingOnDelivery: payShippingOnDelivery.value,
        paymentMethod: paymentMethod.value,
        gateway: gateway.value,
        acceptedTerms: acceptedTerms.value,
      },
    })

    const result = response.data.data

    if (result?.paymentUrl) {
      cartStore.clearCart()
      await navigateTo(result.paymentUrl, { external: true })
      return
    }

    if (result?.cashOnDelivery) {
      orderPlaced.value = result
      cartStore.clearCart()
      toast.add({
        title: 'سفارش شما با موفقیت ثبت شد',
        icon: 'i-heroicons-check-circle',
        color: 'success',
      })
      return
    }

    toast.add({
      title: 'سفارش ثبت شد اما لینک پرداخت دریافت نشد',
      icon: 'i-heroicons-exclamation-circle',
      color: 'error',
    })
  } catch (error) {
    const message = error?.response?.data?.message ?? 'خطا در ثبت سفارش'
    toast.add({ title: message, icon: 'i-heroicons-exclamation-circle', color: 'error' })
  } finally {
    isSubmittingCheckout.value = false
  }
}

function increaseQuantity(productId) {
  const item = cartStore.items.find((i) => i.id === productId)
  if (item) {
    cartStore.updateQuantity(productId, item.quantity + 1)
  }
}

function decreaseQuantity(productId) {
  const item = cartStore.items.find((i) => i.id === productId)
  if (item && item.quantity > 0) {
    cartStore.updateQuantity(productId, item.quantity - 1)
  }
}

function removeItem(productId) {
  cartStore.removeItem(productId)
  toast.add({
    title: 'از سبد خرید حذف شد',
    icon: 'i-heroicons-trash',
    color: 'error',
  })
}

useHead({
  title: 'سبد خرید | داروخانه آنلاین',
})
</script>

<style scoped>
input[type='tel']::-webkit-outer-spin-button,
input[type='tel']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='tel'] {
  -moz-appearance: textfield;
}
</style>
