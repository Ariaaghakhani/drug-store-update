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
  </div>
</template>

<script>
import { useCartStore } from '~/stores/cart'

export default defineNuxtComponent({
  name: 'CartPage',

  data() {
    return {
      showAuthModal: false,
    }
  },

  head() {
    return {
      title: 'سبد خرید | داروخانه آنلاین',
    }
  },

  computed: {
    cartStore() {
      return useCartStore()
    },

    shippingCost() {
      return this.cartStore.subtotal > 500000 ? 0 : 59900
    },
  },

  methods: {
    handleCheckout() {
      if (this.$auth.loggedIn) {
        this.proceedToCheckout()
      } else {
        return navigateTo('/login?redirect=/cart')
      }
    },

    handleAuthenticated() {
      this.showAuthModal = false
      this.proceedToCheckout()
    },

    proceedToCheckout() {
      const toast = useToast()
      toast.add({
        title: 'در حال انتقال به صفحه پرداخت...',
        icon: 'i-heroicons-shopping-bag',
        color: 'green',
      })
      // TODO: Navigate to checkout page
      // navigateTo('/checkout')
    },

    increaseQuantity(productId) {
      const item = this.cartStore.items.find((i) => i.id === productId)
      if (item) {
        this.cartStore.updateQuantity(productId, item.quantity + 1)
      }
    },

    decreaseQuantity(productId) {
      const item = this.cartStore.items.find((i) => i.id === productId)
      if (item && item.quantity > 0) {
        this.cartStore.updateQuantity(productId, item.quantity - 1)
      }
    },

    removeItem(productId) {
      this.cartStore.removeItem(productId)
      const toast = useToast()
      toast.add({
        title: 'از سبد خرید حذف شد',
        icon: 'i-heroicons-trash',
        color: 'red',
      })
    },
  },
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
