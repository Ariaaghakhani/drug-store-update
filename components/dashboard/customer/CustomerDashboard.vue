<template>
  <div class="space-y-4">
    <DashboardStats
      :pending-count="stats?.pendingCount ?? 0"
      :completed-count="stats?.completedCount ?? 0"
      :total-spent="stats?.totalSpent ?? 0"
      :loading="statsPending"
    />

    <OrderTracking
      :orders="orders ?? []"
      :loading="ordersPending"
      @track="handleTrackOrder"
      @view-all="handleTrackOrder"
      @shop="router.push('/medications')"
    />

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
  prescriptions,
  prescriptionsPending,
  reorderItems,
  reorderPending,
} = useCustomerDashboard()

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
