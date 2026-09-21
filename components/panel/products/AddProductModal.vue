<template>
  <UModal :open="open" :ui="{ content: 'sm:max-w-lg p-0 gap-0 overflow-hidden' }" @update:open="emit('update:open', $event)">
    <template #content>
      <div class="flex flex-col font-dana" dir="rtl">
        <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div class="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-heroicons-cube" class="w-4 h-4 text-brand-500" />
          </div>
          <h3 class="flex-1 text-sm font-semibold text-gray-900 dark:text-white">افزودن محصول جدید</h3>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="emit('update:open', false)"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>

        <div class="px-5 py-5 space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-700 dark:text-gray-300">نام فارسی</label>
              <UInput v-model="form.nameFa" placeholder="مثال: آموکسی‌سیلین ۵۰۰ میلی‌گرم" class="w-full" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-700 dark:text-gray-300">نام انگلیسی</label>
              <UInput v-model="form.nameEn" placeholder="Amoxicillin 500mg" dir="ltr" class="w-full" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-700 dark:text-gray-300">برند</label>
              <UInput v-model="form.brandTitle" placeholder="نام برند سازنده" class="w-full" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-700 dark:text-gray-300">دسته‌بندی</label>
              <USelect v-model="form.category" :items="categoryItems" class="w-full" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-700 dark:text-gray-300">قیمت (تومان)</label>
              <UInput v-model="form.priceRaw" placeholder="مثال: 185000" dir="ltr" inputmode="numeric" class="w-full" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-700 dark:text-gray-300">تاریخ انقضا</label>
              <UInput v-model="form.expiryDate" placeholder="YYYY-MM-DD" dir="ltr" class="w-full" />
            </div>
          </div>
          <div class="flex items-center justify-between py-1">
            <span class="text-xs font-medium text-gray-700 dark:text-gray-300">نیاز به نسخه</span>
            <USwitch
              v-model="form.isPrescriptionRequired"
              size="lg"
              :ui="{
                base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
              }"
            />
          </div>
          <div class="flex items-center justify-between py-1">
            <span class="text-xs font-medium text-gray-700 dark:text-gray-300">موجود در انبار</span>
            <USwitch
              v-model="form.inStock"
              size="lg"
              :ui="{
                base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
              }"
            />
          </div>
        </div>

        <div class="flex gap-3 px-5 pb-5">
          <UButton variant="soft" color="neutral" class="flex-1 justify-center" @click="emit('update:open', false)">انصراف</UButton>
          <UButton
            color="primary"
            class="flex-1 justify-center"
            :disabled="!form.nameFa.trim() || !form.priceRaw.trim()"
            @click="handleSubmit"
          >
            ذخیره
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Product } from '@/types/panel-products'

interface SelectItem {
  label: string
  value: string
}

defineProps<{
  open: boolean
  categoryItems: SelectItem[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  create: [product: Omit<Product, 'id'>]
}>()

const form = reactive({
  nameFa: '',
  nameEn: '',
  brandTitle: '',
  category: '',
  priceRaw: '',
  expiryDate: '',
  isPrescriptionRequired: false,
  inStock: true,
})

const handleSubmit = () => {
  emit('create', {
    nameFa: form.nameFa,
    nameEn: form.nameEn || undefined,
    brandTitle: form.brandTitle || undefined,
    category: form.category || undefined,
    price: Number(form.priceRaw) || 0,
    inStock: form.inStock,
    isPrescriptionRequired: form.isPrescriptionRequired,
    expiryDate: form.expiryDate || undefined,
  })
  Object.assign(form, { nameFa: '', nameEn: '', brandTitle: '', category: '', priceRaw: '', expiryDate: '', isPrescriptionRequired: false, inStock: true })
  emit('update:open', false)
}
</script>