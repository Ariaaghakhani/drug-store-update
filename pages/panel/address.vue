<!-- pages/panel/address.vue -->
<template>
  <div class="space-y-4 font-dana" dir="rtl">
    <!-- ─── Page Header ────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-map-pin"
          class="w-5 h-5 text-brand-500 flex-shrink-0"
        />
        <h2 class="text-base font-bold text-gray-900 dark:text-white">
          آدرس‌های من
        </h2>
      </div>
      <UButton
        color="primary"
        icon="i-heroicons-plus"
        size="sm"
        @click="openModal()"
      >
        افزودن آدرس
      </UButton>
    </div>

    <!-- ─── Loading Skeleton ───────────────────────────────────────────────── -->
    <template v-if="isLoading">
      <UCard v-for="i in 2" :key="i" :ui="{ body: 'p-0' }">
        <div
          class="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800"
        >
          <USkeleton class="w-9 h-9 rounded-lg flex-shrink-0" />
          <USkeleton class="h-5 flex-1 max-w-[6rem]" />
          <USkeleton class="h-5 w-16 rounded-full" />
        </div>
        <div
          class="px-4 sm:px-6 py-4 space-y-2 border-b border-gray-100 dark:border-gray-800"
        >
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
      <div
        class="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-14 flex flex-col items-center gap-4 text-center"
      >
        <div
          class="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center"
        >
          <UIcon name="i-heroicons-map-pin" class="w-8 h-8 text-brand-500" />
        </div>
        <div class="space-y-1">
          <p class="text-base font-bold text-gray-900 dark:text-white">
            آدرسی ثبت نشده است
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            برای تکمیل سفارش‌هایتان یک آدرس اضافه کنید
          </p>
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
          :class="
            address.isDefault
              ? 'ring-1 ring-brand-500/30 dark:ring-brand-500/20'
              : ''
          "
        >
          <!-- Header row -->
          <div
            class="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800"
          >
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
            <p class="flex-1 text-sm font-medium text-gray-900 dark:text-white">
              {{ address.label }}
            </p>
            <UBadge
              :color="address.isDefault ? 'success' : 'neutral'"
              variant="subtle"
              size="xs"
            >
              {{ address.isDefault ? 'پیش‌فرض' : 'عادی' }}
            </UBadge>
          </div>

          <!-- Body -->
          <div
            class="px-4 sm:px-6 py-4 space-y-1.5 border-b border-gray-100 dark:border-gray-800"
          >
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ address.province }}، {{ address.city
              }}<template v-if="address.district"
                >، {{ address.district }}</template
              >
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {{ address.street }}
            </p>
            <div
              class="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mt-0.5"
            >
              <UIcon
                name="i-heroicons-hashtag"
                class="w-3.5 h-3.5 flex-shrink-0"
              />
              <span dir="ltr">{{ address.postalCode }}</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-4 sm:px-6 py-3">
            <div
              v-if="address.isDefault"
              class="flex items-center gap-1.5 text-brand-500"
            >
              <UIcon
                name="i-heroicons-check-circle"
                class="w-4 h-4 flex-shrink-0"
              />
              <span class="text-xs font-medium">آدرس پیش‌فرض تحویل</span>
            </div>
            <UButton
              v-else
              variant="ghost"
              color="neutral"
              size="xs"
              @click="setDefault(address.id)"
            >
              تنظیم به عنوان پیش‌فرض
            </UButton>

            <div class="flex items-center gap-1">
              <UButton
                variant="ghost"
                color="neutral"
                size="xs"
                icon="i-heroicons-pencil-square"
                square
                @click="openModal(address)"
              />
              <UButton
                variant="ghost"
                color="error"
                size="xs"
                icon="i-heroicons-trash"
                square
                :loading="deletingId === address.id"
                @click="deleteAddress(address.id)"
              />
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
    <UModal
      v-model:open="isModalOpen"
      :ui="{ content: 'sm:max-w-lg p-0 gap-0 overflow-hidden' }"
      :dismissible="false"
      @close="closeModal"
    >
      <template #content>
        <div class="flex flex-col max-h-[90vh] font-dana" dir="rtl">
          <!-- Sticky header -->
          <div
            class="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
          >
            <div class="flex items-center gap-3 px-5 py-4">
              <div
                class="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0"
              >
                <UIcon
                  name="i-heroicons-map-pin"
                  class="w-4 h-4 text-brand-500"
                />
              </div>
              <h3
                class="flex-1 text-sm font-semibold text-gray-900 dark:text-white"
              >
                {{ editingId ? 'ویرایش آدرس' : 'افزودن آدرس جدید' }}
              </h3>
              <button
                class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                @click="closeModal"
              >
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Scrollable body -->
          <div class="overflow-y-auto flex-1 px-5 py-5 space-y-5">
            <!-- Address type selector -->
            <div class="space-y-2">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                نوع آدرس
              </p>
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
            <UFormField
              label="عنوان آدرس"
              name="label"
              :error="visibleErrors.label"
            >
              <UInput
                v-model="form.label"
                placeholder="مثلاً: خانه مادربزرگ"
                class="w-full"
              />
            </UFormField>

            <!-- Province + City -->
            <div class="grid grid-cols-2 gap-3">
              <UFormField
                label="استان"
                name="province"
                :error="visibleErrors.province"
              >
                <USelectMenu
                  v-model="selectedProvinceObj"
                  :items="provinceOptions"
                  :label="selectedProvinceObj?.label"
                  placeholder="انتخاب استان"
                  class="w-full"
                  :search-input="{
                    placeholder: 'جستجو...',
                    icon: 'i-lucide-search',
                  }"
                  @update:model-value="onProvinceChange"
                >
                  <template #item="{ item }">
                    <span class="font-dana">{{
                      item.nameFa || item.name
                    }}</span>
                  </template>
                  <template #empty>
                    <span class="text-gray-400 font-dana"
                      >نتیجه‌ای یافت نشد</span
                    >
                  </template>
                </USelectMenu>
              </UFormField>

              <UFormField label="شهر" name="city" :error="visibleErrors.city">
                <USelectMenu
                  v-model="selectedCityObj"
                  :items="cityOptions"
                  :label="selectedCityObj?.label"
                  placeholder="انتخاب شهر"
                  class="w-full"
                  :disabled="!selectedProvinceObj"
                  :search-input="{
                    placeholder: 'جستجو...',
                    icon: 'i-lucide-search',
                  }"
                  @update:model-value="onCityChange"
                >
                  <template #item="{ item }">
                    <span class="font-dana">{{
                      item.nameFa || item.name
                    }}</span>
                  </template>
                  <template #empty>
                    <span class="text-gray-400 font-dana"
                      >نتیجه‌ای یافت نشد</span
                    >
                  </template>
                </USelectMenu>
              </UFormField>
            </div>

            <!-- Full address -->
            <UFormField
              label="آدرس کامل"
              name="street"
              :error="visibleErrors.street"
            >
              <UTextarea
                v-model="form.street"
                placeholder="خیابان، کوچه، پلاک، واحد"
                :rows="3"
                class="w-full"
              />
            </UFormField>

            <!-- Postal code + Phone -->
            <div class="grid grid-cols-2 gap-3">
              <UFormField
                label="کد پستی"
                name="postalCode"
                :error="visibleErrors.postalCode"
              >
                <UInput
                  v-model="form.postalCode"
                  dir="ltr"
                  placeholder="0000000000"
                  maxlength="10"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="شماره تماس تحویل" name="phone">
                <UInput
                  v-model="form.phone"
                  dir="ltr"
                  placeholder="09xxxxxxxxx"
                  maxlength="11"
                  class="w-full"
                />
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
              <span
                class="text-sm text-gray-700 dark:text-gray-300 select-none"
              >
                تنظیم به عنوان آدرس پیش‌فرض
              </span>
            </label>
          </div>

          <!-- Sticky footer -->
          <div
            class="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-5 py-4 flex justify-end gap-2"
          >
            <UButton variant="ghost" color="neutral" @click="closeModal"
              >انصراف</UButton
            >
            <UButton color="primary" :loading="isSaving" @click="saveAddress"
              >ذخیره آدرس</UButton
            >
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
const app = useNuxtApp()
const userStore = useUserStore()
const toast = useToast()

