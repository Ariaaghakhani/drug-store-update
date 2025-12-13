<template>
  <header
    class="sticky top-0 z-50 duration-300 bg-white/50 backdrop-blur-sm dark:bg-gray-900 dark:border-b dark:border-b-brand-700/50"
  >
    <div class="mx-auto px-4 lg:px-8">
      <div class="flex items-center justify-between h-16 lg:h-20 gap-4">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-3 flex-shrink-0">
          <div class="w-10 h-10 flex items-center justify-center">
            <svg
              width="40"
              height="40"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="16"
                cy="16"
                r="16"
                :fill="colorMode === 'dark' ? '#14B8A6' : '#2C7A7B'"
              />
              <circle cx="16" cy="16" r="8" fill="white" />
            </svg>
          </div>
          <span
            class="text-xl lg:text-2xl font-black text-gray-900 dark:text-white"
          >
            دارو پلاس
          </span>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav
          class="hidden md:flex items-center gap-6 lg:gap-8 flex-1 justify-start"
        >
          <template v-for="item in navItems" :key="item.route || item.title">
            <!-- Regular Nav Item -->
            <NuxtLink
              v-if="!item.menu"
              :to="item.route"
              class="text-sm lg:text-base font-semibold text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
            >
              {{ item.title }}
            </NuxtLink>

            <!-- Nav Item with Dropdown Menu -->
            <UDropdownMenu
              v-else
              dir="rtl"
              :items="[item.menu]"
              :popper="{ placement: 'bottom' }"
              :ui="{
                content: 'font-dana w-56',
                item: 'before:!bg-transparent hover:before:!bg-transparent',
              }"
            >
              <button
                class="flex items-center gap-1 text-sm lg:text-base font-semibold text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400"
              >
                {{ item.title }}
                <UIcon name="mdi:menu-down" class="w-4 h-4" />
              </button>

              <template #item="{ item: menuItem }">
                <div
                  class="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 dark:hover:text-teal-400 transition-all rounded-lg cursor-pointer"
                  dir="rtl"
                >
                  <UIcon
                    v-if="menuItem.icon"
                    :name="menuItem.icon"
                    class="w-5 h-5"
                  />
                  <span class="font-dana">{{ menuItem.label }}</span>
                </div>
              </template>
            </UDropdownMenu>
          </template>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-1 lg:gap-2">
          <!-- Search -->
          <button
            class="w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950 transition-all"
            aria-label="جستجو"
          >
            <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5" />
          </button>

          <!-- Cart -->
          <button
            ref="cartButton"
            class="relative w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950 transition-all"
            aria-label="سبد خرید"
            @click="toggleCartDropdown"
          >
            <UIcon name="i-heroicons-shopping-cart" class="w-5 h-5" />
            <span
              v-if="cartItemsCount > 0"
              class="absolute top-1 end-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none"
            >
              {{ cartItemsCount }}
            </span>
          </button>

          <!-- Language Switcher - Desktop only -->
          <div class="hidden md:block">
            <LanguageSwitcher />
          </div>

          <!-- Dark Mode Toggle - Desktop only -->
          <button
            class="hidden md:flex w-10 h-10 items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950 transition-all"
            aria-label="تغییر تم"
            @click="toggleDarkMode"
          >
            <UIcon
              :name="
                colorMode === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'
              "
              class="w-5 h-5"
            />
          </button>

          <!-- User Profile -->
          <button
            class="hidden sm:flex w-10 h-10 items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950 transition-all"
            aria-label="پروفایل کاربری"
            @click="goToPanel"
          >
            <UIcon name="i-heroicons-user" class="w-5 h-5" />
          </button>

          <UButton
            class="p-4 hidden md:flex"
            icon="mdi:headset"
            to="/supports"
            size="xl"
            dir="ltr"
          >
            تماس با پشتیبانی
          </UButton>

          <!-- Mobile Menu Toggle -->
          <button
            class="md:hidden w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950 transition-all"
            aria-label="منو"
            @click="toggleMobileMenu"
          >
            <UIcon name="i-heroicons-bars-3" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Cart Dropdown - Positioned outside container -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div
          v-if="cartStore.isOpen"
          ref="cartDropdown"
          dir="rtl"
          class="fixed font-dana w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 z-[60]"
          :style="cartDropdownStyle"
          @click.stop
        >
          <!-- Dropdown Header -->
          <div
            class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800"
          >
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-shopping-cart"
                class="w-5 h-5 text-teal-500"
              />
              <h3 class="text-base font-bold text-gray-900 dark:text-white">
                سبد خرید
              </h3>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                ({{ cartItemsCount }} مورد)
              </span>
            </div>
            <button
              class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              @click="closeCartDropdown"
            >
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
            </button>
          </div>

          <!-- Cart Items -->
          <div v-if="cartStore.hasItems" class="max-h-96 overflow-y-auto">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="flex gap-3 p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div
                class="w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
              >
                <NuxtImg
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.name"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center"
                >
                  <UIcon
                    name="i-heroicons-photo"
                    class="w-8 h-8 text-gray-400"
                  />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h4
                  class="text-sm font-semibold text-gray-900 dark:text-white truncate"
                >
                  {{ item.name }}
                </h4>
                <p
                  class="text-sm font-bold text-teal-600 dark:text-teal-400 mt-1"
                >
                  {{ formatPrice(item.price * item.quantity) }} تومان
                </p>
                <!-- Quantity Controls -->
                <div class="flex items-center gap-2 mt-4">
                  <button
                    class="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-teal-100 dark:hover:bg-teal-900 hover:text-teal-600 dark:hover:text-teal-400 transition-all"
                    @click.stop="incrementQuantity(item.id)"
                  >
                    <UIcon name="i-heroicons-plus" class="w-4 h-4" />
                  </button>
                  <span
                    class="text-sm font-semibold text-gray-900 dark:text-white min-w-[2rem] text-center"
                  >
                    {{ item.quantity.toLocaleString('fa-IR') }}
                  </span>
                  <button
                    class="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-teal-100 dark:hover:bg-teal-900 hover:text-teal-600 dark:hover:text-teal-400 transition-all"
                    @click.stop="decrementQuantity(item.id)"
                  >
                    <UIcon name="i-heroicons-minus" class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
                @click.stop="removeFromCart(item.id)"
              >
                <UIcon name="i-heroicons-trash" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="p-8 text-center">
            <UIcon
              name="i-heroicons-shopping-cart"
              class="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-3"
            />
            <p class="text-gray-500 dark:text-gray-400 text-sm">
              سبد خرید شما خالی است
            </p>
          </div>

          <!-- Dropdown Footer -->
          <div
            v-if="cartStore.hasItems"
            class="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800"
          >
            <div class="flex items-center justify-between mb-4">
              <span
                class="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                جمع کل:
              </span>
              <span class="text-lg font-bold text-teal-600 dark:text-teal-400">
                {{ formatPrice(cartStore.subtotal) }} تومان
              </span>
            </div>
            <NuxtLink
              to="/cart"
              class="w-full h-11 flex items-center justify-center rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-all"
              @click="closeCartDropdown"
            >
              مشاهده سبد خرید
              <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 ms-2" />
            </NuxtLink>
          </div>
        </div> </Transition
    ></Teleport>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-full"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-full"
    >
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-50 md:hidden w-full"
        @click="closeMobileMenu"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 h-[200vh] w-full"
          @click.stop="closeMobileMenu"
        />

        <!-- Menu Panel -->
        <div
          class="absolute top-0 start-0 w-full h-full bg-white dark:bg-gray-900 shadow-2xl"
          @click.stop
        >
          <!-- Menu Header -->
          <div
            class="flex bg-white dark:bg-gray-900 items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 flex items-center justify-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="16"
                    cy="16"
                    r="16"
                    :fill="colorMode === 'dark' ? '#14B8A6' : '#2C7A7B'"
                  />
                  <circle cx="16" cy="16" r="8" fill="white" />
                </svg>
              </div>
              <span class="text-lg font-black text-gray-900 dark:text-white">
                دارو پلاس
              </span>
            </div>
            <button
              class="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              @click="closeMobileMenu"
            >
              <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
            </button>
          </div>

          <!-- Menu Items -->
          <nav class="p-4 bg-white dark:bg-gray-900">
            <template v-for="item in navItems" :key="item.route || item.title">
              <!-- Regular Menu Item -->
              <NuxtLink
                v-if="!item.menu"
                :to="item.route"
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 dark:hover:text-teal-400 transition-all"
                @click="closeMobileMenu"
              >
                <UIcon :name="item.icon" class="w-5 h-5" />
                <span class="font-semibold">{{ item.title }}</span>
              </NuxtLink>

              <!-- Menu Item with Submenu -->
              <div v-else class="mb-2">
                <button
                  class="flex items-center justify-between w-full px-4 py-3 rounded-xl text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 dark:hover:text-teal-400 transition-all"
                  @click="toggleMobileDropdown(item.title)"
                >
                  <div class="flex items-center gap-3">
                    <UIcon :name="item.icon" class="w-5 h-5" />
                    <span class="font-semibold">{{ item.title }}</span>
                  </div>
                  <UIcon
                    name="i-heroicons-chevron-down"
                    class="w-4 h-4 transition-transform"
                    :class="{
                      'rotate-180': activeMobileDropdown === item.title,
                    }"
                  />
                </button>

                <!-- Submenu Items -->
                <Transition
                  enter-active-class="transition-all duration-200"
                  enter-from-class="opacity-0 max-h-0"
                  enter-to-class="opacity-100 max-h-96"
                  leave-active-class="transition-all duration-200"
                  leave-from-class="opacity-100 max-h-96"
                  leave-to-class="opacity-0 max-h-0"
                >
                  <div
                    v-if="activeMobileDropdown === item.title"
                    class="ms-4 mt-1 overflow-hidden"
                  >
                    <NuxtLink
                      v-for="subItem in item.menu"
                      :key="subItem.to"
                      :to="subItem.to"
                      class="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 dark:hover:text-teal-400 transition-all"
                      @click="closeMobileMenu"
                    >
                      <UIcon
                        v-if="subItem.icon"
                        :name="subItem.icon"
                        class="w-4 h-4"
                      />
                      {{ subItem.label }}
                    </NuxtLink>
                  </div>
                </Transition>
              </div>
            </template>

            <!-- Divider -->
            <div class="my-4 border-t border-gray-200 dark:border-gray-700" />

            <!-- User Profile - Mobile only -->
            <button
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 dark:hover:text-teal-400 transition-all w-full text-start"
              @click="goToPanel"
            >
              <UIcon name="i-heroicons-user" class="w-5 h-5" />
              <span class="font-semibold">پروفایل کاربری</span>
            </button>

            <!-- Language Switcher - Mobile -->
            <div class="px-4 py-3 w-full">
              <LanguageSwitcher class="w-full" />
            </div>

            <!-- Dark Mode Toggle - Mobile only -->
            <button
              class="flex items-center w-full gap-3 px-4 py-3 rounded-xl text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 dark:hover:text-teal-400 transition-all"
              @click="toggleDarkMode"
            >
              <UIcon
                :name="
                  colorMode === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'
                "
                class="w-5 h-5"
              />
              <span class="font-semibold">
                {{ colorMode === 'dark' ? 'حالت روز' : 'حالت شب' }}
              </span>
            </button>

            <div class="px-4 py-3 w-full">
              <UButton to="/supports" class="p-4 text-sm" icon="mdi-headset">
                تماس با پشتیبانی
              </UButton>
            </div>
          </nav>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script>
