<!-- components/checkout/CheckoutModal.vue -->
<template>
  <UModal
    :open="open"
    :ui="{ content: 'sm:max-w-lg p-0 gap-0 overflow-hidden' }"
    @update:open="emit('update:open', $event)"
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
              {{ orderPlaced.paidByWallet ? 'مبلغ سفارش از کیف پول پرداخت شد' : 'مبلغ سفارش هنگام تحویل دریافت می‌شود' }}
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
                روش ارسال
              </p>
              <template v-if="methodsLoading">
                <USkeleton class="h-16 w-full rounded-xl" />
                <USkeleton class="h-16 w-full rounded-xl" />
              </template>
              <p
                v-else-if="!methods.length"
                class="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                روش ارسالی برای این آدرس وجود ندارد
              </p>
              <div v-else class="space-y-2" role="radiogroup" aria-label="روش ارسال">
                <button
                  v-for="method in methods"
                  :key="method.id"
                  type="button"
                  role="radio"
                  :aria-checked="method.id === shippingMethodId"
                  :class="[
                    'w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-start transition-colors',
                    method.id === shippingMethodId
                      ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                  ]"
                  @click="shippingMethodId = method.id"
                >
                  <UIcon
                    :name="method.deliveryMethod === 'PICKUP' ? 'i-heroicons-building-storefront' : 'i-heroicons-truck'"
                    :class="[
                      'w-5 h-5 mt-0.5 flex-shrink-0',
                      method.id === shippingMethodId ? 'text-brand-500' : 'text-gray-400',
                    ]"
                  />
                  <div class="flex-1 min-w-0 space-y-0.5">
                    <p class="text-sm font-bold text-gray-900 dark:text-white">{{ method.title }}</p>
                    <p v-if="method.description" class="text-xs text-gray-500 dark:text-gray-400">
                      {{ method.description }}
                    </p>
                    <p v-if="deliveryWindow(method)" class="text-xs text-gray-600 dark:text-gray-400">
                      {{ deliveryWindow(method) }}
                    </p>
                    <p v-if="method.freeShippingThreshold" class="text-xs text-gray-500 dark:text-gray-400">
                      ارسال رایگان برای خرید بالای {{ formatPrice(method.freeShippingThreshold) }}
                    </p>
                  </div>
                  <span
                    class="text-sm font-black flex-shrink-0"
                    :class="method.cost > 0 ? 'text-gray-900 dark:text-white' : 'text-brand-500'"
                  >
                    {{ costText(method) }}
                  </span>
                </button>
              </div>
              <p v-if="quote?.shippingCovered === false" class="text-warning text-xs">
                این روش به آدرس انتخاب‌شده ارسال نمی‌شود
              </p>
            </div>
            <div v-if="selectedMethod?.slotsEnabled" class="space-y-2">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                بازه‌ی مراجعه
              </p>
              <div v-if="slotsLoading" class="grid grid-cols-2 gap-2">
                <USkeleton class="h-14 w-full rounded-xl" />
                <USkeleton class="h-14 w-full rounded-xl" />
              </div>
              <p v-else-if="slotsError" class="text-sm text-error">
                بازه‌های مراجعه دریافت نشد
              </p>
              <p
                v-else-if="!slots.length"
                class="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                فعلاً بازه‌ی آزادی نیست
              </p>
              <div v-else class="grid grid-cols-2 gap-2">
                <button
                  v-for="slot in slots"
                  :key="slot.start"
                  type="button"
                  :disabled="!slot.available"
                  :aria-pressed="slot.start === selectedSlotStart"
                  :class="[
                    'flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 text-xs font-medium transition-colors',
                    !slot.available
                      ? 'border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      : slot.start === selectedSlotStart
                        ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 text-brand-500'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
                  ]"
                  @click="selectedSlotStart = slot.start"
                >
                  <span>{{ slot.label }}</span>
                  <UBadge v-if="slot.remaining != null" color="neutral" variant="soft" size="xs">
                    {{ slot.remaining.toLocaleString('fa-IR') }} جا
                  </UBadge>
                </button>
              </div>
            </div>

            <div
              v-if="selectedMethod?.type === 'CUSTOMER_COURIER'"
              class="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <UFormField label="نام پیک (اختیاری)" name="courierName">
                <UInput v-model="courierName" :maxlength="100" class="w-full" />
              </UFormField>
              <UFormField label="موبایل پیک (اختیاری)" name="courierPhone" :error="courierPhoneError">
                <UInput
                  v-model="courierPhone"
                  inputmode="tel"
                  dir="ltr"
                  :maxlength="20"
                  placeholder="09121234567"
                  class="w-full"
                />
              </UFormField>
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
              v-if="selectedMethod?.payOnDeliveryAllowed"
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
                  :disabled="noGatewayAvailable"
                  :class="[
                    'py-3 rounded-xl border-2 text-xs font-medium transition-colors',
                    paymentMethod === 'ONLINE'
                      ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 text-brand-500'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600',
                    noGatewayAvailable ? 'opacity-50 cursor-not-allowed' : '',
                  ]"
                  @click="paymentMethod = 'ONLINE'"
                >
                  پرداخت آنلاین
                </button>
                <button
                  v-if="canCashOnDelivery"
                  :class="[
                    'py-3 rounded-xl border-2 text-xs font-medium transition-colors',
                    paymentMethod === 'CASH_ON_DELIVERY'
                      ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 text-brand-500'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600',
                  ]"
                  @click="paymentMethod = 'CASH_ON_DELIVERY'"
                >
                  پرداخت در محل
                </button>
              </div>
            </div>

            <p v-if="noGatewayAvailable" class="text-error text-xs">
              درگاه پرداختی فعال نیست
            </p>

            <div
              v-if="walletOffered"
              class="space-y-2"
            >
              <div
                :class="[
                  'flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 transition-colors',
                  walletActive
                    ? 'bg-brand-500/5 dark:bg-brand-500/10 border-brand-500/40'
                    : 'border-gray-200 dark:border-gray-700',
                ]"
              >
                <span class="text-sm text-gray-700 dark:text-gray-300 select-none">
                  پرداخت از کیف پول (موجودی {{ formatPrice(walletBalance) }})
                </span>
                <USwitch v-model="useWallet" size="lg" :ui="SWITCH_UI" />
              </div>
              <div v-if="walletActive" class="space-y-1 px-1 text-xs text-gray-600 dark:text-gray-400">
                <p>پرداخت از کیف پول: {{ formatPrice(walletCovered) }}</p>
                <p v-if="onlineRest > 0">باقی‌مانده با درگاه: {{ formatPrice(onlineRest) }}</p>
              </div>
            </div>

            <UFormField
              v-if="gatewayRequired && gatewayItems.length"
              label="درگاه پرداخت"
              name="gateway"
            >
              <USelectMenu
                v-model="selectedGatewayObj"
                :items="gatewayItems"
                class="w-full"
              />
            </UFormField>
            <USkeleton v-else-if="gatewayRequired && !gatewaysLoaded" class="h-10 w-full rounded-xl" />

            <div v-if="!quote?.discountCode" class="space-y-2">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                کد تخفیف
              </p>
              <div class="flex items-start gap-2">
                <UInput
                  v-model="discountInput"
                  dir="ltr"
                  :maxlength="50"
                  placeholder="کد تخفیف"
                  class="flex-1 min-w-0"
                  @keydown.enter.prevent="applyDiscountCode"
                />
                <UButton
                  color="neutral"
                  variant="outline"
                  :disabled="!discountInput.trim() || isQuoting"
                  @click="applyDiscountCode"
                >
                  اعمال
                </UButton>
              </div>
              <p v-if="quote?.discountCodeError" class="text-error text-xs">
                {{ quote.discountCodeError }}
              </p>
            </div>

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
                <div
                  v-if="quote.discountCode"
                  class="flex justify-between text-gray-600 dark:text-gray-400"
                >
                  <span class="flex items-center gap-2">
                    تخفیف کد
                    <bdi dir="ltr">{{ quote.discountCode }}</bdi>
                    <UButton
                      size="xs"
                      color="error"
                      variant="link"
                      :disabled="isQuoting"
                      @click="removeDiscountCode"
                    >
                      حذف کد
                    </UButton>
                  </span>
                  <span class="text-success">−{{ formatPrice(quote.discountAmount) }}</span>
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
              v-if="termsRequired !== false"
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
                !selectedMethod ||
                quote?.shippingCovered === false ||
                (deliveryMethod === 'DELIVERY' && !selectedAddressId) ||
                (selectedMethod?.slotsEnabled && !selectedSlotStart) ||
                Boolean(courierPhoneError) ||
                noGatewayAvailable ||
                (gatewayRequired && !gateway)
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
</template>

