<!-- pages/panel/security.vue -->
<template>
  <div class="font-dana" dir="rtl">
    <div class="space-y-4">
      <AuthMethodsCard
        :loading="pending"
        :two-f-a-enabled="twoFAEnabled"
        :sms-enabled="smsEnabled"
        @change-password="showPasswordModal = true"
        @manage-2fa="show2FAModal = true"
        @update:sms-enabled="smsEnabled = $event"
      />
      <ActiveSessionsCard
        :loading="pending"
        :sessions="activeSessions"
        @revoke="revokeSession"
        @revoke-all="revokeAllSessions"
      />
      <LoginHistoryCard :loading="pending" :history="loginHistory" />
      <SecurityAlertsCard
        :loading="pending"
        :notifications="securityNotifications"
        @toggle="onNotificationToggle"
      />
      <DangerZoneCard
        :loading="pending"
        @end-sessions="revokeAllSessions"
        @delete-account="handleDeleteAccount"
      />
    </div>

    <ChangePasswordModal v-model:open="showPasswordModal" @saved="onPasswordSaved" />
    <TwoFAModal
      v-model:open="show2FAModal"
      :enabled="twoFAEnabled"
      @activate="onActivate2FA"
      @deactivate="onDeactivate2FA"
    />
  </div>
</template>

<script setup lang="ts">
import AuthMethodsCard from '@/components/panel/security/AuthMethodsCard.vue'
import ActiveSessionsCard from '@/components/panel/security/ActiveSessionsCard.vue'
import type { Session } from '@/components/panel/security/ActiveSessionsCard.vue'
import LoginHistoryCard from '@/components/panel/security/LoginHistoryCard.vue'
import type { LoginEntry } from '@/components/panel/security/LoginHistoryCard.vue'
import SecurityAlertsCard from '@/components/panel/security/SecurityAlertsCard.vue'
import type { SecurityNotification } from '@/components/panel/security/SecurityAlertsCard.vue'
import DangerZoneCard from '@/components/panel/security/DangerZoneCard.vue'
import ChangePasswordModal from '@/components/panel/security/ChangePasswordModal.vue'
import TwoFAModal from '@/components/panel/security/TwoFAModal.vue'

const toast = useToast()

const pending = ref(true)
const twoFAEnabled = ref(true)
const smsEnabled = ref(false)
const showPasswordModal = ref(false)
const show2FAModal = ref(false)

const activeSessions = ref<Session[]>([
  { id: 1, current: true, icon: 'i-heroicons-computer-desktop', device: 'MacBook Pro', browser: 'Chrome 124 · macOS', location: 'تهران', ip: '185.xx.xx.42', lastActive: 'هم‌اکنون' },
  { id: 2, current: false, icon: 'i-heroicons-device-phone-mobile', device: 'Samsung Galaxy S23', browser: 'Samsung Browser · Android 14', location: 'اصفهان', ip: '94.xx.xx.17', lastActive: '۲ ساعت پیش' },
  { id: 3, current: false, icon: 'i-heroicons-computer-desktop', device: 'Windows PC', browser: 'Firefox 125 · Windows 11', location: 'مشهد', ip: '91.xx.xx.88', lastActive: 'دیروز، ۱۴:۳۰' },
])

const loginHistory = ref<LoginEntry[]>([
  { id: 1, success: true, suspicious: false, action: 'ورود موفق', device: 'Chrome · MacBook Pro', ip: '185.xx.xx.42', time: 'امروز، ۱۰:۱۵' },
  { id: 2, success: true, suspicious: false, action: 'ورود موفق', device: 'Samsung Browser · Android', ip: '94.xx.xx.17', time: 'دیروز، ۱۸:۴۰' },
  { id: 3, success: false, suspicious: true, action: 'تلاش ناموفق برای ورود', device: 'Chrome · Windows', ip: '212.xx.xx.11', time: 'دیروز، ۰۳:۲۲' },
  { id: 4, success: true, suspicious: false, action: 'ورود موفق', device: 'Firefox · Windows PC', ip: '91.xx.xx.88', time: '۳ روز پیش، ۱۴:۳۰' },
])

const securityNotifications = ref<SecurityNotification[]>([
  { id: 'new-device', label: 'ورود از دستگاه جدید', description: 'هنگام ورود از یک دستگاه ناشناس اطلاع‌رسانی شوید', enabled: true },
  { id: 'failed-login', label: 'تلاش‌های ناموفق برای ورود', description: 'پس از ۳ تلاش ناموفق متوالی اطلاع‌رسانی شوید', enabled: true },
  { id: 'profile-change', label: 'تغییرات پروفایل', description: 'هنگام تغییر اطلاعات حساب یا رمز عبور اطلاع‌رسانی شوید', enabled: false },
])

const revokeSession = (id: number) => {
  activeSessions.value = activeSessions.value.filter((s) => s.id !== id)
  toast.add({ title: 'دسترسی لغو شد', color: 'success' })
}

const revokeAllSessions = () => {
  activeSessions.value = activeSessions.value.filter((s) => s.current)
  toast.add({ title: 'خروج از همه دستگاه‌ها', description: 'از تمام دستگاه‌های دیگر خارج شدید', color: 'primary' })
}

const onNotificationToggle = (id: string, enabled: boolean) => {
  const notif = securityNotifications.value.find((n) => n.id === id)
  if (notif) notif.enabled = enabled
}

const onPasswordSaved = () => {
  toast.add({ title: 'رمز عبور تغییر کرد', color: 'success' })
}

const onActivate2FA = () => {
  twoFAEnabled.value = true
  toast.add({ title: 'فعال شد', description: 'اپلیکیشن احراز هویت با موفقیت فعال شد', color: 'success' })
}

const onDeactivate2FA = () => {
  twoFAEnabled.value = false
  toast.add({ title: 'غیرفعال شد', description: 'احراز هویت دو مرحله‌ای غیرفعال شد', color: 'success' })
}

const handleDeleteAccount = () => {
  toast.add({ title: 'درخواست ثبت شد', description: 'حذف حساب نیاز به تأیید بیشتر دارد', color: 'warning' })
}

onMounted(async () => {
  await new Promise((r) => setTimeout(r, 600))
  pending.value = false
})

useHead({ title: 'امنیت حساب | پنل کاربری' })
</script>