import { useCartStore } from '~/stores/cart'

export default {
  name: 'AppHeader',
  setup() {
    const cartStore = useCartStore()
    return { cartStore }
  },
  data() {
    return {
      mobileMenuOpen: false,
      cartDropdownOpen: false,
      activeMobileDropdown: null,
      cartDropdownStyle: {},
      navItems: [
        {
          title: 'داروها',
          route: '/medications',
          icon: 'i-heroicons-beaker',
          menu: [
            {
              label: 'داروهای بدون نسخه',
              to: '/medications/otc',
              icon: 'i-heroicons-shopping-bag',
            },
            {
              label: 'داروهای تجویزی',
              to: '/medications/prescription',
              icon: 'i-heroicons-document-text',
            },
            {
              label: 'مکمل‌ها و ویتامین‌ها',
              to: '/medications/supplements',
              icon: 'i-heroicons-cube',
            },
          ],
        },
        {
          title: 'سلامت و تندرستی',
          route: '/wellness',
          icon: 'i-heroicons-sparkles',
          menu: [
            {
              label: 'مقالات سلامت',
              to: '/wellness/articles',
              icon: 'i-heroicons-newspaper',
            },
            {
              label: 'راهنمای تغذیه',
              to: '/wellness/nutrition',
              icon: 'i-heroicons-cake',
            },
            {
              label: 'ورزش و تناسب اندام',
              to: '/wellness/fitness',
              icon: 'i-heroicons-bolt',
            },
          ],
        },
        {
          title: 'محصولات سلامت',
          route: '/products',
          icon: 'i-heroicons-heart',
        },

        {
          title: 'درباره ما',
          route: '/about',
          icon: 'i-heroicons-information-circle',
        },
      ],
    }
  },

  computed: {
    colorMode() {
      return useColorMode().value
    },

    cartItemsCount() {
      return this.cartStore.itemCount
    },
  },

  watch: {
    'cartStore.items.length': {
      handler(newLength, oldLength) {
        if (newLength > oldLength) {
          this.cartDropdownOpen = true
          // Auto-close after 3 seconds
          setTimeout(() => {
            this.cartDropdownOpen = false
          }, 3000)
        }
      },
    },

    'cartStore.isOpen': {
      handler(isOpen) {
        if (isOpen) {
          this.$nextTick(() => {
            this.updateCartDropdownPosition()
          })
        }
      },
      immediate: true,
    },
  },

  mounted() {
    document.addEventListener('click', this.handleClickOutside)
    window.addEventListener('resize', this.handleResize)
    this.cartStore.loadCartItems()
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
    window.removeEventListener('resize', this.handleResize)
    document.body.style.overflow = ''
  },

  methods: {
    goToPanel() {
      const { isAuthenticated } = useAuth()

      if (isAuthenticated()) {
        // User is authenticated, navigate to panel
        navigateTo('/panel')
      } else {
        // User not authenticated, redirect to login with return URL
        navigateTo('/login?redirect=/panel')
      }

      // Close mobile menu if open
      if (this.mobileMenuOpen) {
        this.closeMobileMenu()
      }
    },

    toggleDarkMode() {
      const colorMode = useColorMode()
      colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
    },

    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
      if (this.mobileMenuOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    },

    closeMobileMenu() {
      this.mobileMenuOpen = false
      this.activeMobileDropdown = null
      document.body.style.overflow = ''
    },

    toggleCartDropdown() {
      this.cartStore.isOpen = !this.cartStore.isOpen
      if (this.cartStore.isOpen) {
        this.$nextTick(() => {
          this.updateCartDropdownPosition()
        })
      }
    },

    closeCartDropdown() {
      this.cartStore.isOpen = false
    },

    updateCartDropdownPosition() {
      if (this.$refs.cartButton) {
        const isMobile = window.innerWidth < 768

        if (isMobile) {
          // On mobile, center the dropdown horizontally and position below header
          this.cartDropdownStyle = {
            top: '80px', // Below the header
            left: '50%',
            transform: 'translateX(-50%)',
          }
        } else {
          // On desktop, position relative to cart button
          const buttonRect = this.$refs.cartButton.getBoundingClientRect()

          if (this.$dir.rtl.value) {
            // RTL: align to right edge of button
            this.cartDropdownStyle = {
              top: `${buttonRect.bottom + 18}px`,
              left: `${buttonRect.right - 384}px`, // 384px is w-96 width
            }
          } else {
            // LTR: align to left edge of button
            this.cartDropdownStyle = {
              top: `${buttonRect.bottom + 18}px`,
              left: `${buttonRect.left}px`,
            }
          }
        }
      }
    },

    toggleMobileDropdown(title) {
      this.activeMobileDropdown =
        this.activeMobileDropdown === title ? null : title
    },

    removeFromCart(productId) {
      this.cartStore.removeItem(productId)
    },

    incrementQuantity(productId) {
      this.cartStore.incrementQuantity(productId)
    },

    decrementQuantity(productId) {
      this.cartStore.decrementQuantity(productId)
    },

    formatPrice(price) {
      return new Intl.NumberFormat('fa-IR').format(price)
    },

    handleClickOutside(event) {
      const target = event.target
      const cartButton = this.$refs.cartButton
      const cartDropdown = this.$refs.cartDropdown

      // Handle cart dropdown
      if (this.cartStore.isOpen) {
        if (
          cartButton &&
          cartDropdown &&
          !cartButton.contains(target) &&
          !cartDropdown.contains(target)
        ) {
          this.closeCartDropdown()
        }
      }
    },

    handleResize() {
      if (this.cartStore.isOpen) {
        this.updateCartDropdownPosition()
      }
    },
  },
}
</script>

<style scoped>
:deep(button[role='menuitem']) {
  outline: none !important;
  box-shadow: none !important;
  ring: 0 !important;
}

:deep(button[role='menuitem']:focus) {
  outline: none !important;
  box-shadow: none !important;
  ring: 0 !important;
}

:deep(button[role='menuitem']:focus-visible) {
  outline: none !important;
  box-shadow: none !important;
  ring: 0 !important;
}
</style>
