<!-- pages/panel/profile.vue -->
<template>
  <div class="font-dana" dir="rtl">
    <div class="relative">
    <Transition name="sk">

    <!-- ─── Skeleton ─────────────────────────────────────────────────────── -->
    <div v-if="pending" key="sk" class="space-y-4">

      <!-- Avatar Hero skeleton -->
      <UCard>
        <div class="flex items-center gap-5 pb-5 border-b border-gray-100 dark:border-gray-800">
          <USkeleton class="w-[72px] h-[72px] rounded-full flex-shrink-0" />
          <div class="space-y-2">
            <USkeleton class="h-5 w-32" />
            <USkeleton class="h-3 w-24" />
            <div class="flex gap-1.5 mt-1">
              <USkeleton class="h-5 w-20 rounded-full" />
              <USkeleton class="h-5 w-24 rounded-full" />
            </div>
          </div>
        </div>
        <div class="grid grid-cols-3 pt-5">
          <div class="text-center space-y-2">
            <USkeleton class="h-7 w-8 mx-auto" />
            <USkeleton class="h-3 w-12 mx-auto" />
          </div>
          <div class="text-center border-x border-gray-100 dark:border-gray-800 space-y-2">
            <USkeleton class="h-7 w-8 mx-auto" />
            <USkeleton class="h-3 w-20 mx-auto" />
          </div>
          <div class="text-center space-y-2">
            <USkeleton class="h-7 w-8 mx-auto" />
            <USkeleton class="h-3 w-20 mx-auto" />
          </div>
        </div>
      </UCard>

      <!-- Personal Info skeleton -->
      <UCard>
        <div class="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <USkeleton class="w-4 h-4 rounded flex-shrink-0" />
          <USkeleton class="h-4 w-20" />
        </div>
        <div class="space-y-4">
          <div class="grid md:grid-cols-2 gap-4">
            <div v-for="i in 4" :key="i" class="space-y-1.5">
              <USkeleton class="h-3 w-16" />
              <USkeleton class="h-9 w-full rounded-lg" />
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-1">
            <USkeleton class="h-9 w-20 rounded-lg" />
            <USkeleton class="h-9 w-28 rounded-lg" />
          </div>
        </div>
      </UCard>

      <!-- Contact & Verification skeleton -->
      <UCard :ui="{ body: 'p-0' }">
        <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <USkeleton class="w-4 h-4 rounded flex-shrink-0" />
          <USkeleton class="h-4 w-32" />
        </div>
        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="i in 3" :key="i" class="flex items-center gap-3 px-4 sm:px-6 py-4">
            <USkeleton class="w-9 h-9 rounded-lg flex-shrink-0" />
            <div class="flex-1 space-y-1.5">
              <USkeleton class="h-3.5 w-20" />
              <USkeleton class="h-3 w-28" />
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <USkeleton class="h-5 w-16 rounded-full" />
              <USkeleton class="h-7 w-12 rounded-lg" />
            </div>
          </div>
        </div>
      </UCard>

      <!-- Account Preferences skeleton -->
      <UCard :ui="{ body: 'p-0' }">
        <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <USkeleton class="w-4 h-4 rounded flex-shrink-0" />
          <USkeleton class="h-4 w-24" />
        </div>
        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="i in 2" :key="i" class="flex items-center justify-between px-4 sm:px-6 py-4">
            <div class="space-y-1.5">
              <USkeleton class="h-3.5 w-24" />
              <USkeleton class="h-3 w-36" />
            </div>
            <USkeleton class="h-9 w-36 rounded-lg" />
          </div>
          <div class="flex items-center justify-between px-4 sm:px-6 py-4">
            <div class="space-y-1.5">
              <USkeleton class="h-3.5 w-36" />
              <USkeleton class="h-3 w-28" />
            </div>
            <USkeleton class="h-6 w-11 rounded-full" />
          </div>
        </div>
      </UCard>

    </div>

    <!-- ─── Real Content ──────────────────────────────────────────────────── -->
    <div v-else key="content" class="space-y-4">

    <!-- ─── Avatar Hero + Stats ─────────────────────────────────────────── -->
    <UCard>
      <!-- Hero row -->
      <div class="flex items-center gap-5 pb-5 border-b border-gray-100 dark:border-gray-800">
        <div class="relative flex-shrink-0">
          <div
            class="w-[72px] h-[72px] rounded-full bg-brand-500/15 border-2 border-brand-500/30 flex items-center justify-center"
          >
            <span class="text-2xl font-semibold text-brand-500">
              {{ userInitials }}
            </span>
          </div>
          <button
            class="absolute bottom-0 end-0 w-[22px] h-[22px] rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm hover:border-brand-500 dark:hover:border-brand-400 group transition-colors"
            @click="fileInput?.click()"
          >
            <UIcon
              name="i-heroicons-camera"
              class="w-3 h-3 text-gray-400 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors"
            />
          </button>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleAvatarChange"
          />
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ userFullName }}
          </h2>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            عضو از {{ memberSince }}
          </p>
          <div class="flex gap-1.5 mt-2.5 flex-wrap">
            <UBadge color="success" variant="subtle" size="xs">
              حساب تأیید شده
            </UBadge>
            <UBadge color="warning" variant="subtle" size="xs">
              کد ملی تأیید نشده
            </UBadge>
          </div>
        </div>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-3 pt-5">
        <div class="text-center">
          <p class="text-xl font-semibold text-brand-500">{{ toPersian(stats.orders) }}</p>
          <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1">سفارش‌ها</p>
        </div>
        <div class="text-center border-x border-gray-100 dark:border-gray-800">
          <p class="text-xl font-semibold text-brand-500">{{ toPersian(stats.addresses) }}</p>
          <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1">آدرس‌های ذخیره‌شده</p>
        </div>
        <div class="text-center">
          <p class="text-xl font-semibold text-brand-500">{{ toPersian(stats.prescriptions) }}</p>
          <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1">داروهای نسخه‌ای</p>
        </div>
      </div>
    </UCard>

    <!-- ─── Personal Info Form ────────────────────────────────────────────── -->
    <UCard>
      <div class="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100 dark:border-gray-800">
        <UIcon name="i-heroicons-user" class="w-4 h-4 text-brand-500 flex-shrink-0" />
        <h3 class="text-sm font-medium text-gray-900 dark:text-white">اطلاعات شخصی</h3>
      </div>

      <UForm :state="form" class="space-y-4" @submit.prevent="handleSubmit">
        <div class="grid md:grid-cols-2 gap-4">
          <UFormField label="نام" name="firstName">
            <UInput
              v-model="form.firstName"
              placeholder="نام خود را وارد کنید"
              class="w-full"
            />
          </UFormField>
          <UFormField label="نام خانوادگی" name="lastName">
            <UInput
              v-model="form.lastName"
              placeholder="نام خانوادگی خود را وارد کنید"
              class="w-full"
            />
          </UFormField>
          <UFormField label="کد ملی" name="nationalId">
            <UInput
              v-model="form.nationalId"
              dir="ltr"
              placeholder="0000000000"
              maxlength="10"
              class="w-full"
            />
          </UFormField>
          <UFormField label="تاریخ تولد" name="birthDate">
            <UInput
              v-model="form.birthDate"
              dir="ltr"
              placeholder="1370/01/01"
              class="w-full"
            />
          </UFormField>
        </div>

