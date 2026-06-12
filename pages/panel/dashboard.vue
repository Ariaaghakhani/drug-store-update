<template>
  <component :is="dashboardComponent" />
</template>

<script setup>
import CustomerDashboard from '@/components/dashboard/customer/CustomerDashboard.vue'
import AdminDashboard from '@/components/dashboard/admin/AdminDashboard.vue'
import OwnerDashboard from '@/components/dashboard/owner/OwnerDashboard.vue'
import { useUserPanelTabs } from '@/composables/useUserPanelTabs'

const { getUserRole } = useUserPanelTabs()

const componentMap = {
  customer: CustomerDashboard,
  admin: AdminDashboard,
  owner: OwnerDashboard,
}

const dashboardComponent = computed(
  () => componentMap[getUserRole()] ?? CustomerDashboard
)

useHead({ title: 'داشبورد | پنل کاربری' })
</script>
