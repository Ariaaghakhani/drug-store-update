<template>
  <UModal v-model:open="isOpen" :ui="{ content: 'sm:max-w-lg p-0 gap-0 overflow-hidden' }" :dismissible="false">
    <template #content>
      <div class="flex flex-col max-h-[90vh] font-dana" dir="rtl">
        <div class="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-3 px-5 py-4">
            <div class="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-brand-500" />
            </div>
            <h3 class="flex-1 text-sm font-semibold text-gray-900 dark:text-white">
              {{ address ? 'ویرایش آدرس' : 'افزودن آدرس جدید' }}
            </h3>
            <button
              class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              @click="isOpen = false"
            >
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="overflow-y-auto flex-1 px-5 py-5 space-y-5">
          <!-- Address type -->
          <div class="space-y-2">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">نوع آدرس</p>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="type in addressTypes"
                :key="type.value"
                :class="['flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-colors', form.type === type.value ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 text-brand-500' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600']"
                @click="onTypeSelect(type.value)"
              >
                <UIcon :name="type.icon" class="w-5 h-5" />
                <span class="text-xs font-medium">{{ type.label }}</span>
              </button>
            </div>
          </div>

          <UFormField label="عنوان آدرس" name="label" :error="visibleErrors.label">
            <UInput v-model="form.label" placeholder="مثلاً: خانه مادربزرگ" class="w-full" />
          </UFormField>

          <div class="grid grid-cols-2 gap-3">
            <UFormField label="استان" name="province" :error="visibleErrors.province">
              <USelectMenu
                v-model="selectedProvinceObj"
                :items="provinces"
                :label="selectedProvinceObj?.label"
                placeholder="انتخاب استان"
                class="w-full"
                :search-input="{ placeholder: 'جستجو...', icon: 'i-lucide-search' }"
                @update:model-value="onProvinceSelect"
              >
                <template #item="{ item }">
                  <span class="font-dana">{{ item.nameFa || item.name }}</span>
                </template>
                <template #empty>
                  <span class="text-gray-400 font-dana">نتیجه‌ای یافت نشد</span>
                </template>
              </USelectMenu>
            </UFormField>

            <UFormField label="شهر" name="city" :error="visibleErrors.city">
              <USelectMenu
                v-model="selectedCityObj"
                :items="cities"
                :label="selectedCityObj?.label"
                placeholder="انتخاب شهر"
                class="w-full"
                :disabled="!selectedProvinceObj"
                :search-input="{ placeholder: 'جستجو...', icon: 'i-lucide-search' }"
                @update:model-value="onCitySelect"
              >
                <template #item="{ item }">
                  <span class="font-dana">{{ item.nameFa || item.name }}</span>
                </template>
                <template #empty>
                  <span class="text-gray-400 font-dana">نتیجه‌ای یافت نشد</span>
                </template>
              </USelectMenu>
            </UFormField>
          </div>

          <UFormField label="آدرس کامل" name="street" :error="visibleErrors.street">
            <UTextarea v-model="form.street" placeholder="خیابان، کوچه، پلاک، واحد" :rows="3" class="w-full" />
          </UFormField>

          <div class="grid grid-cols-2 gap-3">
            <UFormField label="کد پستی" name="postalCode" :error="visibleErrors.postalCode">
              <UInput v-model="form.postalCode" dir="ltr" placeholder="0000000000" maxlength="10" class="w-full" />
            </UFormField>
            <UFormField label="شماره تماس تحویل" name="phone">
              <UInput v-model="form.phone" dir="ltr" placeholder="09xxxxxxxxx" maxlength="11" class="w-full" />
            </UFormField>
          </div>

          <label
            :class="['flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-colors', form.isDefault ? 'bg-brand-500/5 dark:bg-brand-500/10 border-brand-500/40' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600']"
          >
            <input v-model="form.isDefault" type="checkbox" class="w-4 h-4 accent-[var(--color-brand-500)] flex-shrink-0" />
            <span class="text-sm text-gray-700 dark:text-gray-300 select-none">تنظیم به عنوان آدرس پیش‌فرض</span>
          </label>
        </div>

        <div class="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-5 py-4 flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="isOpen = false">انصراف</UButton>
          <UButton color="primary" :loading="saving" @click="handleSave">ذخیره آدرس</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Address } from '@/components/panel/address/AddressCard.vue'