<div class="flex justify-end gap-2 pt-1">
          <UButton variant="ghost" color="neutral" @click="cancelEditing">
            انصراف
          </UButton>
          <UButton
            type="submit"
            color="primary"
            :loading="isLoading"
            :disabled="!hasChanges"
          >
            ذخیره تغییرات
          </UButton>
        </div>
      </UForm>
    </UCard>

    <!-- ─── Contact & Verification ────────────────────────────────────────── -->
    <UCard :ui="{ body: 'p-0' }">
      <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-brand-500 flex-shrink-0" />
        <h3 class="text-sm font-medium text-gray-900 dark:text-white">اطلاعات تماس و تأیید</h3>
      </div>

      <!-- Mobile — verified -->
      <div class="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div
          class="w-9 h-9 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0"
        >
          <UIcon name="i-heroicons-device-phone-mobile" class="w-5 h-5 text-brand-500" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white">شماره موبایل</p>
          <p dir="ltr" class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 text-right">
            0912•••6789
          </p>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <UBadge color="success" variant="subtle" size="xs">تأیید شده</UBadge>
          <UButton variant="ghost" color="neutral" size="xs">ویرایش</UButton>
        </div>
      </div>

      <!-- Email — unverified -->
      <div class="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div
          class="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0"
        >
          <UIcon name="i-heroicons-envelope" class="w-5 h-5 text-warning" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white">ایمیل</p>
          <p dir="ltr" class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 text-right">
            example@email.com
          </p>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <UBadge color="warning" variant="subtle" size="xs">تأیید نشده</UBadge>
          <UButton color="primary" size="xs">ارسال لینک</UButton>
        </div>
      </div>

      <!-- National ID — missing -->
      <div class="flex items-center gap-3 px-4 sm:px-6 py-4">
        <div
          class="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0"
        >
          <UIcon name="i-heroicons-identification" class="w-5 h-5 text-warning" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white">کد ملی</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">وارد نشده</p>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <UBadge color="warning" variant="subtle" size="xs">تأیید نشده</UBadge>
          <UButton variant="ghost" color="neutral" size="xs">تکمیل</UButton>
        </div>
      </div>
    </UCard>

    <!-- ─── Account Preferences ───────────────────────────────────────────── -->
    <UCard :ui="{ body: 'p-0' }">
      <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4 text-brand-500 flex-shrink-0" />
        <h3 class="text-sm font-medium text-gray-900 dark:text-white">تنظیمات حساب</h3>
      </div>

      <!-- Language -->
      <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <p class="text-sm text-gray-900 dark:text-white">زبان نمایش</p>
          <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
            زبان رابط کاربری پنل
          </p>
        </div>
        <USelect v-model="preferences.language" :items="languageOptions" class="w-36" />
      </div>

      <!-- Gender -->
      <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <p class="text-sm text-gray-900 dark:text-white">جنسیت</p>
          <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
            برای پیشنهاد داروهای مرتبط
          </p>
        </div>
        <USelect v-model="preferences.gender" :items="genderOptions" class="w-40" />
      </div>

      <!-- SMS Notifications -->
      <div class="flex items-center justify-between px-4 sm:px-6 py-4">
        <div>
          <p class="text-sm text-gray-900 dark:text-white">دریافت اعلان‌های پیامکی</p>
          <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
            وضعیت سفارش، تخفیف‌ها
          </p>
        </div>
        <USwitch
          v-model="preferences.smsNotifications"
          size="lg"
          :ui="{
            base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
          }"
        />
      </div>
    </UCard>

    </div>
  </Transition>
  </div>
  </div>
