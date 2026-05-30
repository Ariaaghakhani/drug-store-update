<!-- pages/panel/security.vue -->
<template>
  <div class="space-y-4 font-dana" dir="rtl">

    <!-- ─── Password + 2FA ───────────────────────────────────────────────── -->
    <div class="grid lg:grid-cols-2 gap-4">

      <!-- Password Change -->
      <UCard :ui="{ body: 'p-0' }">
        <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <UIcon name="i-heroicons-lock-closed" class="w-4 h-4 text-brand-500 flex-shrink-0" />
          <h3 class="text-sm font-medium text-gray-900 dark:text-white">تغییر رمز عبور</h3>
        </div>

        <UForm :state="passwordForm" class="px-4 sm:px-6 py-4 space-y-4" @submit.prevent="handlePasswordChange">
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
        </UForm>

        <div class="flex justify-end gap-2 px-4 sm:px-6 py-3.5 border-t border-gray-100 dark:border-gray-800">
          <UButton variant="ghost" color="neutral" @click="resetPasswordForm">انصراف</UButton>
          <UButton color="primary" :loading="isPasswordLoading" @click="handlePasswordChange">
            ذخیره رمز عبور
          </UButton>
        </div>
      </UCard>

      <!-- 2FA -->
      <UCard :ui="{ body: 'p-0' }">
        <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-brand-500 flex-shrink-0" />
          <h3 class="text-sm font-medium text-gray-900 dark:text-white">احراز هویت دو مرحله‌ای</h3>
        </div>

        <!-- Authenticator App -->
        <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-device-phone-mobile" class="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">اپلیکیشن احراز هویت</p>
              <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Google Authenticator یا Authy</p>
            </div>
          </div>
          <USwitch
            v-model="twoFA.authenticatorApp"
            size="lg"
            :ui="switchUi"
          />
        </div>

        <!-- SMS -->
        <div class="flex items-center justify-between px-4 sm:px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-5 h-5 text-info" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">پیامک (SMS)</p>
              <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">دریافت کد تأیید از طریق پیامک</p>
            </div>
          </div>
          <USwitch
            v-model="twoFA.sms"
            size="lg"
            :ui="switchUi"
          />
        </div>
      </UCard>
    </div>

    <!-- ─── Active Sessions ────────────────────────────────────────────────── -->
    <UCard :ui="{ body: 'p-0' }">
      <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-computer-desktop" class="w-4 h-4 text-brand-500 flex-shrink-0" />
          <h3 class="text-sm font-medium text-gray-900 dark:text-white">جلسات فعال</h3>
        </div>
        <UButton variant="ghost" color="error" size="xs" icon="i-heroicons-arrow-right-on-rectangle" @click="revokeAllSessions">
          خروج از همه دستگاه‌ها
        </UButton>
      </div>

      <div class="divide-y divide-gray-100 dark:divide-gray-800">
        <div
          v-for="session in activeSessions"
          :key="session.id"
          :class="['flex items-center gap-3 px-4 sm:px-6 py-4', session.current && 'bg-brand-500/5 dark:bg-brand-500/10']"
        >
          <div :class="['w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', session.current ? 'bg-brand-500/15 text-brand-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400']">
            <UIcon :name="session.icon" class="w-5 h-5" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ session.device }}</p>
              <UBadge v-if="session.current" color="primary" variant="subtle" size="xs">فعلی</UBadge>
            </div>
            <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{{ session.browser }}</p>
            <p class="text-[11px] text-gray-400 dark:text-gray-500">{{ session.location }} · {{ session.ip }}</p>
          </div>
          <div class="flex-shrink-0 text-left flex flex-col items-end gap-1.5">
            <p class="text-[11px] text-gray-400 dark:text-gray-500">{{ session.lastActive }}</p>
            <UButton v-if="!session.current" variant="ghost" color="error" size="xs">لغو دسترسی</UButton>
          </div>
        </div>
      </div>
    </UCard>

    <!-- ─── Login History ─────────────────────────────────────────────────── -->
    <UCard :ui="{ body: 'p-0' }">
      <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <UIcon name="i-heroicons-clock" class="w-4 h-4 text-brand-500 flex-shrink-0" />
        <h3 class="text-sm font-medium text-gray-900 dark:text-white">تاریخچه ورود</h3>
      </div>

      <div class="divide-y divide-gray-100 dark:divide-gray-800">
        <div
          v-for="entry in loginHistory"
          :key="entry.id"
          class="flex items-center gap-3 px-4 sm:px-6 py-4"
        >
          <div :class="['w-2 h-2 rounded-full flex-shrink-0', entry.success ? 'bg-brand-500' : 'bg-[var(--color-danger)]']" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ entry.action }}</p>
              <UBadge v-if="entry.suspicious" color="error" variant="subtle" size="xs">مشکوک</UBadge>
            </div>
            <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{{ entry.device }} · {{ entry.ip }}</p>
          </div>
          <p class="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0">{{ entry.time }}</p>
        </div>
      </div>
    </UCard>

    <!-- ─── Security Notifications ────────────────────────────────────────── -->
    <UCard :ui="{ body: 'p-0' }">
      <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <UIcon name="i-heroicons-bell" class="w-4 h-4 text-brand-500 flex-shrink-0" />
        <h3 class="text-sm font-medium text-gray-900 dark:text-white">اعلان‌های امنیتی</h3>
      </div>

      <div class="divide-y divide-gray-100 dark:divide-gray-800">
        <div
          v-for="notif in securityNotifications"
          :key="notif.id"
          class="flex items-center justify-between px-4 sm:px-6 py-4"
        >
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ notif.label }}</p>
            <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{{ notif.description }}</p>
          </div>
          <USwitch v-model="notif.enabled" size="lg" :ui="switchUi" />
        </div>
      </div>
    </UCard>

    <!-- ─── Danger Zone ────────────────────────────────────────────────────── -->
    <UCard :ui="{ body: 'p-0' }" class="ring-1 ring-[var(--color-danger)]/25 dark:ring-[var(--color-danger)]/20">
      <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 flex-shrink-0" style="color: var(--color-danger)" />
        <h3 class="text-sm font-medium" style="color: var(--color-danger)">منطقه خطر</h3>
      </div>

      <div class="divide-y divide-gray-100 dark:divide-gray-800">
        <div class="flex items-center justify-between px-4 sm:px-6 py-4">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">پایان همه جلسات فعال</p>
            <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">از تمام دستگاه‌های متصل خارج خواهید شد</p>
          </div>
          <UButton variant="outline" color="error" size="sm">پایان جلسات</UButton>
        </div>
        <div class="flex items-center justify-between px-4 sm:px-6 py-4">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">حذف حساب کاربری</p>
            <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">این عملیات غیرقابل بازگشت است و تمام اطلاعات شما حذف خواهد شد</p>
          </div>
          <UButton variant="outline" color="error" size="sm">حذف حساب</UButton>
        </div>
      </div>
    </UCard>

  </div>
