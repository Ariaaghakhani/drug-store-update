<template>
  <UCard :ui="{ body: 'p-0' }">
    <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
      <UIcon name="i-heroicons-adjustments-horizontal" class="w-4 h-4 text-brand-500" />
      <span class="text-sm font-medium text-gray-900 dark:text-white">فیلترها</span>
      <UButton
        v-if="activeCount > 0"
        color="neutral"
        variant="soft"
        size="sm"
        class="ms-auto"
        @click="clearAll"
      >
        حذف همه ({{ activeCount.toLocaleString('fa-IR') }})
      </UButton>
    </div>

    <!-- Loading brands/facets for the first time -->
    <div v-if="loading" class="divide-y divide-gray-100 dark:divide-gray-800">
      <div v-for="i in 3" :key="i" class="px-4 sm:px-6 py-4 space-y-3">
        <USkeleton class="h-5 w-24" />
        <USkeleton class="h-5 w-full" />
        <USkeleton class="h-5 w-3/4" />
      </div>
    </div>

    <div v-else class="divide-y divide-gray-100 dark:divide-gray-800">
      <!-- Availability / discount -->
      <div class="px-4 sm:px-6 py-4 space-y-3">
        <UCheckbox
          label="فقط کالاهای موجود"
          :model-value="state.inStock"
          @update:model-value="update({ inStock: $event === true })"
        />
        <UCheckbox
          label="فقط کالاهای تخفیف‌دار"
          :model-value="state.onSale"
          @update:model-value="update({ onSale: $event === true })"
        />
      </div>

      <!-- Categories (only when BACK lets guests read them) -->
      <div v-if="categoryItems.length > 0" class="px-4 sm:px-6 py-4 space-y-3">
        <h3 class="text-sm font-bold text-gray-900 dark:text-white">دسته‌بندی</h3>
        <div class="space-y-2 max-h-56 overflow-y-auto">
          <UCheckbox
            v-for="item in categoryItems"
            :key="item.id"
            :label="item.name"
            :class="item.depth > 0 ? 'ms-5' : ''"
            :model-value="state.categoryId === item.id"
            @update:model-value="update({ categoryId: $event === true ? item.id : null })"
          />
        </div>
      </div>

      <!-- Brands -->
      <div v-if="brands.length > 0" class="px-4 sm:px-6 py-4 space-y-3">
        <h3 class="text-sm font-bold text-gray-900 dark:text-white">برند</h3>
        <div class="space-y-2 max-h-56 overflow-y-auto">
          <div
            v-for="brand in brands"
            :key="brand.id"
            class="flex items-center justify-between gap-2"
          >
            <UCheckbox
              :label="brand.name"
              :model-value="state.brandIds.includes(brand.id)"
              @update:model-value="toggleBrand(brand.id, $event === true)"
            />
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ Number(brand.goodsCount).toLocaleString('fa-IR') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Attribute facets -->
      <div v-for="facet in visibleFacets" :key="facet.attributeId" class="px-4 sm:px-6 py-4 space-y-3">
        <h3 class="text-sm font-bold text-gray-900 dark:text-white">
          {{ facet.name }}<span v-if="facet.unit" class="font-normal text-gray-500 dark:text-gray-400"> ({{ facet.unit }})</span>
        </h3>

        <!-- SELECT / MULTI_SELECT -->
        <div v-if="facet.options.length > 0" class="space-y-2 max-h-56 overflow-y-auto">
          <div
            v-for="option in facet.options"
            :key="option.optionId"
            class="flex items-center justify-between gap-2"
          >
            <UCheckbox
              :label="option.value"
              :model-value="attrOf(facet).optionIds.includes(option.optionId)"
              @update:model-value="toggleOption(facet, option.optionId, $event === true)"
            />
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ Number(option.count).toLocaleString('fa-IR') }}
            </span>
          </div>
        </div>

        <!-- BOOLEAN -->
        <div v-else-if="facet.type === 'BOOLEAN'" class="flex items-center justify-between gap-2">
          <UCheckbox
            label="دارد"
            :model-value="attrOf(facet).bool"
            @update:model-value="setAttr(facet, { bool: $event === true })"
          />
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ Number(facet.trueCount).toLocaleString('fa-IR') }}
          </span>
        </div>

        <!-- NUMBER range -->
        <div v-else class="flex items-center gap-2">
          <UInput
            v-model="drafts[facet.attributeId].min"
            inputmode="decimal"
            dir="ltr"
            :placeholder="Number(facet.min).toLocaleString('fa-IR')"
            class="flex-1"
            @blur="applyRange(facet)"
            @keyup.enter="applyRange(facet)"
          />
          <span class="text-gray-400">–</span>
          <UInput
            v-model="drafts[facet.attributeId].max"
            inputmode="decimal"
            dir="ltr"
            :placeholder="Number(facet.max).toLocaleString('fa-IR')"
            class="flex-1"
            @blur="applyRange(facet)"
            @keyup.enter="applyRange(facet)"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  // the full search state (utils/searchQuery.js::parseSearchQuery)
  state: { type: Object, required: true },
  // AttributeFacetDTO[] from POST api/elastic/search/facets
  facets: { type: Array, default: () => [] },
  // StorefrontBrandDTO[] from GET api/storefront/brands
  brands: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

