<!-- pages/panel/settings/index.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader icon="i-heroicons-adjustments-horizontal" title="تنظیمات" accent="عمومی" subtitle="مقدارهای قابل تغییر فروشگاه" />

    <SettingsTabs />

    <div class="flex flex-wrap items-center gap-3">
      <USelect
        v-model="groupKey"
        :items="groups"
        :disabled="isSearching || !groups.length"
        class="w-56"
        aria-label="گروه تنظیمات"
      />
      <UInput
        v-model="query"
        :maxlength="100"
        icon="i-heroicons-magnifying-glass"
        placeholder="جستجو در عنوان یا کلید تنظیم"
        class="w-72"
      />
    </div>

    <UCard :ui="{ body: 'p-0' }">
      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-48" />
                <USkeleton class="h-3 w-32" />
              </div>
              <USkeleton class="h-9 w-56 rounded-lg" />
            </div>
          </div>

          <PanelEmptyState
            v-else-if="forbidden"
            key="forbidden"
            variant="forbidden"
            title="دسترسی به تنظیمات فروشگاه ندارید"
          />

          <PanelEmptyState
            v-else-if="error"
            key="error"
            variant="error"
            title="دریافت تنظیمات ناموفق بود"
          >
            <template #action>
              <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
                تلاش دوباره
              </UButton>
            </template>
          </PanelEmptyState>

          <div v-else-if="visibleRows.length" key="content" class="divide-y divide-gray-100 dark:divide-gray-800">
            <SettingField
              v-for="setting in visibleRows"
              :key="setting.key"
              :setting="setting"
              @saved="onSaved"
            />
          </div>

          <PanelEmptyState
            v-else
            key="empty"
            icon="i-heroicons-adjustments-horizontal"
            title="تنظیمی پیدا نشد"
            text="عبارت دیگری را جستجو کنید یا گروه دیگری را انتخاب کنید"
          />
        </Transition>
      </div>
    </UCard>
  </div>
</template>

<script setup>
// Generic editor for the store's SYSTEM_SETTINGS rows: one group at a time, or a search across every editable row.
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import SettingsTabs from '@/components/panel/settings/SettingsTabs.vue'
import SettingField from '@/components/panel/settings/SettingField.vue'
import { errorStatus } from '~/utils/apiError.js'
import { PROFILE_SETTING_GROUPS, SETTING_GROUP_ORDER } from '~/utils/settingsMeta.js'
import { useStoreProfile } from '@/composables/useStoreProfile.js'

useHead({ title: 'تنظیمات عمومی | تنظیمات فروشگاه' })

const app = useNuxtApp()
const { refresh: refreshStoreProfile } = useStoreProfile()

const rows = ref([])
const loading = ref(true)
const error = ref(false)
const forbidden = ref(false)
const groupKey = ref('')
const query = ref('')

// Only editable rows show here; read-only rows belong to other screens (store type, password policy)
const editableRows = computed(() => rows.value.filter((setting) => setting.editable))

// Group select: the known order first, then unknown groups as BACK labels them. Groups without editable rows are left out.
const groups = computed(() => {
  const labels = new Map()
  for (const setting of editableRows.value) {
    if (!labels.has(setting.group)) labels.set(setting.group, setting.groupLabel || setting.group)
  }
  const known = SETTING_GROUP_ORDER.filter((key) => labels.has(key))
  const extra = [...labels.keys()].filter((key) => !SETTING_GROUP_ORDER.includes(key))
  return [...known, ...extra].map((key) => ({ value: key, label: labels.get(key) }))
})

const isSearching = computed(() => query.value.trim() !== '')

// A search looks through every editable row (the group select is disabled); otherwise the chosen group.
const visibleRows = computed(() => {
  if (isSearching.value) {
    const needle = query.value.trim().toLowerCase()
    return editableRows.value.filter(
      (setting) => setting.label?.toLowerCase().includes(needle) || setting.key?.toLowerCase().includes(needle)
    )
  }
  return editableRows.value.filter((setting) => setting.group === groupKey.value)
})

const load = async () => {
  loading.value = true
  error.value = false
  forbidden.value = false
  try {
    const res = await app.$api.storeSettings.listSettings()
    rows.value = res.data.data ?? []
    if (!groups.value.some((group) => group.value === groupKey.value)) {
      groupKey.value = groups.value[0]?.value ?? ''
    }
  } catch (e) {
    if (errorStatus(e) === 403) forbidden.value = true
    else error.value = true
  } finally {
    loading.value = false
  }
}

// The saved row replaces the old one. Storefront-facing groups also reload the shared store profile.
const onSaved = (updated) => {
  rows.value = rows.value.map((setting) => (setting.key === updated.key ? updated : setting))
  if (PROFILE_SETTING_GROUPS.includes(updated.group)) refreshStoreProfile()
}

onMounted(load)
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
