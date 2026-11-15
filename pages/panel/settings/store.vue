<!-- pages/panel/settings/store.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader icon="i-heroicons-building-storefront" title="نوع" accent="فروشگاه" subtitle="الگوی فروشگاه و قابلیت‌های کالا" />

    <SettingsTabs />

    <div v-if="loading" class="space-y-5">
      <UCard>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <USkeleton v-for="i in 5" :key="i" class="h-20 w-full rounded-xl" />
        </div>
      </UCard>
      <UCard>
        <div class="space-y-4">
          <USkeleton v-for="i in 4" :key="i" class="h-6 w-full rounded-lg" />
        </div>
      </UCard>
    </div>

    <UCard v-else-if="forbidden">
      <PanelEmptyState variant="forbidden" title="دسترسی به نوع فروشگاه ندارید" />
    </UCard>

    <UCard v-else-if="error">
      <PanelEmptyState variant="error" title="دریافت نوع فروشگاه ناموفق بود">
        <template #action>
          <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
            تلاش دوباره
          </UButton>
        </template>
      </PanelEmptyState>
    </UCard>

    <template v-else>
      <UCard :ui="{ body: 'p-0' }">
        <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <UIcon name="i-heroicons-building-storefront" class="w-4 h-4 text-brand-500 dark:text-brand-400" />
          <h2 class="text-sm font-medium text-gray-900 dark:text-white">الگوی فروشگاه</h2>
        </div>
        <div class="p-4 sm:p-6 space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-300 leading-6">
            نوع فروشگاه، پیش‌فرض قابلیت‌های کالا را تعیین می‌کند. با انتخاب نوع، کلیدهای زیر به پیش‌فرض آن نوع برمی‌گردند.
          </p>

          <div role="radiogroup" aria-label="نوع فروشگاه" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <button
              v-for="type in storeTypes"
              :key="type.value"
              type="button"
              role="radio"
              :aria-checked="draft.storeType === type.value"
              :disabled="saving"
              class="relative text-start rounded-xl border p-4 transition-colors disabled:opacity-60"
              :class="
                draft.storeType === type.value
                  ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/20'
                  : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-800/60'
              "
              @click="selectType(type.value)"
            >
              <div class="flex items-start justify-between gap-2">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ type.label }}</p>
                <UIcon
                  v-if="draft.storeType === type.value"
                  name="i-heroicons-check-circle-solid"
                  class="w-5 h-5 flex-shrink-0 text-brand-500 dark:text-brand-400"
                />
              </div>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ type.summary }}</p>
            </button>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-0' }">
        <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <UIcon name="i-heroicons-adjustments-horizontal" class="w-4 h-4 text-brand-500 dark:text-brand-400" />
          <h2 class="text-sm font-medium text-gray-900 dark:text-white">قابلیت‌های کالا</h2>
        </div>
        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="flag in STORE_FLAG_ROWS" :key="flag.key" class="flex items-center gap-4 px-4 sm:px-6 py-4">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ flag.label }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ flag.help }}</p>
            </div>
            <USwitch
              v-model="draft[flag.key]"
              size="lg"
              :disabled="saving"
              :aria-label="flag.label"
              :ui="SWITCH_UI"
            />
          </div>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            سایر امکانات سایت (سبد خرید، کیف پول و غیره) در «تنظیمات عمومی» است.
          </p>
          <UButton color="primary" :loading="saving" :disabled="saving || !dirty" @click="onSaveClick">
            ذخیره نوع فروشگاه
          </UButton>
        </div>
      </UCard>
    </template>

    <PanelConfirmDialog
      v-model:open="confirmOpen"
      title="تغییر نوع فروشگاه"
      message="این تغییر کل فروشگاه را تغییر می‌دهد"
      confirm-label="تغییر نوع فروشگاه"
      :loading="saving"
      @confirm="save"
    />
  </div>
</template>