// ─── State ──────────────────────────────────────────────────────────────────

const isLoading = ref(true)
const isModalOpen = ref(false)
const isSaving = ref(false)
const deletingId = ref(null)
const editingId = ref(null)

const addresses = ref([])

// Province / city data from local JSON (via $api.address); static fallback used if it throws
const allProvinces = ref([])
const cityOptions = ref([])

// ─── Static fallbacks (shown when API is unavailable) ───────────────────────

const FALLBACK_PROVINCES = [
  { id: null, name: 'تهران', nameFa: 'تهران' },
  { id: null, name: 'اصفهان', nameFa: 'اصفهان' },
  { id: null, name: 'فارس', nameFa: 'فارس' },
  { id: null, name: 'خراسان رضوی', nameFa: 'خراسان رضوی' },
  { id: null, name: 'آذربایجان شرقی', nameFa: 'آذربایجان شرقی' },
]

const FALLBACK_CITIES = {
  تهران: [
    { id: null, name: 'تهران', nameFa: 'تهران' },
    { id: null, name: 'کرج', nameFa: 'کرج' },
  ],
  اصفهان: [
    { id: null, name: 'اصفهان', nameFa: 'اصفهان' },
    { id: null, name: 'کاشان', nameFa: 'کاشان' },
  ],
  فارس: [
    { id: null, name: 'شیراز', nameFa: 'شیراز' },
    { id: null, name: 'مرودشت', nameFa: 'مرودشت' },
  ],
  'خراسان رضوی': [
    { id: null, name: 'مشهد', nameFa: 'مشهد' },
    { id: null, name: 'نیشابور', nameFa: 'نیشابور' },
  ],
  'آذربایجان شرقی': [
    { id: null, name: 'تبریز', nameFa: 'تبریز' },
    { id: null, name: 'مراغه', nameFa: 'مراغه' },
  ],
}

