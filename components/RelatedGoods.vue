<template>
  <div class="space-y-12">
    <!-- Loading -->
    <section v-if="loading" class="space-y-6">
      <USkeleton class="h-8 w-48 rounded-lg" />
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <USkeleton v-for="i in 4" :key="i" class="h-96 w-full rounded-xl" />
      </div>
    </section>

    <template v-else>
      <section v-if="similar.length > 0" class="space-y-6">
        <h2 class="text-2xl font-black text-gray-900 dark:text-white">
          محصولات <span class="text-brand-500">مشابه</span>
        </h2>
        <ProductGrid
          :products="similar"
          grid-class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          @add-to-cart="addToCart"
        />
      </section>

      <section v-if="sameBrand.length > 0" class="space-y-6">
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-2xl font-black text-gray-900 dark:text-white">
            سایر محصولات <span class="text-brand-500">{{ brandName }}</span>
          </h2>
          <UButton
            v-if="brandId"
            color="neutral"
            variant="soft"
            trailing-icon="i-heroicons-arrow-left"
            :to="`/brands/${brandId}`"
          >
            مشاهده همه
          </UButton>
        </div>
        <ProductGrid
          :products="sameBrand"
          grid-class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          @add-to-cart="addToCart"
        />
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// "Similar" and "same brand" rows under a product: GET api/storefront/goods/{goodsId}/related.
// Both lists hold in-stock goods only and BACK's store setting can turn them off (empty lists), so the whole
// component simply renders nothing when there's nothing to show — including when the call fails.
const props = defineProps({
  goodsId: { type: [Number, String], required: true },
})

const { $api } = useNuxtApp()
const { addToCart } = useAddToCart()

const { data, status } = useAsyncData(
  'storefront-related',
  async () => {
    try {
      return (await $api.storefront.getRelatedGoods(props.goodsId)).data.data
    } catch {
      return null
    }
  },
  { server: false, watch: [() => props.goodsId] }
)

const loading = computed(() => status.value === 'idle' || status.value === 'pending')
const similar = computed(() => (data.value?.similar ?? []).map((card) => toProductCard(card)))
const sameBrand = computed(() => (data.value?.sameBrand ?? []).map((card) => toProductCard(card)))
const brandId = computed(() => data.value?.brandId ?? null)
const brandName = computed(() => data.value?.brandName ?? '')
</script>