<script setup>
// Checkout dialog: addresses, price quote, delivery/payment choice and the order call. Opened by pages/cart.vue
// (`v-model:open`); opening it loads the addresses and a fresh quote.
import { useCartStore } from '~/stores/cart'
import { useUserStore } from '~/stores/user'
import { isValidPhoneNumber, normalizeIranianMobile } from '~/utils/validations.js'
import { GATEWAY_LABELS } from '~/utils/paymentMeta.js'

const props = defineProps({
  open: { type: Boolean, required: true },
})

const emit = defineEmits(['update:open'])

const app = useNuxtApp()
const cartStore = useCartStore()
const userStore = useUserStore()
const toast = useToast()
const { formatPrice } = useFormat()

const isQuoting = ref(false)
const isSubmittingCheckout = ref(false)
const quote = ref(null)
const orderPlaced = ref(null)

const addresses = ref([])
const selectedAddressId = ref(null)

// Public shipping methods for the current items total and address (ShippingOptionDTO[], covered ones only)
const methods = ref([])
const methodsLoading = ref(false)
const shippingMethodId = ref(null)
const selectedMethod = computed(() => methods.value.find((m) => m.id === shippingMethodId.value) ?? null)
// Address picker and pickup vs delivery follow the chosen method; DELIVERY until the methods load
const deliveryMethod = computed(() => selectedMethod.value?.deliveryMethod ?? 'DELIVERY')
const selectedAddress = computed(() => addresses.value.find((a) => a.id === selectedAddressId.value) ?? null)
let latestQuote = 0
let latestMethods = 0
// Watchers only refetch once the open flow has finished (see the open watch below)
let ready = false
let quoteTimer = null
// Pickup slot (slotsEnabled methods) and the optional courier of a customer-courier method (B1c)
const slots = ref([])
const slotsLoading = ref(false)
const slotsError = ref(false)
const selectedSlotStart = ref(null)
let latestSlots = 0
const courierName = ref('')
const courierPhone = ref('')
const courierPhoneError = computed(() => {
  const value = courierPhone.value.trim()
  if (!value) return ''
  return isValidPhoneNumber(normalizeIranianMobile(value)) ? '' : 'شماره موبایل پیک معتبر نیست'
})
// Store, method and quote must all allow cash on delivery
const canCashOnDelivery = computed(() =>
  Boolean(
    quote.value?.cashOnDeliveryEnabled &&
      selectedMethod.value?.cashOnDeliveryAllowed &&
      quote.value?.cashOnDeliveryAllowed !== false
  )
)
const payShippingOnDelivery = ref(false)
const paymentMethod = ref('ONLINE')