<script setup>
// Store type of this tenant. A type change asks first; a save reloads the shared store profile.
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import SettingsTabs from '@/components/panel/settings/SettingsTabs.vue'
import { apiErrorMessage, errorStatus } from '~/utils/apiError.js'
import { STORE_FLAG_ROWS, STORE_TYPE_META, STORE_TYPE_ORDER } from '~/utils/settingsMeta.js'
import { useStoreProfile } from '@/composables/useStoreProfile.js'

useHead({ title: 'نوع فروشگاه | تنظیمات فروشگاه' })

const app = useNuxtApp()
const toast = useAppToast()
const { refresh: refreshStoreProfile } = useStoreProfile()

// Brand teal switch (DESIGN_SYSTEM "USwitch"): never color="teal"
const SWITCH_UI = {
  base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
}

const FLAG_KEYS = STORE_FLAG_ROWS.map((flag) => flag.key)

// Card summary: the flags the type's template turns on
const FLAG_NAMES = { batchRequired: 'بچ', expiryRequired: 'انقضا', prescriptionEnabled: 'نسخه', variantsEnabled: 'تنوع کالا' }
const storeTypes = STORE_TYPE_ORDER.map((value) => {
  const meta = STORE_TYPE_META[value]
  const on = FLAG_KEYS.filter((key) => meta[key]).map((key) => FLAG_NAMES[key])
  return { value, label: meta.label, summary: on.length ? on.join('، ') : 'بدون قابلیت ویژه' }
})

const emptyDraft = () => ({
  storeType: 'GENERAL',
  batchRequired: false,
  expiryRequired: false,
  prescriptionEnabled: false,
  variantsEnabled: false,
})

const saved = ref(emptyDraft())
const draft = reactive(emptyDraft())
const loading = ref(true)
const error = ref(false)
const forbidden = ref(false)
const saving = ref(false)
const confirmOpen = ref(false)

const dirty = computed(
  () => draft.storeType !== saved.value.storeType || FLAG_KEYS.some((key) => draft[key] !== saved.value[key])
)

const applyProfile = (profile) => {
  const next = {
    storeType: profile?.storeType ?? 'GENERAL',
    batchRequired: Boolean(profile?.batchRequired),
    expiryRequired: Boolean(profile?.expiryRequired),
    prescriptionEnabled: Boolean(profile?.prescriptionEnabled),
    variantsEnabled: Boolean(profile?.variantsEnabled),
  }
  saved.value = { ...next }
  Object.assign(draft, next)
}

// Picking a type prefills the four switches with its template defaults; each switch can still be changed after.
const selectType = (value) => {
  draft.storeType = value
  const meta = STORE_TYPE_META[value]
  for (const key of FLAG_KEYS) draft[key] = Boolean(meta[key])
}

const load = async () => {
  loading.value = true
  error.value = false
  forbidden.value = false
  try {
    const res = await app.$api.storefront.getStoreProfile()
    applyProfile(res.data.data)
  } catch (e) {
    if (errorStatus(e) === 403) forbidden.value = true
    else error.value = true
  } finally {
    loading.value = false
  }
}

// A type change asks first (it changes the whole store); a flag-only change saves straight away.
const onSaveClick = () => {
  if (draft.storeType !== saved.value.storeType) confirmOpen.value = true
  else save()
}

// All five fields go out together, as the endpoint expects
const save = async () => {
  saving.value = true
  try {
    const res = await app.$api.storeSettings.saveStoreProfile({
      data: {
        storeType: draft.storeType,
        batchRequired: draft.batchRequired,
        expiryRequired: draft.expiryRequired,
        prescriptionEnabled: draft.prescriptionEnabled,
        variantsEnabled: draft.variantsEnabled,
      },
    })
    applyProfile(res.data.data)
    confirmOpen.value = false
    toast.success('نوع فروشگاه ذخیره شد')
    await refreshStoreProfile()
  } catch (e) {
    toast.error(apiErrorMessage(e, 'ذخیره نوع فروشگاه ناموفق بود'))
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
