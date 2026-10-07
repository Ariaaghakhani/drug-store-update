<template>
  <div class="space-y-5">
    <UCard v-if="product" :ui="{ body: 'p-0' }">
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
            ویرایش <span class="text-brand-500">محصول</span>
          </h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
            {{ product.nameFa }}
          </p>
        </div>
      </div>

      <div class="px-6 py-6 space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">کد کالا</label>
            <UInput v-model="form.goodCode" placeholder="مثال: AMX-500" dir="ltr" class="w-full" />
          </div>
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
          <div class="space-y-1.5 sm:col-span-2">
            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">دسته‌بندی‌ها</label>
            <USelectMenu
              v-model="form.categoryIds"
              :items="categoryMenuItems"
              multiple
              value-key="value"
              placeholder="انتخاب دسته‌بندی‌ها"
              class="w-full"
            />
          </div>
          <div class="space-y-1.5 sm:col-span-2">
            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">تگ‌ها</label>
            <USelectMenu
              v-model="form.tagIds"
              :items="tagMenuItems"
              multiple
              value-key="value"
              placeholder="انتخاب تگ‌ها"
              class="w-full"
            />
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
      </div>

      <div class="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
        <UButton variant="soft" color="neutral" class="justify-center" @click="goBack">انصراف</UButton>
        <UButton
          color="primary"
          class="justify-center"
          :loading="saving"
          :disabled="!form.nameFa.trim() || !form.priceRaw.trim() || !form.goodCode.trim()"
          @click="handleSave"
        >
          ذخیره تغییرات
        </UButton>
      </div>
    </UCard>

    <UCard v-else-if="!loading">
      <div class="flex flex-col items-center justify-center py-16 gap-3">
        <UIcon name="i-heroicons-cube" class="w-16 h-16 text-gray-300 dark:text-gray-700" />
        <p class="text-base font-bold text-gray-900 dark:text-white">محصول یافت نشد</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">این محصول حذف شده یا شناسه آن نامعتبر است</p>
        <UButton color="primary" variant="soft" class="mt-2" @click="goBack">بازگشت به فهرست</UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import ProductImagesField from '@/components/panel/products/ProductImagesField.vue'

definePageMeta({ layout: 'panel' })
useHead({ title: 'ویرایش محصول | پنل مدیریت' })

const route = useRoute()
const app = useNuxtApp()
const toast = useToast()
const rolesStore = useRolesStore()
const { getUserRole } = useUserPanelTabs()

const canUpdate = computed(() => {
  const role = rolesStore.roles.find((r) => r.id === getUserRole())
  return role?.permissions.products?.update ?? false
})

if (!canUpdate.value) {
  await navigateTo('/panel/products')
}

const product = ref(null)
const loading = ref(true)
const saving = ref(false)
const categoryMenuItems = ref([])
const tagMenuItems = ref([])

const form = reactive({
  goodCode: '',
  nameFa: '',
  nameEn: '',
  brandTitle: '',
  categoryIds: [],
  tagIds: [],
  priceRaw: '',
  expiryDate: '',
  isPrescriptionRequired: false,
  images: [],
})

const toastErrorMessage = (err, fallback) => err?.response?.data?.message ?? fallback

const loadCategories = async () => {
  try {
    const response = await app.$api.catalog.listCategories({ params: { scope: 'PRODUCT' } })
    categoryMenuItems.value = (response.data.data ?? []).map((c) => ({ label: c.name, value: String(c.id) }))
  } catch {
    categoryMenuItems.value = []
  }
}

const loadTags = async () => {
  try {
    const response = await app.$api.goods.getTags()
    tagMenuItems.value = (response.data.data ?? []).map((t) => ({ label: t.name, value: String(t.id) }))
  } catch {
    tagMenuItems.value = []
  }
}

const loadProduct = async () => {
  loading.value = true
  try {
    const response = await app.$api.goods.getGoods({ data: { id: Number(route.params.id) } })
    const g = response.data.data
    product.value = g
    form.goodCode = g.goodCode ?? ''
    form.nameFa = g.nameFa ?? ''
    form.nameEn = g.nameEn ?? ''
    form.brandTitle = g.brandTitle ?? ''
    form.categoryIds = g.categoryIds ? Array.from(g.categoryIds).map(String) : []
    form.tagIds = g.tagIds ? Array.from(g.tagIds).map(String) : []
    form.priceRaw = String(g.price ?? '')
    form.expiryDate = g.expiryDate ?? ''
    form.isPrescriptionRequired = g.isPrescriptionRequired ?? false
    form.images = []
  } catch {
    product.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCategories()
  loadTags()
  loadProduct()
})

const goBack = () => navigateTo('/panel/products')

const handleSave = async () => {
  if (!product.value) return
  saving.value = true
  try {
    const payload = {
      id: Number(route.params.id),
      goodCode: form.goodCode.trim(),
      nameFa: form.nameFa.trim(),
      nameEn: form.nameEn.trim() || undefined,
      price: Number(form.priceRaw) || 0,
      isPrescriptionRequired: form.isPrescriptionRequired,
      expiryDate: form.expiryDate || undefined,
      categoryIds: form.categoryIds.map(Number),
      tagIds: form.tagIds.map(Number),
    }
    await app.$api.goods.updateGoods({ data: payload })
    toast.add({ title: 'تغییرات محصول ذخیره شد', color: 'success' })
    goBack()
  } catch (err) {
    toast.add({ title: toastErrorMessage(err, 'خطا در ذخیره تغییرات'), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>
