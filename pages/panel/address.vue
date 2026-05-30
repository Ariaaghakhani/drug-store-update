<!-- pages/panel/address.vue -->
<template>
  <div class="space-y-4 font-dana" dir="rtl">

    <!-- ─── Page Header ────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-brand-500 flex-shrink-0" />
        <h2 class="text-base font-bold text-gray-900 dark:text-white">آدرس‌های من</h2>
      </div>
      <UButton color="primary" icon="i-heroicons-plus" size="sm" @click="openModal()">
        افزودن آدرس
      </UButton>
    </div>

    <!-- ─── Loading Skeleton ───────────────────────────────────────────────── -->
    <template v-if="isLoading">
      <UCard v-for="i in 2" :key="i" :ui="{ body: 'p-0' }">
        <div class="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <USkeleton class="w-9 h-9 rounded-lg flex-shrink-0" />
          <USkeleton class="h-5 flex-1 max-w-[6rem]" />
          <USkeleton class="h-5 w-16 rounded-full" />
        </div>
        <div class="px-4 sm:px-6 py-4 space-y-2 border-b border-gray-100 dark:border-gray-800">
          <USkeleton class="h-4 w-40" />
          <USkeleton class="h-3 w-full" />
          <USkeleton class="h-3 w-2/3" />
        </div>
        <div class="flex items-center justify-between px-4 sm:px-6 py-3.5">
          <USkeleton class="h-7 w-36 rounded-lg" />
          <div class="flex gap-1.5">
            <USkeleton class="h-8 w-8 rounded-lg" />
            <USkeleton class="h-8 w-8 rounded-lg" />
          </div>
        </div>
      </UCard>
    </template>

    <!-- ─── Empty State ────────────────────────────────────────────────────── -->
    <template v-else-if="addresses.length === 0">
      <div class="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-14 flex flex-col items-center gap-4 text-center">
        <div class="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center">
          <UIcon name="i-heroicons-map-pin" class="w-8 h-8 text-brand-500" />
        </div>
        <div class="space-y-1">
          <p class="text-base font-bold text-gray-900 dark:text-white">آدرسی ثبت نشده است</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">برای تکمیل سفارش‌هایتان یک آدرس اضافه کنید</p>
        </div>
        <UButton color="primary" icon="i-heroicons-plus" @click="openModal()">
          افزودن اولین آدرس
        </UButton>
      </div>
    </template>

    <!-- ─── Filled State ───────────────────────────────────────────────────── -->
    <template v-else>
      <div class="space-y-3">

        <UCard
          v-for="address in addresses"
          :key="address.id"
          :ui="{ body: 'p-0' }"
          :class="address.isDefault ? 'ring-1 ring-brand-500/30 dark:ring-brand-500/20' : ''"
        >
          <!-- Header row -->
          <div class="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div
              :class="[
                'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                address.isDefault
                  ? 'bg-brand-500/15 text-brand-500'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
              ]"
            >
              <UIcon :name="typeIcon(address.type)" class="w-5 h-5" />
            </div>
            <p class="flex-1 text-sm font-medium text-gray-900 dark:text-white">{{ address.label }}</p>
            <UBadge :color="address.isDefault ? 'success' : 'neutral'" variant="subtle" size="xs">
              {{ address.isDefault ? 'پیش‌فرض' : 'عادی' }}
            </UBadge>
          </div>

          <!-- Body -->
          <div class="px-4 sm:px-6 py-4 space-y-1.5 border-b border-gray-100 dark:border-gray-800">
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ address.province }}، {{ address.city }}<template v-if="address.district">، {{ address.district }}</template>
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ address.street }}</p>
            <div class="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              <UIcon name="i-heroicons-hashtag" class="w-3.5 h-3.5 flex-shrink-0" />
              <span dir="ltr">{{ address.postalCode }}</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-4 sm:px-6 py-3">
            <div v-if="address.isDefault" class="flex items-center gap-1.5 text-brand-500">
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4 flex-shrink-0" />
              <span class="text-xs font-medium">آدرس پیش‌فرض تحویل</span>
            </div>
            <UButton v-else variant="ghost" color="neutral" size="xs" @click="setDefault(address.id)">
              تنظیم به عنوان پیش‌فرض
            </UButton>

            <div class="flex items-center gap-1">
              <UButton variant="ghost" color="neutral" size="xs" icon="i-heroicons-pencil-square" square @click="openModal(address)" />
              <UButton variant="ghost" color="error" size="xs" icon="i-heroicons-trash" square @click="deleteAddress(address.id)" />
            </div>
          </div>
        </UCard>

        <!-- Add new dashed card -->
        <button
          class="w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-5 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:border-brand-500/50 hover:text-brand-500 dark:hover:border-brand-400/50 dark:hover:text-brand-400 transition-colors"
          @click="openModal()"
        >
          <UIcon name="i-heroicons-plus" class="w-5 h-5" />
          <span class="text-sm font-medium">افزودن آدرس جدید</span>
        </button>

      </div>
    </template>

    <!-- ─── Add / Edit Modal ───────────────────────────────────────────────── -->
    <UModal v-model:open="isModalOpen" :ui="{ content: 'sm:max-w-lg p-0 gap-0 overflow-hidden' }">
      <template #content>
        <div class="flex flex-col max-h-[90vh] font-dana" dir="rtl">

          <!-- Sticky header -->
          <div class="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
            <div class="flex items-center gap-3 px-5 py-4">
              <div class="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-brand-500" />
              </div>
              <h3 class="flex-1 text-sm font-semibold text-gray-900 dark:text-white">
                {{ editingId ? 'ویرایش آدرس' : 'افزودن آدرس جدید' }}
              </h3>
              <button
                class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                @click="isModalOpen = false"
              >
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </button>
            </div>
            <!-- Progress dots -->
            <div class="flex items-center gap-1.5 px-5 pb-4">
              <div
                v-for="i in 5"
                :key="i"
                :class="[
                  'h-1 rounded-full flex-1 transition-colors duration-300',
                  i <= 3 ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700',
                ]"
              />
            </div>
          </div>

          <!-- Scrollable body -->
          <div class="overflow-y-auto flex-1 px-5 py-5 space-y-5">

            <!-- Address type selector -->
            <div class="space-y-2">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">نوع آدرس</p>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="type in addressTypes"
                  :key="type.value"
                  :class="[
                    'flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-colors',
                    form.type === type.value
                      ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 text-brand-500'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600',
                  ]"
                  @click="form.type = type.value"
                >
                  <UIcon :name="type.icon" class="w-5 h-5" />
                  <span class="text-xs font-medium">{{ type.label }}</span>
                </button>
              </div>
            </div>

            <!-- Label -->
            <UFormField label="عنوان آدرس" name="label">
              <UInput v-model="form.label" placeholder="مثلاً: خانه مادربزرگ" class="w-full" />
            </UFormField>

            <!-- Province + City -->
            <div class="grid grid-cols-2 gap-3">
              <UFormField label="استان" name="province">
                <USelect v-model="form.province" :items="provinceOptions" placeholder="انتخاب استان" class="w-full" />
              </UFormField>
              <UFormField label="شهر" name="city">
                <USelect v-model="form.city" :items="cityOptions" placeholder="انتخاب شهر" :disabled="!form.province" class="w-full" />
              </UFormField>
            </div>

            <!-- Full address -->
            <UFormField label="آدرس کامل" name="street">
              <UTextarea v-model="form.street" placeholder="خیابان، کوچه، پلاک، واحد" :rows="3" class="w-full" />
            </UFormField>

            <!-- Postal code + Phone -->
            <div class="grid grid-cols-2 gap-3">
              <UFormField label="کد پستی" name="postalCode">
                <UInput v-model="form.postalCode" dir="ltr" placeholder="0000000000" maxlength="10" class="w-full" />
              </UFormField>
              <UFormField label="شماره تماس تحویل" name="phone">
                <UInput v-model="form.phone" dir="ltr" placeholder="09xxxxxxxxx" maxlength="11" class="w-full" />
              </UFormField>
            </div>

            <!-- Default toggle -->
            <label
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-colors',
                form.isDefault
                  ? 'bg-brand-500/5 dark:bg-brand-500/10 border-brand-500/40'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
              ]"
            >
              <input
                v-model="form.isDefault"
                type="checkbox"
                class="w-4 h-4 accent-[var(--color-brand-500)] flex-shrink-0"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300 select-none">
                تنظیم به عنوان آدرس پیش‌فرض
              </span>
            </label>

          </div>

          <!-- Sticky footer -->
          <div class="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-5 py-4 flex justify-end gap-2">
            <UButton variant="ghost" color="neutral" @click="isModalOpen = false">انصراف</UButton>
            <UButton color="primary" :loading="isSaving" @click="saveAddress">ذخیره آدرس</UButton>
          </div>

        </div>
      </template>
    </UModal>

  </div>
