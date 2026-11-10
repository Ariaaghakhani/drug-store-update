<!-- pages/panel/users/[id].vue -->
<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-xl font-black text-gray-900 dark:text-white">
        جزئیات <span class="text-brand-500">کاربر</span>
      </h3>
      <UButton to="/panel/users" color="neutral" variant="outline" icon="i-heroicons-arrow-right">
        بازگشت به کاربران
      </UButton>
    </div>

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="space-y-4">
          <USkeleton class="h-52 w-full rounded-xl" />
          <USkeleton class="h-40 w-full rounded-xl" />
          <USkeleton class="h-40 w-full rounded-xl" />
        </div>

        <div v-else-if="user" key="content" class="space-y-4">
          <UCard>
            <div class="flex items-center gap-3 flex-wrap">
              <div class="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
                <span class="text-sm font-bold text-white">{{ user.fullName[0] }}</span>
              </div>
              <div class="min-w-0">
                <p class="text-base font-bold text-gray-900 dark:text-white">{{ user.fullName }}</p>
                <div class="flex items-center gap-1 flex-wrap mt-1">
                  <UBadge v-for="role in user.roleBadges" :key="role.name" :color="role.color" variant="subtle" size="sm">
                    {{ role.label }}
                  </UBadge>
                  <UBadge v-if="user.isLocked" color="error" variant="subtle" size="sm">قفل‌شده</UBadge>
                  <UBadge v-else-if="!user.isActive" color="neutral" variant="subtle" size="sm">غیرفعال</UBadge>
                </div>
              </div>
            </div>

            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-5">
              <div v-for="row in detailRows" :key="row.label">
                <dt class="text-xs text-gray-500 dark:text-gray-400">{{ row.label }}</dt>
                <dd class="text-sm text-gray-900 dark:text-white mt-0.5" :dir="row.ltr ? 'ltr' : undefined" :class="row.ltr && 'text-end'">
                  {{ row.value }}
                </dd>
              </div>
            </dl>

            <div class="flex items-center gap-2 mt-5 flex-wrap">
              <UButton color="primary" icon="i-heroicons-identification" @click="showRolesModal = true">
                {{ user.staff ? 'تغییر نقش' : 'دادن نقش کارکنان' }}
              </UButton>
              <UButton
                color="neutral"
                variant="outline"
                :icon="user.isActive ? 'i-heroicons-no-symbol' : 'i-heroicons-check-circle'"
                :loading="changingAccount"
                @click="toggleActive"
              >
                {{ user.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی' }}
              </UButton>
              <UButton
                :color="user.isLocked ? 'neutral' : 'error'"
                variant="outline"
                :icon="user.isLocked ? 'i-heroicons-lock-open' : 'i-heroicons-lock-closed'"
                :loading="changingAccount"
                @click="toggleLocked"
              >
                {{ user.isLocked ? 'باز کردن قفل' : 'قفل کردن' }}
              </UButton>
            </div>
          </UCard>

          <ActiveSessionsCard
            :loading="sessionsLoading"
            :sessions="sessions"
            @revoke="revokeSession"
            @revoke-all="revokeAllSessions"
          />
          <LoginHistoryCard
            :loading="historyLoading"
            :history="history"
          />
          <TermsAcceptancesCard v-if="canReadTerms" :user-id="userId" />
        </div>

        <div v-else key="empty" class="text-center py-16">
          <UIcon name="i-heroicons-users" class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <h4 class="text-base font-bold text-gray-900 dark:text-white mb-2">کاربر یافت نشد</h4>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">این کاربر وجود ندارد یا به فروشگاه شما تعلق ندارد</p>
          <UButton to="/panel/users" color="primary" icon="i-heroicons-arrow-right">بازگشت به کاربران</UButton>
        </div>
      </Transition>
    </div>

    <UserRolesModal
      v-model:open="showRolesModal"
      :user="user"
      :role-items="staffRoleItems"
      :initial-role-ids="staffRoleIdsOf(user)"
      :loading="savingRoles"
      @save="onSaveRoles"
    />
  </div>
</template>

<script setup>
import ActiveSessionsCard from '@/components/panel/security/ActiveSessionsCard.vue'
import LoginHistoryCard from '@/components/panel/security/LoginHistoryCard.vue'
import UserRolesModal from '@/components/panel/users/UserRolesModal.vue'
import TermsAcceptancesCard from '@/components/panel/users/TermsAcceptancesCard.vue'

useHead({ title: 'جزئیات کاربر | پنل مدیریت' })

const route = useRoute()
const app = useNuxtApp()
const toast = useAppToast()
const { staffRoleItems, staffRoleIdsOf, loadRoles, mapUser, setActive, setLocked, setRoles, formatDateTime } =
  useManagedUsers()

const userId = Number(route.params.id)

// The terms acceptance history is shown only to staff who can read the TERMS module
const { canRead } = useModuleAccess()
const canReadTerms = computed(() => canRead('TERMS'))

const loading = ref(true)
const user = ref(null)

const detailRows = computed(() => {
  const current = user.value
  if (!current) return []
  const count = current.failedLoginAttempts ?? 0
  const rows = [
    { label: 'شماره موبایل', value: current.phone || '—', ltr: true },
    {
      label: 'ایمیل',
      value: current.email ? `${current.email}${current.emailVerifiedAt ? '' : ' (تأییدنشده)'}` : '—',
      ltr: Boolean(current.email),
    },
    { label: 'تاریخ عضویت', value: formatDateTime(current.createdAt) || '—' },
    { label: 'آخرین ورود', value: current.lastLoginFa },
    { label: 'آخرین تغییر رمز', value: formatDateTime(current.passwordChangedAt) || '—' },
    { label: 'تلاش ناموفق ورود', value: count.toLocaleString('fa-IR') },
  ]
  if (current.lastFailedLoginAt) {
    rows.push({ label: 'آخرین تلاش ناموفق', value: formatDateTime(current.lastFailedLoginAt) })
  }
  if (current.isLocked) {
    rows.push({
      label: 'قفل تا',
      value: current.lockedUntil ? formatDateTime(current.lockedUntil) : 'تا باز شدن توسط مدیر',
    })
  }
  return rows
})

async function fetchUser() {
  try {
    const response = await app.$api.user.getManagedUser({ data: { id: userId } })
    user.value = mapUser(response.data.data)
  } catch {
    user.value = null
  }
}

// ---------- account ----------
const changingAccount = ref(false)

async function applyAccountChange(change) {
  changingAccount.value = true
  const updated = await change()
  changingAccount.value = false
  if (!updated) return
  user.value = updated
  // Deactivating and locking also end the user's sessions on BACK
  fetchSessions()
}

const toggleActive = () => applyAccountChange(() => setActive(user.value, !user.value.isActive))
const toggleLocked = () => applyAccountChange(() => setLocked(user.value, !user.value.isLocked))

const showRolesModal = ref(false)
const savingRoles = ref(false)

async function onSaveRoles(roleIds) {
  savingRoles.value = true
  const updated = await setRoles(user.value, roleIds)
  savingRoles.value = false
  if (!updated) return
  user.value = updated
  showRolesModal.value = false
  fetchSessions()
}

// ---------- sessions ----------
const SIGN_OUT_NOTE = 'دستگاه تا چند دقیقه دیگر، با پایان اعتبار توکن فعلی، خارج می‌شود'
const sessionsLoading = ref(true)
const sessions = ref([])

async function fetchSessions() {
  try {
    const response = await app.$api.user.listManagedUserSessions({ data: { id: userId } })
    sessions.value = (response.data.data ?? []).map(mapSession)
  } catch {
    sessions.value = []
  } finally {
    sessionsLoading.value = false
  }
}

async function revokeSession(sessionId) {
  try {
    await app.$api.user.revokeManagedUserSession({ data: { id: userId, sessionId } })
    sessions.value = sessions.value.filter((session) => session.id !== sessionId)
    toast.success('کاربر از این دستگاه خارج شد', SIGN_OUT_NOTE)
  } catch (error) {
    toast.error('خروج از دستگاه ناموفق بود', error?.response?.data?.message)
  }
}

async function revokeAllSessions() {
  try {
    await app.$api.user.revokeAllManagedUserSessions({ data: { id: userId } })
    sessions.value = []
    toast.success('کاربر از همه دستگاه‌ها خارج شد', SIGN_OUT_NOTE)
  } catch (error) {
    toast.error('خروج از همه دستگاه‌ها ناموفق بود', error?.response?.data?.message)
  }
}

// ---------- login history ----------
const historyLoading = ref(true)
const history = ref([])

async function fetchHistory() {
  try {
    const response = await app.$api.user.getManagedUserLoginHistory({
      data: { id: userId, page: 0, size: LOGIN_HISTORY_SIZE },
    })
    history.value = response.data.data?.content ?? []
  } catch {
    history.value = []
  } finally {
    historyLoading.value = false
  }
}

onMounted(async () => {
  await loadRoles()
  await fetchUser()
  loading.value = false
  if (user.value) await Promise.all([fetchSessions(), fetchHistory()])
})
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
