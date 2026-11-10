<!-- components/panel/settings/SettingField.vue -->
<template>
  <div class="flex flex-col gap-3 md:flex-row md:items-start md:gap-6 px-4 sm:px-6 py-4">
    <div class="min-w-0 flex-1 space-y-1">
      <div class="flex flex-wrap items-center gap-2">
        <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ setting.label }}</p>
        <StatusBadge :meta="sourceMeta" />
      </div>
      <p dir="ltr" class="text-xs text-start text-gray-500 dark:text-gray-400 font-mono break-all">{{ setting.key }}</p>
    </div>

    <div class="w-full md:w-80 flex-shrink-0 space-y-2">
      <!-- Switch and choice save as soon as they change -->
      <div v-if="setting.type === 'BOOLEAN'" class="flex justify-end md:justify-start">
        <USwitch
          :model-value="draft === 'true'"
          size="lg"
          :disabled="busy"
          :aria-label="setting.label"
          :ui="SWITCH_UI"
          @update:model-value="saveNow($event ? 'true' : 'false')"
        />
      </div>

      <USelect
        v-else-if="setting.type === 'CHOICE'"
        :model-value="draft"
        :items="choiceItems"
        :disabled="busy"
        :aria-label="setting.label"
        class="w-full"
        @update:model-value="saveNow($event)"
      />

      <template v-else>
        <UFormField :error="error || undefined" :help="help || undefined">
          <UTextarea
            v-if="setting.type === 'TEXT'"
            v-model="draft"
            :rows="2"
            :maxlength="setting.max || undefined"
            :disabled="busy"
            :aria-label="setting.label"
            class="w-full"
          />
          <UInput
            v-else
            v-model="draft"
            dir="ltr"
            :inputmode="INPUT_MODE[setting.type]"
            :disabled="busy"
            :aria-label="setting.label"
            :placeholder="PLACEHOLDER[setting.type]"
            autocomplete="off"
            class="w-full"
            @keydown.enter.prevent="saveDraft"
          />
        </UFormField>

        <div v-if="dirty" class="flex justify-end md:justify-start">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            :loading="busy"
            :disabled="busy"
            @click="saveDraft"
          >
            ذخیره
          </UButton>
        </div>
      </template>

      <div v-if="canReset" class="flex justify-end md:justify-start">
        <UButton
          color="neutral"
          variant="soft"
          size="sm"
          icon="i-heroicons-arrow-uturn-left"
          :loading="resetting"
          :disabled="busy"
          @click="resetOwn"
        >
          بازگشت به پیش‌فرض
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
// One editable setting: label, key, source badge and the control for its TYPE. Saves through
// `$api.storeSettings`; the parent gets the saved row (`saved`) and replaces it in its list.
import StatusBadge from '@/components/panel/StatusBadge.vue'
import { apiErrorMessage } from '~/utils/apiError.js'
import { SOURCE_META, settingHelp, validateSettingValue } from '~/utils/settingsMeta.js'

const props = defineProps({
  setting: { type: Object, required: true },
})

const emit = defineEmits(['saved'])

const app = useNuxtApp()
const toast = useAppToast()

// Brand teal switch (DESIGN_SYSTEM "USwitch"): never color="teal"
const SWITCH_UI = {
  base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
}

const INPUT_MODE = { INTEGER: 'numeric', CARD_NUMBER: 'numeric', MOBILE_LIST: 'tel', URL: 'url' }
const PLACEHOLDER = { CARD_NUMBER: '۱۶ رقم', MOBILE_LIST: '09121234567، 09357654321', URL: 'https://' }

const draft = ref('')
const error = ref('')
const busy = ref(false)
const resetting = ref(false)

// Keeps the draft in step with the stored value (after a save, a reset, or when the parent swaps the row)
const syncDraft = () => {
  draft.value = props.setting.value ?? ''
  error.value = ''
}
watch(() => props.setting, syncDraft, { immediate: true, deep: true })

const sourceMeta = computed(() => SOURCE_META[props.setting.source] ?? SOURCE_META.DEFAULT)
const help = computed(() => settingHelp(props.setting))
const dirty = computed(() => draft.value !== (props.setting.value ?? ''))
const canReset = computed(() => props.setting.ownValue != null)
const choiceItems = computed(() => (props.setting.choices ?? []).map((choice) => ({ label: choice, value: choice })))

// Sends one value and hands the saved row to the parent. A BACK error is toasted and the draft stays as typed.
const send = async (value) => {
  busy.value = true
  try {
    const res = await app.$api.storeSettings.updateSetting({ data: { key: props.setting.key, value } })
    error.value = ''
    emit('saved', res.data.data)
    toast.success('تنظیم ذخیره شد')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'ذخیره تنظیم ناموفق بود'))
  } finally {
    busy.value = false
  }
}

const saveNow = (value) => send(value)

const saveDraft = () => {
  if (busy.value || !dirty.value) return
  const checked = validateSettingValue(props.setting, draft.value)
  if (checked.error) {
    error.value = checked.error
    return
  }
  send(checked.value)
}

const resetOwn = async () => {
  resetting.value = true
  busy.value = true
  try {
    const res = await app.$api.storeSettings.resetSetting({ data: { key: props.setting.key } })
    error.value = ''
    emit('saved', res.data.data)
    toast.success('تنظیم به پیش‌فرض برگشت')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'بازگشت به پیش‌فرض ناموفق بود'))
  } finally {
    resetting.value = false
    busy.value = false
  }
}
</script>