</template>

<script setup>
const toast = useToast()

const isLoading = ref(true)
const isModalOpen = ref(false)
const isSaving = ref(false)
const editingId = ref(null)

const addresses = ref([
  {
    id: 1,
    type: 'home',
    label: 'خانه',
    isDefault: true,
    province: 'تهران',
    city: 'تهران',
    district: 'ونک',
    street: 'خیابان ولیعصر، کوچه گلستان، پلاک ۱۲، واحد ۳',
    postalCode: '1598754321',
    phone: '09121234567',
  },
  {
    id: 2,
    type: 'work',
    label: 'محل کار',
    isDefault: false,
    province: 'تهران',
    city: 'تهران',
    district: 'سعادت‌آباد',
    street: 'بلوار دریا، خیابان پنجم، برج آریا، طبقه ۴، واحد ۱۵',
    postalCode: '1987654321',
    phone: '09129876543',
  },
])

const addressTypes = [
  { value: 'home',  label: 'خانه',    icon: 'i-heroicons-home' },
  { value: 'work',  label: 'محل کار', icon: 'i-heroicons-building-office' },
  { value: 'other', label: 'سایر',    icon: 'i-heroicons-map-pin' },
]

const typeIcon = (type) => addressTypes.find((t) => t.value === type)?.icon ?? 'i-heroicons-map-pin'