</template>

<script setup>
const app = useNuxtApp()
const userStore = useUserStore()
const toast = useToast()

const fileInput = ref(null)
const isLoading = ref(false)
const pending = ref(true)

// ── User identity ──────────────────────────────────────────────────────────
const userFullName = computed(() => {
  const user = userStore.currentUser || app.$auth?.user
  if (!user?.person) return 'کاربر مهمان'
  return `${user.person.firstName || ''} ${user.person.lastName || ''}`.trim() || 'کاربر'
})

const userInitials = computed(() => {
  const user = userStore.currentUser || app.$auth?.user
  if (!user?.person) return 'ک'
  const first = user.person.firstName?.[0] || ''
  const last = user.person.lastName?.[0] || ''
  return first + last || 'ک'
})

const memberSince = 'اردیبهشت ۱۴۰۳'

const stats = { orders: 12, addresses: 3, prescriptions: 8 }

const toPersian = (n) => n.toLocaleString('fa-IR')

// ── Form ───────────────────────────────────────────────────────────────────
const form = ref({ firstName: '', lastName: '', nationalId: '', birthDate: '' })
const savedForm = ref({ ...form.value })

const hasChanges = computed(() =>
  Object.keys(form.value).some((k) => form.value[k] !== savedForm.value[k])
)

const loadUserData = () => {
  const user = userStore.currentUser || app.$auth?.user
  if (user?.person) {
    form.value = {
      firstName: user.person.firstName || '',
      lastName: user.person.lastName || '',
      nationalId: user.person.nationalId || '',
      birthDate: user.person.birthDate || '',
    }
  } else {
    form.value = { firstName: 'آریا', lastName: 'آقاخانی', nationalId: '', birthDate: '' }
  }
  savedForm.value = { ...form.value }
}

const cancelEditing = () => loadUserData()

const handleSubmit = async () => {
  isLoading.value = true
  try {
    await new Promise((r) => setTimeout(r, 800))
    toast.add({ title: 'موفق', description: 'اطلاعات شما با موفقیت به‌روزرسانی شد', color: 'success' })
    savedForm.value = { ...form.value }
  } catch {
    toast.add({ title: 'خطا', description: 'مشکلی در به‌روزرسانی اطلاعات پیش آمد', color: 'error' })
  } finally {
    isLoading.value = false
  }
}

const handleAvatarChange = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    toast.add({ title: 'تصویر انتخاب شد', description: 'آپلود تصویر پروفایل به زودی فعال خواهد شد', color: 'primary' })
  }
}

// ── Preferences ────────────────────────────────────────────────────────────
const preferences = reactive({ language: 'fa', gender: 'unspecified', smsNotifications: true })

const languageOptions = [
  { label: 'فارسی', value: 'fa' },
  { label: 'English', value: 'en' },
]

const genderOptions = [
  { label: 'انتخاب کنید', value: 'unspecified' },
  { label: 'مرد', value: 'male' },
  { label: 'زن', value: 'female' },
  { label: 'ترجیح نمی‌دهم', value: 'prefer_not' },
]

onMounted(async () => {
  await new Promise((r) => setTimeout(r, 600))
  loadUserData()
  pending.value = false
})

useHead({ title: 'پروفایل | پنل کاربری' })
</script>

<style scoped>
.sk-enter-active {
  transition: opacity 0.25s ease;
}
.sk-leave-active {
  transition: opacity 0.25s ease;
  position: absolute;
  inset: 0;
}
.sk-enter-from,
.sk-leave-to {
  opacity: 0;
}
</style>
