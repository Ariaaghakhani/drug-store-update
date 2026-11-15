<!-- components/panel/products/VariantsCard.vue -->
<template>
  <UCard :ui="{ body: 'p-0' }">
    <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
      <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4 text-brand-500 dark:text-brand-400 flex-shrink-0" />
      <h3 class="text-sm font-medium text-gray-900 dark:text-white">تنوع‌های کالا</h3>
      <span v-if="!loading && !error" class="text-xs text-gray-500 dark:text-gray-400">
        {{ variants.length.toLocaleString('fa-IR') }} تنوع
      </span>
      <div v-if="axes.length" class="flex items-center gap-2 ms-auto">
        <UButton color="neutral" variant="outline" size="sm" icon="i-heroicons-plus" @click="openCreate">
          تنوع جدید
        </UButton>
        <UButton color="neutral" variant="soft" size="sm" icon="i-heroicons-squares-plus" @click="openGenerate">
          ساخت گروهی
        </UButton>
      </div>
    </div>

    <div v-if="!axesLoading && !axes.length" class="flex flex-wrap items-center gap-2 px-4 sm:px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
      <p v-if="axesError" class="text-xs text-error">دریافت محورهای تنوع ناموفق بود</p>
      <template v-else>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          دسته‌ی این کالا محور تنوعی ندارد. برای ساخت تنوع، یک ویژگی را در دسته‌ها به‌عنوان محور تنوع تعیین کنید.
        </p>
        <UButton to="/panel/attributes?tab=categories" color="neutral" variant="link" size="xs">
          ویژگی‌های دسته‌ها
        </UButton>
      </template>
    </div>

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="i in 2" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-40" />
              <USkeleton class="h-3 w-56" />
            </div>
            <USkeleton class="h-5 w-16 rounded-full" />
          </div>
        </div>

        <PanelEmptyState
          v-else-if="error"
          key="error"
          variant="error"
          title="دریافت تنوع‌ها ناموفق بود"
        >
          <template #action>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
              تلاش دوباره
            </UButton>
          </template>
        </PanelEmptyState>

        <PanelEmptyState
          v-else-if="!variants.length"
          key="empty"
          icon="i-heroicons-squares-2x2"
          title="هنوز تنوعی ساخته نشده"
          text="ترکیب‌های رنگ، سایز و … این مدل را اینجا بسازید"
        />

        <ul v-else key="content" class="divide-y divide-gray-100 dark:divide-gray-800">
          <li
            v-for="variant in variants"
            :key="variant.id"
            class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 sm:px-6 py-3"
          >
            <div class="min-w-0 flex-1 basis-48">
              <p dir="ltr" class="text-sm font-mono font-semibold text-gray-900 dark:text-white text-start">
                {{ variant.goodCode }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ axesText(variant) }}</p>
            </div>

            <div class="text-sm text-gray-700 dark:text-gray-300">
              <span v-if="variant.finalPrice && variant.finalPrice !== variant.price" class="line-through text-xs text-gray-400 dark:text-gray-500 me-1">
                {{ formatMoney(variant.price) }}
              </span>
              {{ formatMoney(variant.finalPrice ?? variant.price) }}
            </div>

            <div class="text-xs text-gray-600 dark:text-gray-400">
              موجودی: {{ (variant.availableQuantity ?? 0).toLocaleString('fa-IR') }}
            </div>

            <StatusBadge :meta="variant.isActive ? { label: 'فعال', color: 'success' } : { label: 'غیرفعال', color: 'neutral' }" />

            <UButton
              :to="`/panel/products/${variant.id}`"
              color="neutral"
              variant="ghost"
              size="xs"
              icon="i-heroicons-pencil-square"
            >
              ویرایش
            </UButton>
          </li>
        </ul>
      </Transition>
    </div>

    <GenerateVariantsModal v-model:open="generateOpen" :model="product" :axes="axes" @saved="load" />
    <VariantCreateModal v-model:open="createOpen" :model="product" :axes="axes" @saved="load" />
  </UCard>
</template>

<script setup>
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import GenerateVariantsModal from '@/components/panel/products/GenerateVariantsModal.vue'
import VariantCreateModal from '@/components/panel/products/VariantCreateModal.vue'
import { formatMoney } from '~/utils/money.js'

// Variants of a model product (BACK isModel). The model itself is not sold; each variant has its own code, price and stock.
const props = defineProps({
  // The model GoodsDTO (uses id)
  product: { type: Object, required: true },
})

const app = useNuxtApp()

const variants = ref([])
const loading = ref(true)
const error = ref(null)

// "رنگ: قرمز · سایز: M"
const axesText = (variant) =>
  (variant.axes ?? []).map((axis) => `${axis.attributeName}: ${axis.optionValue}`).join(' · ') || '—'

const load = async () => {
  loading.value = true
  try {
    const res = await app.$api.catalogAdmin.listVariants({ data: { modelId: props.product.id } })
    variants.value = res.data.data ?? []
    error.value = null
  } catch (e) {
    variants.value = []
    error.value = e
  } finally {
    loading.value = false
  }
}

// Variant axes: the attributes flagged variantAxis on the model's categories (inherited ones included), one per attribute
const axes = ref([])
const axesLoading = ref(true)
const axesError = ref(false)

const loadAxes = async () => {
  axesLoading.value = true
  try {
    const categoryIds = Array.from(props.product.categoryIds ?? [])
    const lists = await Promise.all(
      categoryIds.map((categoryId) => app.$api.catalogAdmin.listCategoryAttributes({ data: { categoryId } }))
    )
    const byAttribute = new Map()
    for (const res of lists) {
      for (const row of res.data.data ?? []) {
        if (!row.variantAxis || !row.attribute || byAttribute.has(row.attribute.id)) continue
        byAttribute.set(row.attribute.id, {
          attributeId: row.attribute.id,
          attributeName: row.attribute.name,
          options: [...(row.attribute.options ?? [])]
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((option) => ({ id: option.id, value: option.value })),
        })
      }
    }
    axes.value = [...byAttribute.values()]
    axesError.value = false
  } catch {
    axes.value = []
    axesError.value = true
  } finally {
    axesLoading.value = false
  }
}

const generateOpen = ref(false)
const createOpen = ref(false)
const openGenerate = () => (generateOpen.value = true)
const openCreate = () => (createOpen.value = true)

watch(() => props.product.id, () => {
  load()
  loadAxes()
})

onMounted(() => {
  load()
  loadAxes()
})

defineExpose({ reload: load })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
