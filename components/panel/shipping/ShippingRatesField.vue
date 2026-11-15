<!-- components/panel/shipping/ShippingRatesField.vue -->
<template>
  <div class="space-y-3">
    <div v-for="(row, index) in modelValue" :key="index" class="flex flex-col sm:flex-row gap-3 sm:items-start">
      <UFormField class="sm:flex-1 min-w-0" label="استان" required :error="rowError(index, 'provinceId')">
        <USelectMenu
          :model-value="row.provinceId"
          :items="provinceItemsFor(row)"
          value-key="value"
          placeholder="انتخاب استان"
          class="w-full"
          @update:model-value="setProvince(index, $event)"
        />
      </UFormField>

      <UFormField class="sm:flex-1 min-w-0" label="شهر" :error="rowError(index, 'cityId')">
        <USelectMenu
          :model-value="cityValue(row)"
          :items="cityItemsFor(row)"
          value-key="value"
          :disabled="!row.provinceId"
          placeholder="همه‌ی شهرهای استان"
          class="w-full"
          @update:model-value="setCity(index, $event)"
        />
      </UFormField>

      <div class="sm:flex-1 min-w-0">
        <MoneyInput
          :model-value="row.cost"
          label="هزینه"
          :required="true"
          :error="rowError(index, 'cost')"
          @update:model-value="patch(index, { cost: $event })"
        />
      </div>

      <UButton
        class="self-end sm:self-start sm:mt-6 flex-shrink-0"
        color="error"
        variant="ghost"
        square
        icon="i-heroicons-trash"
        aria-label="حذف این مقصد"
        @click="remove(index)"
      />
    </div>

    <p v-if="error" class="text-xs text-error">{{ error }}</p>

    <div class="flex items-center justify-between gap-3 flex-wrap">
      <UButton
        color="neutral"
        variant="outline"
        size="sm"
        icon="i-heroicons-plus"
        :disabled="modelValue.length >= MAX_RATES"
        @click="add"
      >
        افزودن مقصد
      </UButton>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        تعرفه‌ی شهر بر تعرفه‌ی استان و هر دو بر هزینه‌ی پایه مقدم‌اند
      </p>
    </div>

    <p v-if="provincesFailed" class="text-xs text-error">فهرست استان‌ها بارگذاری نشد</p>
  </div>
</template>

<script setup>
// Per-destination rate table of a shipping method (v-model = [{provinceId, provinceName, cityId, cityName, cost}]).
// Province and city lists come from the public location endpoints through `$api.address`.
import MoneyInput from '@/components/panel/MoneyInput.vue'

const MAX_RATES = 500
// USelectMenu value for "every city of the province"; the model stores cityId null for it.
const ALL_CITIES = 'ALL_CITIES'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  // Whole-field message (e.g. LISTED with no rows)
  error: { type: String, default: '' },
  // One object per row: {provinceId?, cityId?, cost?} with a message each
  rowErrors: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

const app = useNuxtApp()

const provinces = ref([])
const provincesFailed = ref(false)
// cities cached per provinceId; a key with [] while loading
const citiesByProvince = reactive({})

const toItem = (value, label) => ({ label, value })

// The stored name keeps the label visible before the lists arrive (and for a province/city not in the list).
const provinceItemsFor = (row) => {
  const items = provinces.value.map((province) => toItem(province.id, province.nameFa))
  if (row.provinceId && !items.some((item) => item.value === row.provinceId)) {
    items.unshift(toItem(row.provinceId, row.provinceName ?? String(row.provinceId)))
  }
  return items
}

const cityValue = (row) => (row.cityId ? row.cityId : ALL_CITIES)

const cityItemsFor = (row) => {
  const items = [toItem(ALL_CITIES, 'همه‌ی شهرهای استان')]
  const cities = citiesByProvince[row.provinceId] ?? []
  cities.forEach((city) => items.push(toItem(city.id, city.nameFa)))
  if (row.cityId && !items.some((item) => item.value === row.cityId)) {
    items.push(toItem(row.cityId, row.cityName ?? String(row.cityId)))
  }
  return items
}

const rowError = (index, field) => props.rowErrors[index]?.[field] ?? ''

const labelOf = (items, value) => items.find((item) => item.value === value)?.label ?? ''

const emitRows = (rows) => emit('update:modelValue', rows)

const patch = (index, changes) => {
  emitRows(props.modelValue.map((row, i) => (i === index ? { ...row, ...changes } : row)))
}

const loadCities = async (provinceId) => {
  if (!provinceId || citiesByProvince[provinceId]) return
  citiesByProvince[provinceId] = []
  try {
    const res = await app.$api.address.getCity({ id: provinceId })
    citiesByProvince[provinceId] = res.data.data ?? []
  } catch {
    // Without the list the stored city label still shows; the city can't be changed until a reload.
    citiesByProvince[provinceId] = undefined
  }
}

const setProvince = (index, provinceId) => {
  const name = labelOf(provinceItemsFor(props.modelValue[index]), provinceId)
  patch(index, { provinceId, provinceName: name, cityId: null, cityName: null })
  loadCities(provinceId)
}

const setCity = (index, value) => {
  if (value === ALL_CITIES) {
    patch(index, { cityId: null, cityName: null })
    return
  }
  const name = labelOf(cityItemsFor(props.modelValue[index]), value)
  patch(index, { cityId: value, cityName: name })
}

const add = () => emitRows([...props.modelValue, { provinceId: null, provinceName: '', cityId: null, cityName: '', cost: null }])

const remove = (index) => emitRows(props.modelValue.filter((_, i) => i !== index))

const loadProvinces = async () => {
  try {
    const res = await app.$api.address.getState()
    provinces.value = res.data.data ?? []
  } catch {
    provincesFailed.value = true
  }
}

onMounted(() => {
  loadProvinces()
  props.modelValue.forEach((row) => loadCities(row.provinceId))
})
</script>
