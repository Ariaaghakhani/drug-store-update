<template>
  <UContainer>
    <div class="py-12">
      <div class="relative">
        <Transition name="sk">
          <div
            v-if="pending"
            key="sk"
            class="grid grid-cols-1 lg:grid-cols-2 gap-10"
          >
            <USkeleton class="aspect-square w-full rounded-xl" />
            <div class="space-y-4">
              <USkeleton class="h-5 w-24 rounded-full" />
              <USkeleton class="h-9 w-3/4 rounded-lg" />
              <USkeleton class="h-5 w-1/2 rounded-lg" />
              <USkeleton class="h-9 w-40 rounded-lg" />
              <USkeleton class="h-24 w-full rounded-lg" />
              <USkeleton class="h-9 w-full rounded-lg" />
            </div>
          </div>

          <div v-else key="content">
            <div v-if="notFound" class="text-center py-20">
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4"
              />
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                محصول یافت نشد
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                محصولی با این شناسه وجود ندارد یا حذف شده است
              </p>
              <UButton
                to="/medications"
                color="primary"
                icon="i-heroicons-arrow-right"
              >
                بازگشت به لیست داروها
              </UButton>
            </div>

            <div v-else class="space-y-16">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <!-- Gallery -->
                <div class="space-y-3">
                  <div
                    class="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                  >
                    <div v-if="discountPercent > 0" class="absolute bottom-3 start-3 z-10">
                      <UBadge color="error" variant="solid" size="lg">
                        {{ formatCount(Math.round(discountPercent)) }}٪ تخفیف
                      </UBadge>
                    </div>

                    <img
                      v-if="activeImage"
                      :src="activeImage.url"
                      :alt="product.nameFa"
                      class="w-full h-full object-cover"
                    />
                    <UIcon
                      v-else
                      name="i-heroicons-cube"
                      class="w-32 h-32 text-gray-300 dark:text-gray-600"
                    />
                  </div>

                  <div v-if="images.length > 1" class="flex gap-2 overflow-x-auto pb-1">
                    <button
                      v-for="(image, index) in images"
                      :key="image.id ?? index"
                      type="button"
                      class="w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors"
                      :class="index === activeImageIndex ? 'border-brand-500' : 'border-transparent hover:border-brand-300 dark:hover:border-brand-500'"
                      @click="activeImageIndex = index"
                    >
                      <img :src="image.url" :alt="product.nameFa" loading="lazy" class="w-full h-full object-cover" />
                    </button>
                  </div>
                </div>

                <div class="space-y-4">
                  <UBadge
                    v-if="product.isPrescriptionRequired"
                    color="warning"
                    variant="solid"
                    size="md"
                  >
                    <UIcon
                      name="i-heroicons-document-text"
                      class="w-4 h-4 ms-1"
                    />
                    نسخه‌دار
                  </UBadge>

                  <h1
                    class="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white"
                  >
                    {{ product.nameFa }}
                  </h1>
                  <p
                    v-if="product.nameEn"
                    class="text-base text-gray-500 dark:text-gray-400"
                  >
                    {{ product.nameEn }}
                  </p>

                  <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <NuxtLink
                      v-if="product.brandTitle && product.brandId"
                      :to="`/brands/${product.brandId}`"
                      class="font-bold text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                    >
                      برند: {{ product.brandTitle }}
                    </NuxtLink>
                    <span v-else-if="product.brandTitle" class="font-bold text-gray-600 dark:text-gray-400">
                      برند: {{ product.brandTitle }}
                    </span>

                    <span v-if="product.reviewCount" class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <UIcon name="i-heroicons-star-solid" class="w-4 h-4 text-yellow-400" />
                      <span class="font-bold text-gray-900 dark:text-white">
                        {{ Number(product.rating || 0).toLocaleString('fa-IR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }}
                      </span>
                      ({{ formatCount(product.reviewCount) }} نظر)
                    </span>
                  </div>

                  <!-- Variants (colour, size, ...) -->
                  <div v-if="variants.length > 0" class="space-y-2">
                    <p class="text-sm font-bold text-gray-900 dark:text-white">انتخاب گزینه</p>
                    <div class="flex flex-wrap gap-2">
                      <UButton
                        v-for="variant in variants"
                        :key="variant.id"
                        size="md"
                        color="neutral"
                        :variant="variant.id === selectedVariantId ? 'solid' : 'outline'"
                        :disabled="variant.availableQuantity <= 0"
                        @click="selectedVariantId = variant.id"
                      >
                        {{ variantLabel(variant) }}
                      </UButton>
                    </div>
                  </div>

                  <!-- Price -->
                  <div class="space-y-1">
                    <p class="text-3xl font-black text-gray-900 dark:text-white">
                      {{ formatCount(finalPrice) }}
                      <span class="text-lg font-medium">تومان</span>
                    </p>
                    <div v-if="discountPercent > 0" class="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p class="text-lg text-gray-500 dark:text-gray-400 line-through">
                        {{ formatPrice(basePrice) }}
                      </p>
                      <p v-if="savings > 0" class="text-sm font-medium text-error">
                        {{ formatPrice(savings) }} صرفه‌جویی
                      </p>
                    </div>
                  </div>

                  <UBadge v-if="inStock === true" color="success" variant="subtle" size="md">
                    موجود
                  </UBadge>
                  <UBadge v-else-if="inStock === false" color="error" variant="subtle" size="md">
                    ناموجود
                  </UBadge>

                  <p
                    v-if="product.description"
                    class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line"
                  >
                    {{ product.description }}
                  </p>

                  <UButton
                    block
                    color="primary"
                    size="xl"
                    icon="i-heroicons-shopping-cart"
                    class="mt-4"
                    :disabled="inStock === false || needsVariant"
                    @click="handleAddToCart"
                  >
                    {{ addToCartLabel }}
                  </UButton>

                  <div v-if="wishlistEnabled || (stockAlertsEnabled && inStock === false)" class="flex gap-2">
                    <UButton
                      v-if="wishlistEnabled"
                      block
                      color="neutral"
                      variant="outline"
                      :icon="wished ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
                      :loading="togglingWish"
                      @click="toggleWishlist"
                    >
                      {{ wished ? 'در علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها' }}
                    </UButton>
                    <UButton
                      v-if="stockAlertsEnabled && inStock === false"
                      block
                      color="neutral"
                      variant="outline"
                      :icon="alerted ? 'i-heroicons-bell-alert-solid' : 'i-heroicons-bell-alert'"
                      :loading="togglingAlert"
                      @click="toggleStockAlert"
                    >
                      {{ alerted ? 'لغو خبرم کن' : 'موجود شد خبرم کن' }}
                    </UButton>
                  </div>
                </div>
              </div>

              <!-- Specs + pharmacy info -->
              <section v-if="specs.length > 0 || infoSections.length > 0" class="space-y-6">
                <h2 class="text-2xl font-black text-gray-900 dark:text-white">
                  مشخصات <span class="text-brand-500">محصول</span>
                </h2>

                <UCard v-if="specs.length > 0" :ui="{ body: 'p-0' }">
                  <dl class="divide-y divide-gray-100 dark:divide-gray-800">
                    <div v-for="spec in specs" :key="spec.name" class="flex gap-4 px-4 sm:px-6 py-3 text-sm">
                      <dt class="w-40 shrink-0 text-gray-500 dark:text-gray-400">{{ spec.name }}</dt>
                      <dd class="text-gray-900 dark:text-white">{{ spec.value }}</dd>
                    </div>
                  </dl>
                </UCard>

                <UCard v-for="section in infoSections" :key="section.key" :ui="{ body: 'p-4 sm:p-6' }">
                  <h3 class="font-bold text-gray-900 dark:text-white mb-2">{{ section.title }}</h3>
                  <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {{ section.text }}
                  </p>
                </UCard>
              </section>

              <RelatedGoods :goods-id="product.id" />
              <ProductReviews :goods-id="product.id" />
              <ProductQuestions v-if="goodsQuestionsEnabled" :goods-id="product.id" />
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </UContainer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '~/stores/cart'

const route = useRoute()
const app = useNuxtApp()
const cartStore = useCartStore()
const toast = useAppToast()
const { formatPrice, formatCount } = useFormat()
const { profile: storeProfile, wishlistEnabled, stockAlertsEnabled, goodsQuestionsEnabled, variantsEnabled } =
  useStoreProfile()

const product = ref({})
const pending = ref(true)
const notFound = ref(false)

// ---------- gallery ----------
const images = computed(() => {
  const attachments = (product.value?.attachments ?? []).filter(
    (attachment) => attachment.url && (!attachment.fileType || attachment.fileType.startsWith('image'))
  )
  // primary first
  return [...attachments].sort((a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary)))
})
const activeImageIndex = ref(0)
const activeImage = computed(() => images.value[activeImageIndex.value] ?? null)

// ---------- variants ----------
// A product with variants (isModel) isn't sold itself: the shopper picks a variant, which has its own price and stock.
// Hidden only when the store profile has loaded and says variants are off (a failed profile call must not block buying)
const variants = computed(() =>
  storeProfile.value && !variantsEnabled.value
    ? []
    : (product.value?.variants ?? []).filter((variant) => variant.isActive !== false)
)
const selectedVariantId = ref(null)
const selectedVariant = computed(() => variants.value.find((variant) => variant.id === selectedVariantId.value) ?? null)
const needsVariant = computed(() => variants.value.length > 0 && !selectedVariant.value)

// what the price/stock block describes: the picked variant, else the product itself
const unit = computed(() => selectedVariant.value ?? product.value)

const basePrice = computed(() => Number(unit.value?.price ?? 0))
const discountPercent = computed(() => Number(unit.value?.activeDiscountPercent ?? 0))
const finalPrice = computed(() => {
  if (!selectedVariant.value && variants.value.length > 0) {
    // nothing picked yet: lead with the cheapest variant
    return Math.min(...variants.value.map((variant) => Number(variant.finalPrice ?? variant.price ?? 0)))
  }
  return Number(unit.value?.finalPrice ?? unit.value?.price ?? 0)
})

// what the discount saves on one unit (only meaningful once a variant is picked or for a simple product)
const savings = computed(() =>
  discountPercent.value > 0 ? Math.max(0, Math.round(basePrice.value - finalPrice.value)) : 0
)

const inStock = computed(() => {
  if (variants.value.length > 0) {
    return selectedVariant.value
      ? selectedVariant.value.availableQuantity > 0
      : variants.value.some((variant) => variant.availableQuantity > 0)
  }
  return product.value?.inStock ?? null
})

const addToCartLabel = computed(() => {
  if (inStock.value === false) return 'ناموجود'
  return needsVariant.value ? 'ابتدا گزینه را انتخاب کنید' : 'افزودن به سبد خرید'
})

// ---------- specs / pharmacy info ----------
const specs = computed(() =>
  (product.value?.attributes ?? [])
    .map((attribute) => ({ name: attribute.attributeName, value: attributeValueText(attribute) }))
    .filter((spec) => spec.name && spec.value)
)

const INFO_SECTIONS = [
  { key: 'usageInstructions', title: 'روش مصرف' },
  { key: 'warnings', title: 'هشدارها و تداخل‌ها' },
  { key: 'sideEffects', title: 'عوارض جانبی' },
  { key: 'storageConditions', title: 'شرایط نگهداری' },
  { key: 'ingredients', title: 'ترکیبات' },
]
const infoSections = computed(() =>
  INFO_SECTIONS.map((section) => ({ ...section, text: htmlToText(product.value?.info?.[section.key]) })).filter(
    (section) => section.text
  )
)

// ---------- load ----------
const fetchProduct = async () => {
  pending.value = true
  notFound.value = false

  try {
    const response = await app.$api.goods.getGoods({ data: { id: Number(route.params.id) } })
    const data = response?.data?.data

    if (!data) {
      notFound.value = true
    } else {
      product.value = data
      activeImageIndex.value = 0
      // land on the first variant that can be bought; none in stock → leave unselected
      selectedVariantId.value =
        (data.variants ?? []).find((variant) => variant.isActive !== false && variant.availableQuantity > 0)?.id ?? null
      pageTitle.value = `${data.nameFa} | داروخانه آنلاین`
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    notFound.value = true
  } finally {
    pending.value = false
  }
}

const handleAddToCart = () => {
  if (needsVariant.value) return

  const variant = selectedVariant.value
  const cartProduct = {
    id: variant?.id ?? product.value.id,
    nameFa: variant ? `${product.value.nameFa} - ${variantLabel(variant)}` : product.value.nameFa,
    nameEn: product.value.nameEn,
    price: finalPrice.value,
    image: images.value[0]?.url ?? null,
    minOrderQuantity: product.value.minOrderQuantity || 1,
  }

  const quantityAdded = cartStore.addItem(cartProduct)

  if (quantityAdded > 1) {
    toast.success(
      'به سبد خرید اضافه شد',
      `${cartProduct.nameFa} - ${quantityAdded} عدد (حداقل سفارش)`
    )
  } else {
    toast.success('به سبد خرید اضافه شد', cartProduct.nameFa || 'محصول')
  }
}

// ---------- wishlist / "notify me" (login required; guests are sent to login and brought back) ----------
const wished = ref(false)
const alerted = ref(false)
const togglingWish = ref(false)
const togglingAlert = ref(false)

const requireLogin = () => {
  if (app.$auth.loggedIn) return true
  navigateTo({ path: '/login', query: { redirect: route.fullPath } })
  return false
}

const loadUserFlags = async () => {
  if (!app.$auth.loggedIn) return
  const id = Number(route.params.id)
  try {
    if (wishlistEnabled.value) {
      wished.value = ((await app.$api.storefront.listWishlistIds()).data.data ?? []).includes(id)
    }
    if (stockAlertsEnabled.value) {
      alerted.value = ((await app.$api.storefront.listStockAlertIds()).data.data ?? []).includes(id)
    }
  } catch {
    // hearts just start unfilled
  }
}

const toggleWishlist = async () => {
  if (!requireLogin()) return
  togglingWish.value = true
  try {
    if (wished.value) await app.$api.storefront.removeFromWishlist(product.value.id)
    else await app.$api.storefront.addToWishlist(product.value.id)
    wished.value = !wished.value
  } catch (error) {
    toast.error('ذخیره علاقه‌مندی ناموفق بود', error?.response?.data?.message)
  } finally {
    togglingWish.value = false
  }
}

const toggleStockAlert = async () => {
  if (!requireLogin()) return
  togglingAlert.value = true
  try {
    if (alerted.value) await app.$api.storefront.removeStockAlert(product.value.id)
    else await app.$api.storefront.addStockAlert(product.value.id)
    alerted.value = !alerted.value
  } catch (error) {
    toast.error('ثبت درخواست ناموفق بود', error?.response?.data?.message)
  } finally {
    togglingAlert.value = false
  }
}

// flags arrive async (store profile), so reload the user's state once they are known
watch([wishlistEnabled, stockAlertsEnabled], loadUserFlags)

// opening another product from the related rows reuses this component
watch(
  () => route.params.id,
  () => {
    wished.value = false
    alerted.value = false
    fetchProduct()
    loadUserFlags()
    if (import.meta.client) window.scrollTo({ top: 0 })
  }
)

const pageTitle = ref('جزئیات محصول | داروخانه آنلاین')
useHead({ title: pageTitle })

onMounted(() => {
  fetchProduct()
  loadUserFlags()
})
</script>
