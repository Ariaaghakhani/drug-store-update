<template>
  <div class="space-y-5">
    <UCard :ui="{ body: 'p-0' }">
      <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <UButton
          icon="i-heroicons-arrow-right"
          color="neutral"
          variant="ghost"
          square
          @click="goBack"
        />
        <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-100 dark:bg-brand-900/20 flex-shrink-0">
          <UIcon name="i-heroicons-cube" class="w-5 h-5 text-brand-500 dark:text-brand-400" />
        </div>
        <div class="min-w-0">
          <h1 class="text-lg font-black text-gray-900 dark:text-white">
            افزودن <span class="text-brand-500">محصول</span>
          </h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            یک محصول جدید به پایگاه داده اضافه کنید
          </p>
        </div>
      </div>

      <div class="px-6 py-6 space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">نام فارسی</label>
            <UInput v-model="form.nameFa" placeholder="مثال: آموکسی‌سیلین ۵۰۰ میلی‌گرم" class="w-full" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">نام انگلیسی</label>
            <UInput v-model="form.nameEn" placeholder="Amoxicillin 500mg" dir="ltr" class="w-full" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">برند</label>
            <UInput v-model="form.brandTitle" placeholder="نام برند سازنده" class="w-full" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">دسته‌بندی</label>
            <USelect v-model="form.category" :items="assignableCategories" class="w-full" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">قیمت (تومان)</label>
            <UInput v-model="form.priceRaw" placeholder="مثال: 185000" dir="ltr" inputmode="numeric" class="w-full" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">تاریخ انقضا</label>
            <UInput v-model="form.expiryDate" placeholder="YYYY-MM-DD" dir="ltr" class="w-full" />
          </div>
        </div>

        <ProductImagesField v-model="form.images" class="border-t border-gray-100 dark:border-gray-800 pt-4" />

        <div class="flex items-center justify-between py-1 border-t border-gray-100 dark:border-gray-800 pt-4">
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

      <div class="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
        <UButton variant="soft" color="neutral" class="justify-center" @click="goBack">انصراف</UButton>
        <UButton
          color="primary"
          class="justify-center"
          :disabled="!form.nameFa.trim() || !form.priceRaw.trim()"
          @click="handleCreate"
        >
          افزودن محصول
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import ProductImagesField from '@/components/panel/products/ProductImagesField.vue'

definePageMeta({ layout: 'panel' })
useHead({ title: 'افزودن محصول | پنل مدیریت' })

const rolesStore = useRolesStore()
const productsStore = useProductsStore()
const { getUserRole } = useUserPanelTabs()

const canCreate = computed(() => {
  const role = rolesStore.roles.find((r) => r.id === getUserRole())
  return role?.permissions.products?.create ?? false
})

// Users without create permission cannot add products
if (!canCreate.value) {
  await navigateTo('/panel/products')
}

// Categories that can be assigned (exclude the "all" filter option)
const assignableCategories = computed(() =>
  productsStore.categoryItems.filter((c) => c.value !== 'all')
)

const form = reactive({
  nameFa: '',
  nameEn: '',
  brandTitle: '',
  category: '',
  priceRaw: '',
  expiryDate: '',
  isPrescriptionRequired: false,
  inStock: true,
  images: [] as string[],
})

const toast = useToast()

const goBack = () => navigateTo('/panel/products')

const handleCreate = () => {
  const id = productsStore.addProduct({
    nameFa: form.nameFa,
    nameEn: form.nameEn || undefined,
    brandTitle: form.brandTitle || undefined,
    category: form.category || undefined,
    price: Number(form.priceRaw) || 0,
    inStock: form.inStock,
    isPrescriptionRequired: form.isPrescriptionRequired,
    expiryDate: form.expiryDate || undefined,
    images: form.images.length ? [...form.images] : undefined,
  })
  toast.add({ title: 'محصول جدید اضافه شد', color: 'success' })
  navigateTo(`/panel/products/${id}`)
}
</script>