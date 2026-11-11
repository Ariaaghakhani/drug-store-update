<template>
  <!-- wrapper takes panel.vue's fallthrough h-full, so the card keeps its own height -->
  <div v-if="noDashboardAccess">
    <UCard :ui="{ body: 'p-5' }">
      <div class="flex flex-col items-center justify-center text-center py-16 gap-3">
        <UIcon name="i-heroicons-lock-closed" class="w-16 h-16 text-gray-300 dark:text-gray-700" />
        <p class="text-base font-bold text-gray-900 dark:text-white">دسترسی به آمار داشبورد ندارید</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          برای دیدن آمار فروشگاه، مجوز «داشبورد» را از مدیر فروشگاه بگیرید
        </p>
      </div>
    </UCard>
  </div>
  <AdminDashboard v-else-if="role === 'admin'" />
  <OwnerDashboard v-else-if="role === 'owner'" />
  <CustomerDashboard v-else />
</template>

<script setup>
import CustomerDashboard from '@/components/dashboard/customer/CustomerDashboard.vue'
import AdminDashboard from '@/components/dashboard/admin/AdminDashboard.vue'
import OwnerDashboard from '@/components/dashboard/owner/OwnerDashboard.vue'
import { useUserPanelTabs } from '@/composables/useUserPanelTabs'

const { getUserRole } = useUserPanelTabs()
const userStore = useUserStore()

const role = computed(() => getUserRole())

// Every api/dashboard/admin|owner/* call needs DASHBOARD READ; without it BACK answers 403 and the cards would show
// fake zeros. Missing/empty permissions mean "not loaded" (see useUserPanelTabs), so those keep the role dashboard.
const noDashboardAccess = computed(() => {
  if (role.value === 'customer') return false
  const granted = userStore.permissions
  if (!Array.isArray(granted) || granted.length === 0) return false
  return !granted.some((p) => p.module === 'DASHBOARD' && p.action === 'READ')
})

useHead({ title: 'داشبورد | پنل کاربری' })
</script>
