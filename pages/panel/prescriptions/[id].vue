<!-- pages/panel/prescriptions/[id].vue -->
<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <h3 class="text-xl font-black text-gray-900 dark:text-white">
        جزئیات <span class="text-brand-500">نسخه</span>
      </h3>
      <UButton to="/panel/prescriptions" color="neutral" variant="outline" icon="i-heroicons-arrow-right">
        بازگشت به نسخه‌ها
      </UButton>
    </div>

    <CustomerPrescriptionDetail v-if="!isStaff" :id="route.params.id" />

    <UCard v-else>
      <PanelEmptyState
        icon="i-heroicons-document-text"
        title="بررسی نسخه‌ی مشتری"
        text="نمای کارمند برای بررسی و پاسخ به نسخه در مرحله‌ی بعد اضافه می‌شود"
      />
    </UCard>
  </div>
</template>

<script setup>
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import CustomerPrescriptionDetail from '@/components/panel/prescriptions/CustomerPrescriptionDetail.vue'

const route = useRoute()
const { getUserRole } = useUserPanelTabs()

// Staff get a placeholder until the staff view is built (C17b). Customers see their own prescription.
const isStaff = computed(() => getUserRole() !== 'customer')

useHead({ title: 'جزئیات نسخه | پنل کاربری' })
</script>