// Store gateways (GET api/payment/gateways, amount = quote total). eligible=false hides a gateway; default = first
const gatewayList = ref([])
const gatewaysLoaded = ref(false)
const gateway = ref(null)
let latestGateways = 0
let gatewayTimer = null
const gatewayItems = computed(() =>
  gatewayList.value.map((g) => ({
    label: g.title || GATEWAY_LABELS[g.gateway] || g.gateway,
    value: g.gateway,
  }))
)
const selectedGatewayObj = computed({
  get: () => gatewayItems.value.find((g) => g.value === gateway.value) ?? null,
  set: (val) => {
    gateway.value = val?.value ?? null
  },
})

// Discount: what the quotes send (`appliedDiscountRequest`) and the text in the input
const discountInput = ref('')
const appliedDiscountRequest = ref('')

// Wallet: the switch, and the store flag + the quote balance decide whether it is offered
const { walletEnabled } = useStoreProfile()
const useWallet = ref(false)

// Terms: null = not known yet (checkbox shown), false = nothing pending (hidden), true = required
const termsRequired = ref(null)
let latestTerms = 0
const acceptedTerms = ref(false)

const total = computed(() => Number(quote.value?.total ?? 0))
const walletBalance = computed(() => Number(quote.value?.walletBalance ?? 0))
// Offered for online payment with a balance; the switch hides when the method or the balance goes away
const walletOffered = computed(
  () => walletEnabled.value && paymentMethod.value === 'ONLINE' && walletBalance.value > 0
)
const walletActive = computed(() => walletOffered.value && useWallet.value)
const walletCovered = computed(() => (walletActive.value ? Math.min(walletBalance.value, total.value) : 0))
const onlineRest = computed(() =>
  paymentMethod.value === 'ONLINE' ? Math.max(total.value - walletCovered.value, 0) : 0
)
// The gateway is needed only when something is left to pay online
const gatewayRequired = computed(() => onlineRest.value > 0)
// The wallet alone can pay the whole quote, so no gateway is needed even when the store has none
const walletCoversTotal = computed(
  () => Boolean(quote.value) && walletEnabled.value && total.value > 0 && walletBalance.value >= total.value
)
const noGatewayAvailable = computed(
  () => gatewaysLoaded.value && !gatewayItems.value.length && !walletCoversTotal.value
)

