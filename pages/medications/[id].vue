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

            <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div
                class="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
              >
                <img
                  v-if="primaryImageUrl"
                  :src="primaryImageUrl"
                  :alt="product.nameFa"
                  class="w-full h-full object-cover"
                />
                <UIcon
                  v-else
                  name="i-heroicons-cube"
                  class="w-32 h-32 text-gray-300 dark:text-gray-600"
                />
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

                <div
                  v-if="product.brandTitle"
                  class="text-sm font-bold text-gray-600 dark:text-gray-400"
                >
                  برند: {{ product.brandTitle }}
                </div>

                <p class="text-3xl font-black text-brand-500">
                  {{ formatPrice(product.price) }}
                </p>

                <p
                  v-if="product.description"
                  class="text-gray-700 dark:text-gray-300 leading-relaxed"
                >
                  {{ product.description }}
                </p>

                <UButton
                  block
                  color="primary"
                  size="xl"
                  icon="i-heroicons-shopping-cart"
                  class="mt-4"
                  @click="handleAddToCart"
                >
                  افزودن به سبد خرید
                </UButton>
              </div>
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
const { formatPrice } = useFormat()

const product = ref({})
const pending = ref(true)
const notFound = ref(false)

const primaryImageUrl = computed(() => {
  const attachments = product.value?.attachments
  if (!attachments || attachments.length === 0) return null

  const primary = attachments.find((attachment) => attachment.isPrimary)
  return (primary || attachments[0])?.url || null
})

const fetchProduct = async () => {
  pending.value = true
  notFound.value = false

  try {
    const response = await app.$api.goods.getGoods({ id: route.params.id })
    const data = response?.data?.data

    if (!data) {
      notFound.value = true
    } else {
      product.value = data
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    notFound.value = true
  } finally {
    pending.value = false
  }
}

const handleAddToCart = () => {
  const cartProduct = {
    id: product.value.id,
    nameFa: product.value.nameFa,
    nameEn: product.value.nameEn,
    price: product.value.price || 0,
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

useHead({
  title: 'جزئیات محصول | داروخانه آنلاین',
})

onMounted(() => {
  fetchProduct()
})
</script>