</template>

<script setup>
const toast = useToast()
const isPasswordLoading = ref(false)

const switchUi = {
  base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
}

const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })

const twoFA = reactive({ authenticatorApp: true, sms: false })

const activeSessions = ref([
  {
    id: 1, current: true,
    icon: 'i-heroicons-computer-desktop',
    device: 'MacBook Pro', browser: 'Chrome 124 · macOS',
    location: 'تهران', ip: '185.xx.xx.42', lastActive: 'هم‌اکنون',
  },
  {
    id: 2, current: false,
    icon: 'i-heroicons-device-phone-mobile',
    device: 'Samsung Galaxy S23', browser: 'Samsung Browser · Android 14',
    location: 'اصفهان', ip: '94.xx.xx.17', lastActive: '۲ ساعت پیش',
  },
  {
    id: 3, current: false,
    icon: 'i-heroicons-computer-desktop',
    device: 'Windows PC', browser: 'Firefox 125 · Windows 11',
    location: 'مشهد', ip: '91.xx.xx.88', lastActive: 'دیروز، ۱۴:۳۰',
  },
])

const loginHistory = ref([
  { id: 1, success: true,  suspicious: false, action: 'ورود موفق',              device: 'Chrome · MacBook Pro',        ip: '185.xx.xx.42', time: 'امروز، ۱۰:۱۵'    },
  { id: 2, success: true,  suspicious: false, action: 'ورود موفق',              device: 'Samsung Browser · Android',   ip: '94.xx.xx.17',  time: 'دیروز، ۱۸:۴۰'   },
  { id: 3, success: false, suspicious: true,  action: 'تلاش ناموفق برای ورود', device: 'Chrome · Windows',            ip: '212.xx.xx.11', time: 'دیروز، ۰۳:۲۲'   },
  { id: 4, success: true,  suspicious: false, action: 'ورود موفق',              device: 'Firefox · Windows PC',        ip: '91.xx.xx.88',  time: '۳ روز پیش، ۱۴:۳۰' },
])

const securityNotifications = reactive([
  { id: 'new-device',     label: 'ورود از دستگاه جدید',          description: 'هنگام ورود از یک دستگاه ناشناس اطلاع‌رسانی شوید',    enabled: true  },
  { id: 'failed-login',   label: 'تلاش‌های ناموفق برای ورود',    description: 'پس از ۳ تلاش ناموفق متوالی اطلاع‌رسانی شوید',        enabled: true  },
  { id: 'profile-change', label: 'تغییرات پروفایل',              description: 'هنگام تغییر اطلاعات حساب یا رمز عبور اطلاع‌رسانی شوید', enabled: false },
])

const resetPasswordForm = () => {
  passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
}

const handlePasswordChange = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.add({ title: 'خطا', description: 'رمز عبور جدید و تکرار آن یکسان نیستند', color: 'error' })
    return
  }
  isPasswordLoading.value = true
  try {
    await new Promise((r) => setTimeout(r, 1000))
    toast.add({ title: 'موفق', description: 'رمز عبور با موفقیت تغییر یافت', color: 'success' })
    resetPasswordForm()
  } catch {
    toast.add({ title: 'خطا', description: 'مشکلی در تغییر رمز عبور پیش آمد', color: 'error' })
  } finally {
    isPasswordLoading.value = false
  }
}

const revokeAllSessions = () => {
  toast.add({ title: 'خروج از همه دستگاه‌ها', description: 'از تمام دستگاه‌های دیگر خارج شدید', color: 'primary' })
}

useHead({ title: 'امنیت حساب | پنل کاربری' })
</script>
