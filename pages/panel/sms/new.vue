<!-- pages/panel/sms/new.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader
      icon="i-heroicons-chat-bubble-bottom-center-text"
      title="کمپین"
      accent="جدید"
      subtitle="پیامک را بنویسید، پیش‌نمایش را ببینید و برای مشتریان بفرستید"
    >
      <template #actions>
        <UButton color="neutral" variant="outline" size="lg" to="/panel/sms">انصراف</UButton>
      </template>
    </PanelPageHeader>

    <CampaignForm />
  </div>
</template>

<script setup>
// New SMS campaign. The form owns its fields, preview and submit (its single primary button), and opens the new
// campaign's detail page after a successful create.
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import CampaignForm from '@/components/panel/sms/CampaignForm.vue'

useHead({ title: 'کمپین جدید | پیامک | پنل مدیریت' })
</script>
