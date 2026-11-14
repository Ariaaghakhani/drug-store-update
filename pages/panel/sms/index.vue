<!-- pages/panel/sms/index.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader
      icon="i-heroicons-chat-bubble-bottom-center-text"
      title="پیامک و"
      accent="کمپین"
      subtitle="کمپین‌های پیامک به مشتریان باشگاه و حساب پیامک فروشگاه"
    >
      <template #actions>
        <UButton
          v-if="tab === 'campaigns'"
          color="primary"
          size="lg"
          icon="i-heroicons-plus"
          to="/panel/sms/new"
        >
          کمپین جدید
        </UButton>
      </template>
    </PanelPageHeader>

    <UTabs v-model="tab" :items="tabItems" :content="false" variant="link" color="primary" />

    <CampaignsTab v-if="tab === 'campaigns'" />
    <SmsAccountCard v-else />
  </div>
</template>

<script setup>
// SMS section: «کمپین‌ها» (SMS_CAMPAIGN) and «حساب پیامک» (SMS_ACCOUNT) on a `?tab=` query. Each tab shows only when
// the user can read its module; an unknown permission list shows both and lets BACK answer with a 403 state.
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import CampaignsTab from '@/components/panel/sms/CampaignsTab.vue'
import SmsAccountCard from '@/components/panel/sms/SmsAccountCard.vue'

const route = useRoute()
const router = useRouter()
const { canRead } = useModuleAccess()

const ALL_TABS = [
  { label: 'کمپین‌ها', value: 'campaigns', icon: 'i-heroicons-megaphone', module: 'SMS_CAMPAIGN' },
  { label: 'حساب پیامک', value: 'account', icon: 'i-heroicons-key', module: 'SMS_ACCOUNT' },
]

const tabItems = computed(() => {
  const allowed = ALL_TABS.filter((item) => canRead(item.module))
  return allowed.length ? allowed : ALL_TABS
})

// The section lives in the query string (?tab=…), so a reload or a shared link keeps it
const tab = computed({
  get: () => {
    const wanted = tabItems.value.find((item) => item.value === route.query.tab)
    return (wanted ?? tabItems.value[0]).value
  },
  set: (value) => router.replace({ query: { ...route.query, tab: value } }),
})

useHead({ title: 'پیامک و کمپین | پنل مدیریت' })
</script>
