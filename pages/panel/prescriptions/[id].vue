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

    <StaffPrescriptionDetail v-if="isStaff" :id="route.params.id" />
    <CustomerPrescriptionDetail v-else :id="route.params.id" />
  </div>
</template>

<script setup>
import CustomerPrescriptionDetail from '@/components/panel/prescriptions/CustomerPrescriptionDetail.vue'
import StaffPrescriptionDetail from '@/components/panel/prescriptions/StaffPrescriptionDetail.vue'

const route = useRoute()
const { getUserRole } = useUserPanelTabs()

// Staff (any non-customer role) get the admin view; customers see their own prescription.
const isStaff = computed(() => getUserRole() !== 'customer')

useHead({ title: isStaff.value ? 'جزئیات نسخه | پنل مدیریت' : 'جزئیات نسخه | پنل کاربری' })
</script>