// Emits the whole next state (page reset to 1); the page turns it into a route change.
const emit = defineEmits(['change'])

const update = (patch) => emit('change', { ...props.state, ...patch, page: 1 })

const activeCount = computed(() => activeFilterCount(props.state))

const clearAll = () => update({ categoryId: null, inStock: false, onSale: false, brandIds: [], attrs: {} })

// top-level categories with their direct children underneath, flattened for a single-choice checkbox list
const { tree: categoryTree } = useStoreCategories()
const categoryItems = computed(() =>
  categoryTree.value.flatMap((root) => [
    { id: root.id, name: root.name, depth: 0 },
    ...(root.children ?? []).map((child) => ({ id: child.id, name: child.name, depth: 1 })),
  ])
)

const toggleBrand = (id, on) => {
  const next = props.state.brandIds.filter((b) => b !== id)
  if (on) next.push(id)
  update({ brandIds: next })
}

// A facet is worth showing only if it has something to pick; TEXT attributes carry no facet data.
const visibleFacets = computed(() =>
  props.facets.filter((facet) => {
    if (facet.options?.length > 0) return true
    if (facet.type === 'BOOLEAN') return Number(facet.trueCount) > 0
    if (facet.type === 'NUMBER') return facet.min != null && facet.max != null && facet.min !== facet.max
    return false
  })
)

const attrOf = (facet) => props.state.attrs[facet.attributeId] ?? emptyAttr()

const setAttr = (facet, patch) => {
  const attrs = { ...props.state.attrs, [facet.attributeId]: { ...attrOf(facet), ...patch } }
  update({ attrs })
}

const toggleOption = (facet, optionId, on) => {
  const next = attrOf(facet).optionIds.filter((id) => id !== optionId)
  if (on) next.push(optionId)
  setAttr(facet, { optionIds: next })
}

// Range inputs keep a local draft and apply on blur/enter, so typing doesn't re-search on every key.
const drafts = reactive({})
watch(
  [() => props.facets, () => props.state.attrs],
  () => {
    for (const facet of props.facets) {
      const attr = props.state.attrs[facet.attributeId] ?? emptyAttr()
      drafts[facet.attributeId] = { min: attr.min, max: attr.max }
    }
  },
  { immediate: true, deep: true }
)

const applyRange = (facet) => {
  const draft = drafts[facet.attributeId]
  const min = toLatinNumber(draft.min)
  const max = toLatinNumber(draft.max)
  const attr = attrOf(facet)
  if (min === attr.min && max === attr.max) return
  setAttr(facet, { min, max })
}
</script>