// ─── Derived ─────────────────────────────────────────────────────────────────

const provinceOptions = computed(() => {
  const list = allProvinces.value.length
    ? allProvinces.value
    : FALLBACK_PROVINCES
  return list.map((p) => ({ ...p, label: p.nameFa || p.name }))
})

// These hold the full objects so USelectMenu can match items by reference.
// form.province / form.city stay as plain name strings for the API payload.
const selectedProvinceObj = ref(null)
const selectedCityObj = ref(null)

// ─── Form ─────────────────────────────────────────────────────────────────────

const addressTypes = [
  { value: 'home', label: 'خانه', icon: 'i-heroicons-home' },
  { value: 'work', label: 'محل کار', icon: 'i-heroicons-building-office' },
  { value: 'other', label: 'سایر', icon: 'i-heroicons-map-pin' },
]

const typeIcon = (type) =>
  addressTypes.find((t) => t.value === type)?.icon ?? 'i-heroicons-map-pin'

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

const formErrors = reactive({
  label: '',
  province: '',
  city: '',
  street: '',
  postalCode: '',
})

// Only show validation errors after the user first tries to submit.
// UFormField treats any non-undefined :error prop as an error state — even ''.
// So we return undefined (not '') for clean fields.
const hasSubmitted = ref(false)

const visibleErrors = computed(() => {
  if (!hasSubmitted.value) return {}
  return Object.fromEntries(
    Object.entries(formErrors).map(([k, v]) => [k, v || undefined])
  )
})

function clearErrors() {
  hasSubmitted.value = false
  Object.keys(formErrors).forEach((k) => (formErrors[k] = ''))
}

function validateForm() {
  // Mark as submitted so errors become visible from this point on
  hasSubmitted.value = true
  Object.keys(formErrors).forEach((k) => (formErrors[k] = ''))
  let valid = true

  if (!form.value.label.trim()) {
    formErrors.label = 'عنوان آدرس الزامی است'
    valid = false
  }
  if (!form.value.province) {
    formErrors.province = 'انتخاب استان الزامی است'
    valid = false
  }
  if (!form.value.city) {
    formErrors.city = 'انتخاب شهر الزامی است'
    valid = false
  }
  if (!form.value.street.trim()) {
    formErrors.street = 'آدرس کامل الزامی است'
    valid = false
  }
  if (form.value.postalCode && !/^\d{10}$/.test(form.value.postalCode)) {
    formErrors.postalCode = 'کد پستی باید ۱۰ رقم باشد'
    valid = false
  }

  return valid
}

// ─── Province / city loading ─────────────────────────────────────────────────
// getState() and getCity() are synchronous — they read from a local JSON asset,
// no network call involved.

function loadProvinces() {
  try {
    const result = app.$api.address.getState()
    allProvinces.value = [...result].sort((a, b) =>
      a.name.localeCompare(b.name, 'fa-IR')
    )
  } catch {
    // JSON import failure is extremely unlikely; fall back silently
    allProvinces.value = []
  }
}

function normalizeCities(list) {
  return [...list]
    .sort((a, b) => a.name.localeCompare(b.name, 'fa-IR'))
    .map((c) => ({ ...c, label: c.nameFa || c.name }))
}

function onProvinceChange(provinceObj) {
  form.value.province = provinceObj?.name ?? ''
  form.value.city = ''
  selectedCityObj.value = null
  cityOptions.value = []

  if (provinceObj?.id) {
    try {
      cityOptions.value = normalizeCities(
        app.$api.address.getCity(provinceObj.id)
      )
    } catch {
      cityOptions.value = normalizeCities(
        FALLBACK_CITIES[provinceObj.name] ?? []
      )
    }
  } else if (provinceObj?.name) {
    cityOptions.value = normalizeCities(FALLBACK_CITIES[provinceObj.name] ?? [])
  }
}

