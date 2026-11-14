<!-- pages/panel/settings/payment.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader icon="i-heroicons-credit-card" title="درگاه‌های" accent="پرداخت" />

    <SettingsTabs />

    <PaymentGatewaysCard />
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import SettingsTabs from '@/components/panel/settings/SettingsTabs.vue'
import PaymentGatewaysCard from '@/components/panel/settings/PaymentGatewaysCard.vue'

useHead({ title: 'درگاه‌های پرداخت | تنظیمات فروشگاه' })
</script>
