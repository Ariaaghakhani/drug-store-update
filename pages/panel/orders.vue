<!-- pages/panel/orders.vue -->
<template>
  <UCard>
    <CustomerOrders v-if="role === 'customer'" />
    <OrdersManagement v-else />
  </UCard>
</template>

<script setup>
import CustomerOrders from '~/components/panel/orders/CustomerOrders.vue'
import OrdersManagement from '~/components/panel/orders/OrdersManagement.vue'

const { getUserRole } = useUserPanelTabs()
const role = computed(() => getUserRole())

useHead({
  title: computed(() =>
    role.value === 'customer'
      ? 'سفارشات من | پنل کاربری'
      : 'مدیریت سفارشات | پنل مدیریت'
  ),
})
</script>
