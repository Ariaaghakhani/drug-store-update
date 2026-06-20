<template>
  <div class="space-y-4">
    <DashboardStats
      :pending-count="stats?.pendingCount ?? 0"
      :completed-count="stats?.completedCount ?? 0"
      :total-spent="stats?.totalSpent ?? 0"
      :loading="statsPending"
    />

    <div class="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
      <OrderTracking
        :orders="orders ?? []"
        :loading="ordersPending"
        @track="handleTrackOrder"
        @view-all="handleTrackOrder"
        @shop="router.push('/medications')"
      />
      <RefillReminders
        :reminders="reminders ?? []"
        :loading="remindersPending"
        @order="handleOrderReminder"
        @view-all="router.push('/panel/medications')"
      />
    </div>

    <PrescriptionsList
      :prescriptions="prescriptions ?? []"
      :loading="prescriptionsPending"
      @upload="handleUploadPrescription"
    />

    <ReorderGrid
      :items="reorderItems ?? []"
      :loading="reorderPending"
      @add="handleReorder"
    />
  </div>
</template>

<script setup>
import DashboardStats from '@/components/dashboard/customer/DashboardStats.vue'
import OrderTracking from '@/components/dashboard/customer/OrderTracking.vue'
import RefillReminders from '@/components/dashboard/customer/RefillReminders.vue'
import PrescriptionsList from '@/components/dashboard/customer/PrescriptionsList.vue'
import ReorderGrid from '@/components/dashboard/customer/ReorderGrid.vue'
import { useCustomerDashboard } from '@/composables/useCustomerDashboard'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
const router = useRouter()
const toast = useToast()

const {
  stats,
  statsPending,
  orders,
  ordersPending,
  reminders,
  remindersPending,
  prescriptions,
  prescriptionsPending,
  reorderItems,
  reorderPending,
} = useCustomerDashboard()

const handleOrderReminder = (reminder) => {
  cartStore.addItem({
    id: `reminder-${reminder.id}`,
    nameFa: reminder.medicationName,
    price: 0,
    quantity: 1,
    inStock: true,
  })
  toast.add({
    title: 'به سبد خرید اضافه شد',
    description: reminder.medicationName,
    color: 'success',
  })
}

const handleReorder = (item) => {
  cartStore.addItem({ ...item, quantity: 1, inStock: true })
  toast.add({
    title: 'به سبد خرید اضافه شد',
    description: item.nameFa,
    color: 'success',
  })
}

const handleTrackOrder = () => {
  router.push('/panel/orders')
}

const handleUploadPrescription = () => {
  router.push('/panel/orders')
}
</script>
