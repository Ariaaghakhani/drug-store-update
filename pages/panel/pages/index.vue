<!-- pages/panel/pages/index.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader
      icon="i-heroicons-document-duplicate"
      title="صفحات"
      accent="اطلاع‌رسانی"
      subtitle="درباره ما، شرایط مرجوعی و قوانین فروشگاه"
    />

    <UCard :ui="{ body: 'p-0' }">
      <div class="px-6 pt-3 border-b border-gray-100 dark:border-gray-800">
        <UTabs v-model="tab" :items="tabItems" :content="false" variant="link" color="primary" />
      </div>

      <AboutUsForm v-if="tab === 'about'" />
      <ReturnPolicyTab v-else-if="tab === 'return'" />
      <TermsTab v-else-if="tab === 'terms'" />
    </UCard>
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import AboutUsForm from '@/components/panel/pages/AboutUsForm.vue'
import ReturnPolicyTab from '@/components/panel/pages/ReturnPolicyTab.vue'
import TermsTab from '@/components/panel/pages/TermsTab.vue'

const route = useRoute()
const router = useRouter()
const { canRead } = useModuleAccess()

// Each tab is gated by its BACK module. `about` is the default when the user can read it
const TAB_ITEMS = [
  { label: 'درباره ما', value: 'about', icon: 'i-heroicons-information-circle', module: 'ABOUT_US' },
  { label: 'شرایط مرجوعی', value: 'return', icon: 'i-heroicons-arrow-uturn-left', module: 'RETURN_POLICY' },
  { label: 'قوانین', value: 'terms', icon: 'i-heroicons-scale', module: 'TERMS' },
]

const tabItems = computed(() =>
  TAB_ITEMS.filter((item) => canRead(item.module)).map(({ label, value, icon }) => ({ label, value, icon }))
)

// The section lives in the query string (?tab=…), so a reload or a shared link keeps it
const tab = computed({
  get: () => {
    const allowed = tabItems.value.map((item) => item.value)
    return allowed.includes(route.query.tab) ? route.query.tab : (allowed[0] ?? 'about')
  },
  set: (value) => router.replace({ query: { ...route.query, tab: value } }),
})

useHead({ title: 'صفحات اطلاع‌رسانی | پنل مدیریت' })
</script>
