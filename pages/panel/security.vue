<!-- pages/panel/security.vue -->
<template>
  <div class="font-dana" dir="rtl">
    <div class="space-y-4">
      <AuthMethodsCard
        :loading="pending"
        :username="maskedUsername"
        @change-password="showPasswordModal = true"
        @change-username="showPhoneModal = true"
      />
      <ActiveSessionsCard
        :loading="pending"
        :sessions="activeSessions"
        @revoke="revokeSession"
        @revoke-all="revokeAllSessions"
      />
      <LoginHistoryCard
        :loading="pending"
        :history="loginHistory"
      />
      <SecurityAlertsCard
        :loading="pending"
        :notifications="securityNotifications"
        :saving-id="savingNotificationId"
        @toggle="onNotificationToggle"
      />
      <DangerZoneCard
        :loading="pending"
        @end-sessions="revokeAllSessions"
        @delete-account="handleDeleteAccount"
      />
    </div>

    <ChangePasswordModal v-model:open="showPasswordModal" @saved="onPasswordSaved" />
    <ChangePhoneModal v-model:open="showPhoneModal" />
  </div>
</template>

<script setup>
import AuthMethodsCard from '@/components/panel/security/AuthMethodsCard.vue'
import ActiveSessionsCard from '@/components/panel/security/ActiveSessionsCard.vue'
import LoginHistoryCard from '@/components/panel/security/LoginHistoryCard.vue'
import SecurityAlertsCard from '@/components/panel/security/SecurityAlertsCard.vue'
import DangerZoneCard from '@/components/panel/security/DangerZoneCard.vue'
import ChangePasswordModal from '@/components/panel/security/ChangePasswordModal.vue'
import ChangePhoneModal from '@/components/panel/profile/ChangePhoneModal.vue'

const app = useNuxtApp()
const toast = useToast()

const pending = ref(true)
// BACK's username is the mobile; ChangePhoneModal changes both and refreshes the stored user
const userStore = useUserStore()
const maskedUsername = computed(() => maskMobile(userStore.currentUser?.username))
const showPhoneModal = ref(false)
const showPasswordModal = ref(false)

const activeSessions = ref([])
const loginHistory = ref([])
const securityNotifications = ref([])
const savingNotificationId = ref(null)

const extractErrorMessage = (error, fallback) => error?.response?.data?.message ?? fallback

const fetchSessions = async () => {
  try {
    const response = await app.$api.auth.listSessions()
    activeSessions.value = (response.data.data ?? []).map(mapSession)
  } catch {
    activeSessions.value = []
  }
}

const fetchLoginHistory = async () => {
  try {
    const response = await app.$api.auth.getLoginHistory({ params: { page: 0, size: LOGIN_HISTORY_SIZE } })
    loginHistory.value = response.data.data?.content ?? []
  } catch {
    loginHistory.value = []
  }
}

const fetchSecurityNotifications = async () => {
  try {
    const response = await app.$api.auth.getSecurityNotifications()
    securityNotifications.value = response.data.data ?? []
  } catch {
    securityNotifications.value = []
  }
}

const revokeSession = async (id) => {
  const session = activeSessions.value.find((s) => s.id === id)
  try {
    await app.$api.auth.revokeSession(id)
    if (session?.current) {
      // Not logoutAndResetAuthentication/$auth.reset() — that navigates to '/',
      // which would race this explicit '/login' redirect.
      app.$auth.setToken(null)
      await navigateTo('/login')
      return
    }
    activeSessions.value = activeSessions.value.filter((s) => s.id !== id)
    toast.add({ title: 'دسترسی لغو شد', color: 'success' })
  } catch (error) {
    toast.add({ title: extractErrorMessage(error, 'لغو دسترسی ناموفق بود'), color: 'error' })
  }
}

const revokeAllSessions = async () => {
  try {
    await app.$api.auth.revokeAllSessions()
    app.$auth.setToken(null)
    await navigateTo('/login')
  } catch (error) {
    toast.add({ title: extractErrorMessage(error, 'خروج از همه دستگاه‌ها ناموفق بود'), color: 'error' })
  }
}

const onNotificationToggle = async (id, enabled) => {
  const notif = securityNotifications.value.find((n) => n.id === id)
  if (!notif) return
  const previous = notif.enabled
  notif.enabled = enabled
  savingNotificationId.value = id
  try {
    const response = await app.$api.auth.updateSecurityNotification({ data: { id, enabled } })
    securityNotifications.value = response.data.data ?? securityNotifications.value
  } catch (error) {
    notif.enabled = previous
    toast.add({ title: extractErrorMessage(error, 'ذخیره تنظیمات ناموفق بود'), color: 'error' })
  } finally {
    savingNotificationId.value = null
  }
}

const onPasswordSaved = () => {
  toast.add({ title: 'رمز عبور تغییر کرد', color: 'success' })
}

const handleDeleteAccount = () => {
  toast.add({ title: 'درخواست ثبت شد', description: 'حذف حساب نیاز به تأیید بیشتر دارد', color: 'warning' })
}

onMounted(async () => {
  await Promise.all([fetchSessions(), fetchLoginHistory(), fetchSecurityNotifications()])
  pending.value = false
})

useHead({ title: 'امنیت حساب | پنل کاربری' })
</script>