const SWITCH_UI = {
  base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
}

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

// Before the methods load there is no method yet: the first quote only needs the items total
function quoteShippingFields() {
  if (!shippingMethodId.value) return { deliveryMethod: 'DELIVERY' }
  return {
    shippingMethodId: shippingMethodId.value,
    addressId: deliveryMethod.value === 'DELIVERY' ? selectedAddressId.value : null,
    payShippingOnDelivery: payShippingOnDelivery.value,
  }
}

async function fetchQuote() {
  const request = ++latestQuote
  isQuoting.value = true
  try {
    const response = await app.$api.payments.quote({
      data: {
        items: checkoutItems.value,
        discountCode: appliedDiscountRequest.value || null,
        ...quoteShippingFields(),
      },
    })
    if (request !== latestQuote) return
    quote.value = response.data.data
  } catch (error) {
    if (request !== latestQuote) return
    quote.value = null
    const message = error?.response?.data?.message ?? 'خطا در محاسبه مبلغ سفارش'
    toast.add({ title: message, icon: 'i-heroicons-exclamation-circle', color: 'error' })
  } finally {
    if (request === latestQuote) isQuoting.value = false
  }
}

// The amount and the destination decide each method's cost and coverage
async function loadMethods() {
  const request = ++latestMethods
  methodsLoading.value = true
  try {
    const response = await app.$api.shipping.listMethods({
      params: {
        amount: quote.value?.itemsTotal,
        provinceId: selectedAddress.value?.provinceId ?? undefined,
        cityId: selectedAddress.value?.cityId ?? undefined,
      },
    })
    if (request !== latestMethods) return
    methods.value = (response.data.data ?? []).filter((m) => m.covered !== false)
    // Keep the chosen method while it is still offered, otherwise take the first one
    if (!methods.value.some((m) => m.id === shippingMethodId.value)) {
      shippingMethodId.value = methods.value[0]?.id ?? null
    }
  } catch {
    if (request !== latestMethods) return
    methods.value = []
    shippingMethodId.value = null
  } finally {
    if (request === latestMethods) methodsLoading.value = false
  }
}

