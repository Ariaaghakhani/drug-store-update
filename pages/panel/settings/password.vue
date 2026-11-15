<!-- pages/panel/settings/password.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader icon="i-heroicons-key" title="سیاست" accent="رمز عبور" subtitle="قواعد رمز عبور کاربران این فروشگاه" />

    <SettingsTabs />

    <UCard :ui="{ body: 'p-0' }">
      <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <UIcon name="i-heroicons-key" class="w-4 h-4 text-brand-500 dark:text-brand-400" />
        <h2 class="text-sm font-medium text-gray-900 dark:text-white">قواعد رمز عبور</h2>
      </div>

      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-40" />
                <USkeleton class="h-3 w-56" />
              </div>
              <USkeleton class="h-9 w-32 rounded-lg" />
            </div>
          </div>

          <PanelEmptyState
            v-else-if="forbidden"
            key="forbidden"
            variant="forbidden"
            title="دسترسی به سیاست رمز عبور ندارید"
          />

          <PanelEmptyState
            v-else-if="error"
            key="error"
            variant="error"
            title="دریافت سیاست رمز عبور ناموفق بود"
          >
            <template #action>
              <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
                تلاش دوباره
              </UButton>
            </template>
          </PanelEmptyState>

          <div v-else key="content">
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div class="flex flex-col gap-3 md:flex-row md:items-start md:gap-6 px-4 sm:px-6 py-4">
                <div class="flex-1 min-w-0 space-y-1">
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">حداقل طول رمز</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    بین {{ toFa(minLengthFloor) }} تا {{ toFa(MAX_LENGTH_LIMIT) }} کاراکتر
                  </p>
                  <div v-if="platformMinimum?.minLength" class="pt-1">
                    <StatusBadge :meta="PLATFORM_BADGE" />
                  </div>
                </div>
                <UFormField :error="minLengthError || undefined" class="w-full md:w-40 flex-shrink-0">
                  <UInput
                    v-model="minLengthText"
                    inputmode="numeric"
                    dir="ltr"
                    aria-label="حداقل طول رمز"
                    :disabled="saving"
                    class="w-full"
                    @input="minLengthError = ''"
                  />
                </UFormField>
              </div>

              <div class="flex items-center gap-4 px-4 sm:px-6 py-4">
                <div class="flex-1 min-w-0 space-y-1">
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">حداکثر طول رمز</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">ثابت است و قابل تغییر نیست</p>
                </div>
                <p class="text-sm font-semibold text-gray-900 dark:text-white flex-shrink-0">
                  {{ toFa(policy.maxLength) }}
                </p>
              </div>

              <div v-for="rule in RULES" :key="rule.key" class="flex items-center gap-4 px-4 sm:px-6 py-4">
                <div class="flex-1 min-w-0 space-y-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ rule.label }}</p>
                    <StatusBadge v-if="isLocked(rule.key)" :meta="PLATFORM_BADGE" />
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ rule.help }}</p>
                </div>
                <USwitch
                  v-model="rules[rule.key]"
                  size="lg"
                  :disabled="saving || isLocked(rule.key)"
                  :aria-label="rule.label"
                  :ui="SWITCH_UI"
                  class="flex-shrink-0"
                />
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                فروشگاه نمی‌تواند از حداقل پلتفرم ضعیف‌تر باشد؛ قاعده‌ای که پلتفرم الزام کرده قفل است.
              </p>
              <UButton color="primary" :loading="saving" :disabled="saving" @click="save">
                ذخیره سیاست رمز
              </UButton>
            </div>
          </div>
        </Transition>
      </div>
    </UCard>
  </div>
</template>

<script setup>
// Password policy of this store. The platform minimum is the floor: its rules stay on and its length caps the form.
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import SettingsTabs from '@/components/panel/settings/SettingsTabs.vue'
import { apiErrorMessage, errorStatus } from '~/utils/apiError.js'
import { toLatinDigits } from '~/utils/jalali.js'

useHead({ title: 'سیاست رمز عبور | تنظیمات فروشگاه' })

