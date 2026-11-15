<!-- pages/panel/purchase-orders/new.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader icon="i-heroicons-clipboard-document-list" title="سفارش خرید" accent="جدید">
      <template #actions>
        <UButton color="neutral" variant="outline" to="/panel/purchase-orders">انصراف</UButton>
        <UButton type="submit" form="purchase-order-form" color="primary" :loading="saving" :disabled="saving">
          ثبت پیش‌نویس
        </UButton>
      </template>
    </PanelPageHeader>

    <UCard>
      <PurchaseOrderForm :saving="saving" @submit="onSubmit" />
    </UCard>
  </div>
</template>

<script setup>
// New purchase order. Saved as DRAFT; the detail page has the «ثبت نهایی» action.
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PurchaseOrderForm from '@/components/panel/purchase-orders/PurchaseOrderForm.vue'
import { apiErrorMessage, isPending } from '~/utils/apiError.js'

const app = useNuxtApp()
const toast = useAppToast()
const saving = ref(false)

const onSubmit = async (body) => {
  if (saving.value) return
  saving.value = true
  try {
    const res = await app.$api.orders.createPurchaseOrder({ data: body })
    // A workflow-gated create has no id yet: go back to the list instead
    if (isPending(res)) {
      await navigateTo('/panel/purchase-orders')
      return
    }
    toast.success('سفارش خرید به‌صورت پیش‌نویس ثبت شد')
    await navigateTo(`/panel/purchase-orders/${res.data.data.id}`)
  } catch (e) {
    toast.error(apiErrorMessage(e, 'ثبت سفارش خرید ناموفق بود'))
  } finally {
    saving.value = false
  }
}

useHead({ title: 'سفارش خرید جدید | پنل مدیریت' })
</script>
