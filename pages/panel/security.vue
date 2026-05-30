<!-- pages/panel/security.vue -->
<template>
  <div class="space-y-6 font-dana" dir="rtl">
    <!-- Page Header -->
    <UCard>
      <div class="flex items-center gap-4">
        <div
          class="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0"
        >
          <UIcon
            name="i-heroicons-shield-check"
            class="w-6 h-6 text-teal-600 dark:text-teal-400"
          />
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            امنیت حساب
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            تنظیمات امنیتی و مدیریت دسترسی‌های حساب شما
          </p>
        </div>
      </div>
    </UCard>

    <!-- Two-column grid: Password + 2FA -->
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Password Change -->
      <UCard>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-5">
          تغییر رمز عبور
        </h3>
        <UForm
          :state="passwordForm"
          class="space-y-4"
          @submit.prevent="handlePasswordChange"
        >
          <UFormField label="رمز عبور فعلی" name="currentPassword">
            <UInput
              v-model="passwordForm.currentPassword"
              type="password"
              placeholder="رمز عبور فعلی را وارد کنید"
              class="w-full"
            />
          </UFormField>
          <UFormField label="رمز عبور جدید" name="newPassword">
            <UInput
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="رمز عبور جدید را وارد کنید"
              class="w-full"
            />
          </UFormField>
          <UFormField label="تکرار رمز عبور جدید" name="confirmPassword">
            <UInput
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="رمز عبور جدید را مجدداً وارد کنید"
              class="w-full"
            />
          </UFormField>
          <div class="flex justify-end gap-3 pt-2">
            <UButton variant="soft" color="neutral" @click="resetPasswordForm">
              انصراف
            </UButton>
            <UButton type="submit" color="primary" :loading="isPasswordLoading">
              ذخیره رمز عبور
            </UButton>
          </div>
        </UForm>
      </UCard>

      <!-- 2FA Card -->
      <UCard>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-5">
          احراز هویت دو مرحله‌ای
        </h3>
        <div class="space-y-1">
          <!-- Authenticator App -->
          <div
            class="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0"
              >
                <UIcon
                  name="i-heroicons-device-phone-mobile"
                  class="w-5 h-5 text-teal-600 dark:text-teal-400"
                />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  اپلیکیشن احراز هویت
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Google Authenticator یا Authy
                </p>
              </div>
            </div>
            <USwitch
              v-model="twoFA.authenticatorApp"
              size="lg"
              :ui="{
                base: 'data-[state=checked]:bg-teal-500 dark:data-[state=checked]:bg-teal-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
              }"
            />
          </div>
          <!-- SMS -->
          <div class="flex items-center justify-between py-4">
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0"
              >
                <UIcon
                  name="i-heroicons-chat-bubble-left-ellipsis"
                  class="w-5 h-5 text-blue-600 dark:text-blue-400"
                />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  پیامک (SMS)
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  دریافت کد تأیید از طریق پیامک
                </p>
              </div>
            </div>
            <USwitch
              v-model="twoFA.sms"
              size="lg"
              :ui="{
                base: 'data-[state=checked]:bg-teal-500 dark:data-[state=checked]:bg-teal-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
              }"
            />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Active Sessions -->
    <UCard>
      <div class="flex items-center justify-between mb-5">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">
          جلسات فعال
        </h3>
        <UButton
          variant="soft"
          color="error"
          size="sm"
          icon="i-heroicons-arrow-right-on-rectangle"
          @click="revokeAllSessions"
        >
          خروج از همه دستگاه‌ها
        </UButton>
      </div>
      <div class="space-y-3">
        <div
          v-for="session in activeSessions"
          :key="session.id"
          :class="[
            'flex items-center gap-4 p-4 rounded-xl border transition-colors',
            session.current
              ? 'border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/10'
              : 'border-gray-100 dark:border-gray-800',
          ]"
        >
          <div
            :class="[
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              session.current
                ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
            ]"
          >
            <UIcon :name="session.icon" class="w-5 h-5" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ session.device }}
              </p>
              <UBadge
                v-if="session.current"
                color="primary"
                variant="subtle"
                size="xs"
              >
                دستگاه فعلی
              </UBadge>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {{ session.browser }}
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {{ session.location }} · {{ session.ip }}
            </p>
          </div>
          <div class="flex-shrink-0 flex flex-col items-end gap-2">
            <p class="text-xs text-gray-400 dark:text-gray-500">
              {{ session.lastActive }}
            </p>
            <UButton
              v-if="!session.current"
              variant="soft"
              color="error"
              size="xs"
            >
              لغو دسترسی
            </UButton>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Login History -->
    <UCard>
      <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-5">
        تاریخچه ورود
      </h3>
      <div class="space-y-2">
        <div
          v-for="entry in loginHistory"
          :key="entry.id"
          class="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800"
        >
          <div
            :class="[
              'w-2.5 h-2.5 rounded-full flex-shrink-0',
              entry.success ? 'bg-teal-500' : 'bg-red-500',
            ]"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ entry.action }}
              </p>
              <UBadge
                v-if="entry.suspicious"
                color="error"
                variant="subtle"
                size="xs"
              >
                مشکوک
              </UBadge>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {{ entry.device }} · {{ entry.ip }}
            </p>
          </div>
          <p class="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
            {{ entry.time }}
          </p>
        </div>
      </div>
    </UCard>

    <!-- Security Notifications -->
    <UCard>
      <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-5">
        اعلان‌های امنیتی
      </h3>
      <div class="space-y-1">
        <div
          v-for="notif in securityNotifications"
          :key="notif.id"
          class="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-0"
        >
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ notif.label }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {{ notif.description }}
            </p>
          </div>
          <USwitch
            v-model="notif.enabled"
            size="lg"
            :ui="{
              base: 'data-[state=checked]:bg-teal-500 dark:data-[state=checked]:bg-teal-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
            }"
          />
        </div>
      </div>
    </UCard>

    <!-- Danger Zone -->
    <UCard class="ring-1 ring-[var(--color-danger)]/25 dark:ring-[var(--color-danger)]/20">
      <h3
        class="text-base font-semibold mb-5"
        style="color: var(--color-danger)"
      >
        منطقه خطر
      </h3>
      <div class="space-y-1">
        <div
          class="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800"
        >
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              پایان همه جلسات فعال
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              از تمام دستگاه‌های متصل خارج خواهید شد
            </p>
          </div>
          <UButton variant="outline" color="error" size="sm">
            پایان جلسات
          </UButton>
        </div>
        <div class="flex items-center justify-between py-4">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              حذف حساب کاربری
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              این عملیات غیرقابل بازگشت است و تمام اطلاعات شما حذف خواهد شد
            </p>
          </div>
          <UButton variant="outline" color="error" size="sm">
            حذف حساب
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
const toast = useToast()
const isPasswordLoading = ref(false)

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const twoFA = reactive({
  authenticatorApp: true,
  sms: false,
})