// Gateways follow the quote total (the store's eligibility depends on the amount); a failed call = no gateways
async function loadGateways() {
  const request = ++latestGateways
  try {
    const response = await app.$api.payments.listGateways({
      params: quote.value ? { amount: Math.round(total.value) } : {},
    })
    if (request !== latestGateways) return
    gatewayList.value = (response.data.data ?? []).filter((g) => g.eligible !== false)
    if (!gatewayItems.value.some((g) => g.value === gateway.value)) {
      gateway.value = gatewayItems.value[0]?.value ?? null
    }
  } catch {
    if (request !== latestGateways) return
    gatewayList.value = []
    gateway.value = null
  } finally {
    if (request === latestGateways) gatewaysLoaded.value = true
  }
}

// Pending terms decide whether the checkbox is needed. A failed call keeps it (and sends acceptedTerms)
async function loadTerms() {
  const request = ++latestTerms
  termsRequired.value = null
  try {
    const response = await app.$api.auth.getPendingTerms()
    if (request !== latestTerms) return
    const list = response.data.data
    termsRequired.value = !Array.isArray(list) || list.length > 0
  } catch {
    if (request !== latestTerms) return
    termsRequired.value = true
  }
}

// «اعمال»: the code goes into the next quote; a rejected code comes back as quote.discountCodeError
async function applyDiscountCode() {
  const code = discountInput.value.trim()
  if (!code || isQuoting.value) return
  appliedDiscountRequest.value = code
  await fetchQuote()
}

// «حذف کد»: clears the input and re-quotes without a code
async function removeDiscountCode() {
  discountInput.value = ''
  appliedDiscountRequest.value = ''
  await fetchQuote()
}

// Opening: addresses, terms, a first quote for the items total, the methods, the quote for the default method, then the gateways
watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      ready = false
      clearTimeout(quoteTimer)
      clearTimeout(gatewayTimer)
      return
    }
    orderPlaced.value = null
    ready = false
    gatewaysLoaded.value = false
    loadTerms()
    await loadAddresses()
    await fetchQuote()
    await loadMethods()
    await fetchQuote()
    await loadGateways()
    ready = props.open
  }
)

// Debounced: a new total (shipping, discount, wallet choice) re-asks the gateways for the new amount
watch(
  () => quote.value?.total,
  () => {
    if (!ready) return
    clearTimeout(gatewayTimer)
    gatewayTimer = setTimeout(loadGateways, 300)
  }
)

// The wallet is only offered for online payment: switching to cash on delivery drops the choice
watch(walletOffered, (offered) => {
  if (!offered) useWallet.value = false
})

watch(selectedAddressId, () => {
  if (ready) loadMethods()
})

// Debounced: quick option changes send one quote, not one per click
watch([shippingMethodId, selectedAddressId, payShippingOnDelivery], () => {
  if (!ready) return
  clearTimeout(quoteTimer)
  quoteTimer = setTimeout(fetchQuote, 300)
})

// A new method resets what depended on the old one
watch(
  () => shippingMethodId.value,
  () => {
    selectedSlotStart.value = null
    if (!selectedMethod.value?.payOnDeliveryAllowed) payShippingOnDelivery.value = false
    if (selectedMethod.value?.type !== 'CUSTOMER_COURIER') {
      courierName.value = ''
      courierPhone.value = ''
    }
    if (props.open) loadSlots()
  }
)

watch(canCashOnDelivery, (allowed) => {
  if (!allowed) paymentMethod.value = 'ONLINE'
})

async function loadSlots() {
  const request = ++latestSlots
  const method = selectedMethod.value
  slotsError.value = false
  if (!method?.slotsEnabled) {
    slots.value = []
    slotsLoading.value = false
    return
  }
  slotsLoading.value = true
  try {
    const response = await app.$api.shipping.listSlots(method.id)
    if (request !== latestSlots) return
    slots.value = response.data.data ?? []
  } catch {
    if (request !== latestSlots) return
    slots.value = []
    slotsError.value = true
  } finally {
    if (request === latestSlots) slotsLoading.value = false
  }
}

