<!-- components/panel/settings/SettingsTabs.vue -->
<template>
  <PanelSectionTabs v-if="visibleTabs.length" :tabs="visibleTabs" />
</template>

<script setup>
// Section switcher for /panel/settings/*. A tab shows only when the user can read its BACK module.
import PanelSectionTabs from '@/components/panel/PanelSectionTabs.vue'
import { useModuleAccess } from '@/composables/useModuleAccess.js'

const TABS = [
  { label: 'تنظیمات عمومی', to: '/panel/settings', icon: 'i-heroicons-adjustments-horizontal', exact: true, module: 'SYSTEM_SETTINGS' },
  { label: 'درگاه‌های پرداخت', to: '/panel/settings/payment', icon: 'i-heroicons-credit-card', module: 'PAYMENT_GATEWAY' },
  { label: 'نوع فروشگاه', to: '/panel/settings/store', icon: 'i-heroicons-building-storefront', module: 'SYSTEM_SETTINGS' },
  { label: 'سیاست رمز عبور', to: '/panel/settings/password', icon: 'i-heroicons-key', module: 'PASSWORD_POLICY' },
  { label: 'اطلاعات سازمان', to: '/panel/settings/organization', icon: 'i-heroicons-identification', module: 'MY_ORGANIZATION' },
]

const { canRead } = useModuleAccess()

// `exact` must reach PanelSectionTabs, or the index tab stays active on every sub-page.
const visibleTabs = computed(() =>
  TABS.filter((tab) => canRead(tab.module)).map(({ label, to, icon, exact }) => ({ label, to, icon, exact }))
)
</script>