const activeSessions = ref([
  {
    id: 1,
    current: true,
    icon: 'i-heroicons-computer-desktop',
    device: 'MacBook Pro',
    browser: 'Chrome 124 · macOS',
    location: 'تهران',
    ip: '185.xx.xx.42',
    lastActive: 'هم‌اکنون',
  },
  {
    id: 2,
    current: false,
    icon: 'i-heroicons-device-phone-mobile',
    device: 'Samsung Galaxy S23',
    browser: 'Samsung Browser · Android 14',
    location: 'اصفهان',
    ip: '94.xx.xx.17',
    lastActive: '۲ ساعت پیش',
  },
  {
    id: 3,
    current: false,
    icon: 'i-heroicons-computer-desktop',
    device: 'Windows PC',
    browser: 'Firefox 125 · Windows 11',
    location: 'مشهد',
    ip: '91.xx.xx.88',
    lastActive: 'دیروز، ۱۴:۳۰',
  },
])

const loginHistory = ref([
  {
    id: 1,
    success: true,
    suspicious: false,
    action: 'ورود موفق',
    device: 'Chrome · MacBook Pro',
    ip: '185.xx.xx.42',
    time: 'امروز، ۱۰:۱۵',
  },
  {
    id: 2,
    success: true,
    suspicious: false,
    action: 'ورود موفق',
    device: 'Samsung Browser · Android',
    ip: '94.xx.xx.17',
    time: 'دیروز، ۱۸:۴۰',
  },
  {
    id: 3,
    success: false,
    suspicious: true,
    action: 'تلاش ناموفق برای ورود',
    device: 'Chrome · Windows',
    ip: '212.xx.xx.11',
    time: 'دیروز، ۰۳:۲۲',
  },
  {
    id: 4,
    success: true,
    suspicious: false,
    action: 'ورود موفق',
    device: 'Firefox · Windows PC',
    ip: '91.xx.xx.88',
    time: '۳ روز پیش، ۱۴:۳۰',
  },
])

const securityNotifications = reactive([
  {
    id: 'new-device',
    label: 'ورود از دستگاه جدید',
    description: 'هنگام ورود از یک دستگاه ناشناس اطلاع‌رسانی شوید',
    enabled: true,
  },
  {
    id: 'failed-login',
    label: 'تلاش‌های ناموفق برای ورود',
    description: 'پس از ۳ تلاش ناموفق متوالی اطلاع‌رسانی شوید',
    enabled: true,
  },
  {
    id: 'profile-change',
    label: 'تغییرات پروفایل',
    description: 'هنگام تغییر اطلاعات حساب یا رمز عبور اطلاع‌رسانی شوید',
    enabled: false,
  },
])

const resetPasswordForm = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
}

const handlePasswordChange = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.add({
      title: 'خطا',
      description: 'رمز عبور جدید و تکرار آن یکسان نیستند',
      color: 'error',
    })
    return
  }
  isPasswordLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.add({
      title: 'موفق',
      description: 'رمز عبور با موفقیت تغییر یافت',
      color: 'success',
    })
    resetPasswordForm()
  } catch {
    toast.add({
      title: 'خطا',
      description: 'مشکلی در تغییر رمز عبور پیش آمد',
      color: 'error',
    })
  } finally {
    isPasswordLoading.value = false
  }
}

const revokeAllSessions = () => {
  toast.add({
    title: 'خروج از همه دستگاه‌ها',
    description: 'از تمام دستگاه‌های دیگر خارج شدید',
    color: 'primary',
  })
}

useHead({
  title: 'امنیت حساب | پنل کاربری',
})
</script>