function onCityChange(cityObj) {
  form.value.city = cityObj?.name ?? ''
}

// ─── Addresses CRUD ──────────────────────────────────────────────────────────

async function fetchAddresses() {
  isLoading.value = true
  try {
    const config = {
      data: { personId: userStore.currentUser.person.id },
    }
    const response = await app.$api.address.getAddresses(config)
    addresses.value = response.data ?? []
  } catch {
    toast.add({ title: 'خطا در دریافت آدرس‌ها', color: 'error' })
    addresses.value = []
  } finally {
    isLoading.value = false
  }
}

const setDefault = (id) => {
  addresses.value = addresses.value.map((a) => ({
    ...a,
    isDefault: a.id === id,
  }))
  toast.add({ title: 'آدرس پیش‌فرض تغییر کرد', color: 'success' })
}

async function deleteAddress(id) {
  deletingId.value = id
  try {
    // TODO: wire up when endpoint is available — await app.$api.address.deleteAddress({ data: { id } })
    addresses.value = addresses.value.filter((a) => a.id !== id)
    toast.add({ title: 'آدرس حذف شد', color: 'success' })
  } catch {
    toast.add({ title: 'خطا در حذف آدرس', color: 'error' })
  } finally {
    deletingId.value = null
  }
}

async function saveAddress() {
  if (!validateForm()) return

  isSaving.value = true
  try {
    if (editingId.value) {
      // ── Edit existing ──
      // TODO: wire up when endpoint is available:
      // await app.$api.address.updateAddress({ data: { id: editingId.value, ... } })
      addresses.value = addresses.value.map((a) =>
        a.id === editingId.value ? { ...a, ...form.value } : a
      )
    } else {
      // ── Add new ──
      const config = {
        data: {
          title: form.value.label,
          fullAddress: `${form.value.province}،${form.value.city}،${form.value.street}`,
          postalCode: form.value.postalCode,
          phone: form.value.phone,
          type: form.value.type,
          isDefault: form.value.isDefault,
        },
      }
      const response = await app.$api.address.addAddress(config)

      if (form.value.isDefault) {
        addresses.value = addresses.value.map((a) => ({
          ...a,
          isDefault: false,
        }))
      }
      // Merge API-returned id with local form data for immediate UI update
      addresses.value.push({
        ...form.value,
        id: response?.data?.id ?? Date.now(),
      })
    }

    toast.add({ title: 'آدرس با موفقیت ذخیره شد', color: 'success' })
    closeModal()
  } catch (err) {
    const message = err?.response?.data?.message ?? 'خطا در ذخیره آدرس'
    toast.add({ title: message, color: 'error' })
  } finally {
    isSaving.value = false
  }
}

// ─── Modal helpers ────────────────────────────────────────────────────────────

const openModal = (address = null) => {
  clearErrors()

  if (address) {
    editingId.value = address.id
    form.value = { ...address }

    // Restore province object so the select shows the right label
    const provinceObj =
      provinceOptions.value.find((p) => p.name === address.province) ?? null
    selectedProvinceObj.value = provinceObj

    // Load cities for this province (sync), then restore city object
    if (provinceObj) {
      if (provinceObj.id) {
        try {
          cityOptions.value = normalizeCities(
            app.$api.address.getCity(provinceObj.id)
          )
        } catch {
          cityOptions.value = normalizeCities(
            FALLBACK_CITIES[provinceObj.name] ?? []
          )
        }
      } else {
        cityOptions.value = normalizeCities(
          FALLBACK_CITIES[provinceObj.name] ?? []
        )
      }
      selectedCityObj.value =
        cityOptions.value.find((c) => c.name === address.city) ?? null
    }
  } else {
    editingId.value = null
    form.value = defaultForm()
    selectedProvinceObj.value = null
    selectedCityObj.value = null
    cityOptions.value = []
  }

  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingId.value = null
  form.value = defaultForm()
  selectedProvinceObj.value = null
  selectedCityObj.value = null
  cityOptions.value = []
  clearErrors()
}

// ─── Init ─────────────────────────────────────────────────────────────────────

onMounted(async () => {
  loadProvinces() // sync — reads local JSON
  await fetchAddresses() // async — real network call
})

useHead({ title: 'آدرس‌های من | پنل کاربری' })
</script>
