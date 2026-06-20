<template>
  <AdminDashboard v-if="role === 'admin'" />
  <OwnerDashboard v-else-if="role === 'owner'" />
  <CustomerDashboard v-else />
</template>

<script setup>
import CustomerDashboard from '@/components/dashboard/customer/CustomerDashboard.vue'
import AdminDashboard from '@/components/dashboard/admin/AdminDashboard.vue'
import OwnerDashboard from '@/components/dashboard/owner/OwnerDashboard.vue'
import { useUserPanelTabs } from '@/composables/useUserPanelTabs'

const { getUserRole } = useUserPanelTabs()

const role = computed(() => getUserRole())

useHead({ title: 'داشبورد | پنل کاربری' })
</script>
