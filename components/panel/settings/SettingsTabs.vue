<!-- components/panel/settings/SettingsTabs.vue -->
<template>
  <PanelSectionTabs v-if="visibleTabs.length" :tabs="visibleTabs" />
</template>

<script setup>
// Section switcher for /panel/settings/*. A tab shows only when the user can read its BACK module.
import PanelSectionTabs from '@/components/panel/PanelSectionTabs.vue'
import { useModuleAccess } from '@/composables/useModuleAccess.js'

// C12a adds the remaining sections here.
const TABS = [
  { label: 'درگاه‌های پرداخت', to: '/panel/settings/payment', icon: 'i-heroicons-credit-card', module: 'PAYMENT_GATEWAY' },
]

const { canRead } = useModuleAccess()

const visibleTabs = computed(() =>
  TABS.filter((tab) => canRead(tab.module)).map(({ label, to, icon }) => ({ label, to, icon }))
)
</script>