const app = useNuxtApp()
const toast = useAppToast()

// BACK PasswordPolicyUpdateDTO: minLength 6..64
const HARD_MIN_LENGTH = 6
const MAX_LENGTH_LIMIT = 64

// Brand teal switch (DESIGN_SYSTEM "USwitch"): never color="teal"
const SWITCH_UI = {
  base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
}
const PLATFORM_BADGE = { label: 'الزام پلتفرم', color: 'info' }

const RULES = [
  { key: 'requireUppercase', label: 'حرف بزرگ انگلیسی', help: 'حداقل یک حرف بزرگ (A–Z)' },
  { key: 'requireLowercase', label: 'حرف کوچک انگلیسی', help: 'حداقل یک حرف کوچک (a–z)' },
  { key: 'requireDigit', label: 'عدد', help: 'حداقل یک رقم' },
  { key: 'requireSpecialChar', label: 'نماد خاص', help: 'مثل ! ? # @ و غیره؛ حرف و عدد حساب نمی‌شود' },
]

const toFa = (n) => Number(n ?? 0).toLocaleString('fa-IR')

const policy = ref({ minLength: HARD_MIN_LENGTH, maxLength: 0, requireUppercase: false, requireLowercase: false, requireDigit: false, requireSpecialChar: false })
const platformMinimum = ref(null)
const minLengthText = ref('')
const minLengthError = ref('')
const rules = reactive({ requireUppercase: false, requireLowercase: false, requireDigit: false, requireSpecialChar: false })
const loading = ref(true)
const error = ref(false)
const forbidden = ref(false)
const saving = ref(false)

// The store can not go below the platform minimum, and never below the hard floor of 6
const minLengthFloor = computed(() => Math.max(HARD_MIN_LENGTH, platformMinimum.value?.minLength ?? 0))

const isLocked = (key) => Boolean(platformMinimum.value?.[key])

const applyPolicy = (data) => {
  policy.value = data?.policy ?? policy.value
  platformMinimum.value = data?.platformMinimum ?? null
  minLengthText.value = String(policy.value.minLength ?? minLengthFloor.value)
  minLengthError.value = ''
  for (const rule of RULES) rules[rule.key] = Boolean(policy.value[rule.key])
}

const load = async () => {
  loading.value = true
  error.value = false
  forbidden.value = false
  try {
    const res = await app.$api.storeSettings.getPasswordPolicyAdmin()
    applyPolicy(res.data.data)
  } catch (e) {
    if (errorStatus(e) === 403) forbidden.value = true
    else error.value = true
  } finally {
    loading.value = false
  }
}

// Whole number within the allowed range, or null (the error text goes under the field)
const readMinLength = () => {
  const digits = toLatinDigits(minLengthText.value).trim()
  if (!/^\d+$/.test(digits)) {
    minLengthError.value = 'فقط عدد وارد کنید'
    return null
  }
  const value = Number(digits)
  if (value < minLengthFloor.value || value > MAX_LENGTH_LIMIT) {
    minLengthError.value = `عدد باید بین ${toFa(minLengthFloor.value)} و ${toFa(MAX_LENGTH_LIMIT)} باشد`
    return null
  }
  return value
}

const save = async () => {
  const minLength = readMinLength()
  if (minLength === null) return
  saving.value = true
  try {
    const res = await app.$api.storeSettings.savePasswordPolicy({
      data: {
        minLength,
        // A platform-required rule is always sent on
        requireUppercase: rules.requireUppercase || isLocked('requireUppercase'),
        requireLowercase: rules.requireLowercase || isLocked('requireLowercase'),
        requireDigit: rules.requireDigit || isLocked('requireDigit'),
        requireSpecialChar: rules.requireSpecialChar || isLocked('requireSpecialChar'),
      },
    })
    applyPolicy(res.data.data)
    // The public registration and password rules read this cached policy; drop it so they fetch again
    useState('password-policy', () => null).value = null
    toast.success('سیاست رمز عبور ذخیره شد')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'ذخیره سیاست رمز ناموفق بود'))
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