onBeforeUnmount(() => {
  clearTimeout(quoteTimer)
  clearTimeout(gatewayTimer)
})

function deliveryWindow(method) {
  if (method.expressMinutes) {
    return `ارسال فوری تا ${method.expressMinutes.toLocaleString('fa-IR')} دقیقه`
  }
  if (method.minDeliveryDays != null && method.maxDeliveryDays != null) {
    return `${method.minDeliveryDays.toLocaleString('fa-IR')} تا ${method.maxDeliveryDays.toLocaleString('fa-IR')} روز`
  }
  return ''
}

function costText(method) {
  return method.cost > 0 ? formatPrice(method.cost) : 'رایگان'
}

function closeCheckoutModal() {
  emit('update:open', false)
}

async function confirmCheckout() {
  if (termsRequired.value !== false && !acceptedTerms.value) {
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

  if (selectedMethod.value?.slotsEnabled && !selectedSlotStart.value) {
    toast.add({
      title: 'لطفاً یک بازه‌ی مراجعه انتخاب کنید',
      icon: 'i-heroicons-exclamation-circle',
      color: 'error',
    })
    return
  }

  if (courierPhoneError.value) {
    toast.add({ title: courierPhoneError.value, icon: 'i-heroicons-exclamation-circle', color: 'error' })
    return
  }

  if (gatewayRequired.value && !gateway.value) {
    toast.add({ title: 'لطفاً یک درگاه پرداخت انتخاب کنید', icon: 'i-heroicons-exclamation-circle', color: 'error' })
    return
  }

  isSubmittingCheckout.value = true
  try {
    const response = await app.$api.payments.checkout({
      data: {
        personId: userStore.currentUser?.person?.id,
        items: checkoutItems.value,
        shippingMethodId: shippingMethodId.value,
        pickupSlotStart: selectedMethod.value?.slotsEnabled ? selectedSlotStart.value : null,
        courierName:
          selectedMethod.value?.type === 'CUSTOMER_COURIER' ? courierName.value.trim() || null : null,
        courierPhone:
          selectedMethod.value?.type === 'CUSTOMER_COURIER' && courierPhone.value.trim()
            ? normalizeIranianMobile(courierPhone.value.trim())
            : null,
        addressId: deliveryMethod.value === 'DELIVERY' ? selectedAddressId.value : null,
        payShippingOnDelivery: payShippingOnDelivery.value,
        paymentMethod: paymentMethod.value,
        gateway: gateway.value,
        // Only an accepted code is on the quote; a rejected one is never sent
        discountCode: quote.value?.discountCode || null,
        useWallet: walletActive.value,
        // Omitted when no terms are pending (the checkbox is hidden then)
        ...(termsRequired.value !== false ? { acceptedTerms: true } : {}),
        returnOrigin: window.location.origin,
      },
    })

    const result = response.data.data

    if (result?.paymentUrl) {
      cartStore.clearCart()
      await navigateTo({
        path: '/checkout/redirect',
        query: {
          url: result.paymentUrl,
          gateway: gateway.value,
          // The gateway only charges what the wallet did not cover
          amount: Number(result.amount ?? total.value) - Number(result.walletAmount ?? 0),
        },
      })
      return
    }

    if (result?.cashOnDelivery || result?.paidByWallet) {
      orderPlaced.value = result
      cartStore.clearCart()
      toast.add({
        title: result.paidByWallet ? 'سفارش شما با پرداخت از کیف پول ثبت شد' : 'سفارش شما با موفقیت ثبت شد',
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
    const message = paymentErrorMessage(error, 'خطا در ثبت سفارش')
    toast.add({ title: message, icon: 'i-heroicons-exclamation-circle', color: 'error' })
  } finally {
    isSubmittingCheckout.value = false
  }
}
</script>