export interface ProvinceOption {
  id: number | null
  name: string
  nameFa: string
  label: string
}

export interface CityOption {
  id: number | null
  name: string
  nameFa: string
  label: string
}

export interface AddressForm {
  type: 'home' | 'work' | 'other'
  label: string
  province: string
  city: string
  district: string
  street: string
  postalCode: string
  phone: string
  isDefault: boolean
}

const props = defineProps<{
  open: boolean
  address: Address | null
  provinces: ProvinceOption[]
  cities: CityOption[]
  saving?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [form: AddressForm, id: number | null]
  'province-change': [provinceObj: ProvinceOption]
}>()

const isOpen = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
})

const addressTypes = [
  { value: 'home' as const, label: 'خانه', icon: 'i-heroicons-home' },
  { value: 'work' as const, label: 'محل کار', icon: 'i-heroicons-building-office' },
  { value: 'other' as const, label: 'سایر', icon: 'i-heroicons-map-pin' },
]

const TYPE_LABELS: Record<string, string> = { home: 'خانه', work: 'محل کار' }

const defaultForm = (): AddressForm => ({
  type: 'home',
  label: 'خانه',
  province: '',
  city: '',
  district: '',
  street: '',
  postalCode: '',
  phone: '',
  isDefault: false,
})

const form = ref<AddressForm>(defaultForm())
const selectedProvinceObj = ref<ProvinceOption | null>(null)
const selectedCityObj = ref<CityOption | null>(null)

const formErrors = reactive({ label: '', province: '', city: '', street: '', postalCode: '' })
const hasSubmitted = ref(false)

const visibleErrors = computed(() => {
  if (!hasSubmitted.value) return {} as typeof formErrors
  return Object.fromEntries(
    Object.entries(formErrors).map(([k, v]) => [k, v || undefined])
  ) as Partial<typeof formErrors>
})

const clearErrors = () => {
  hasSubmitted.value = false
  Object.keys(formErrors).forEach((k) => ((formErrors as Record<string, string>)[k] = ''))
}

const validate = () => {
  hasSubmitted.value = true
  Object.keys(formErrors).forEach((k) => ((formErrors as Record<string, string>)[k] = ''))
  let valid = true
  if (!form.value.label.trim()) { formErrors.label = 'عنوان آدرس الزامی است'; valid = false }
  if (!form.value.province) { formErrors.province = 'انتخاب استان الزامی است'; valid = false }
  if (!form.value.city) { formErrors.city = 'انتخاب شهر الزامی است'; valid = false }
  if (!form.value.street.trim()) { formErrors.street = 'آدرس کامل الزامی است'; valid = false }
  if (form.value.postalCode && !/^\d{10}$/.test(form.value.postalCode)) {
    formErrors.postalCode = 'کد پستی باید ۱۰ رقم باشد'; valid = false
  }
  return valid
}

watch(
  () => props.open,
  (val) => {
    if (!val) return
    clearErrors()
    if (props.address) {
      form.value = { ...props.address }
      const provinceObj = props.provinces.find((p) => p.name === props.address!.province) ?? null
      selectedProvinceObj.value = provinceObj
      selectedCityObj.value = null
      if (provinceObj) emit('province-change', provinceObj)
    } else {
      form.value = defaultForm()
      selectedProvinceObj.value = null
      selectedCityObj.value = null
    }
  }
)

// Set city after parent loads cities for edit mode
watch(
  () => props.cities,
  (newCities) => {
    if (props.address && form.value.city && !selectedCityObj.value) {
      selectedCityObj.value = newCities.find((c) => c.name === form.value.city) ?? null
    }
  }
)

const onTypeSelect = (type: AddressForm['type']) => {
  form.value.type = type
  form.value.label = TYPE_LABELS[type] ?? ''
}

const onProvinceSelect = (provinceObj: ProvinceOption) => {
  form.value.province = provinceObj?.name ?? ''
  form.value.city = ''
  selectedCityObj.value = null
  emit('province-change', provinceObj)
}

const onCitySelect = (cityObj: CityOption) => {
  form.value.city = cityObj?.name ?? ''
}

const handleSave = () => {
  if (!validate()) return
  emit('save', { ...form.value }, props.address?.id ?? null)
}
</script>