const provinceOptions = ['تهران', 'اصفهان', 'فارس', 'خراسان رضوی', 'آذربایجان شرقی']

const citiesByProvince = {
  'تهران':           ['تهران', 'کرج', 'شهریار', 'ری'],
  'اصفهان':          ['اصفهان', 'کاشان', 'نجف‌آباد', 'خمینی‌شهر'],
  'فارس':            ['شیراز', 'مرودشت', 'جهرم', 'فسا'],
  'خراسان رضوی':    ['مشهد', 'نیشابور', 'سبزوار', 'تربت حیدریه'],
  'آذربایجان شرقی': ['تبریز', 'مراغه', 'مرند', 'اهر'],
}

const cityOptions = computed(() => citiesByProvince[form.value.province] ?? [])

const defaultForm = () => ({
  type: 'home',
  label: '',
  province: '',
  city: '',
  district: '',
  street: '',
  postalCode: '',
  phone: '',
  isDefault: false,
})

const form = ref(defaultForm())

watch(() => form.value.province, () => {
  form.value.city = ''
})

const openModal = (address = null) => {
  if (address) {
    editingId.value = address.id
    form.value = { ...address }
  } else {
    editingId.value = null
    form.value = defaultForm()
  }
  isModalOpen.value = true
}

const setDefault = (id) => {
  addresses.value = addresses.value.map((a) => ({ ...a, isDefault: a.id === id }))
  toast.add({ title: 'آدرس پیش‌فرض تغییر کرد', color: 'success' })
}

const deleteAddress = (id) => {
  addresses.value = addresses.value.filter((a) => a.id !== id)
  toast.add({ title: 'آدرس حذف شد', color: 'success' })
}

const saveAddress = async () => {
  isSaving.value = true
  try {
    await new Promise((r) => setTimeout(r, 800))
    if (editingId.value) {
      addresses.value = addresses.value.map((a) =>
        a.id === editingId.value ? { ...a, ...form.value } : a
      )
    } else {
      if (form.value.isDefault) {
        addresses.value = addresses.value.map((a) => ({ ...a, isDefault: false }))
      }
      addresses.value.push({ ...form.value, id: Date.now() })
    }
    toast.add({ title: 'آدرس با موفقیت ذخیره شد', color: 'success' })
    isModalOpen.value = false
  } catch {
    toast.add({ title: 'خطا در ذخیره آدرس', color: 'error' })
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  await new Promise((r) => setTimeout(r, 1500))
  isLoading.value = false
})

useHead({ title: 'آدرس‌های من | پنل کاربری' })
</script>
