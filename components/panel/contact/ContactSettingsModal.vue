<!-- components/panel/contact/ContactSettingsModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    title="تنظیمات اطلاع‌رسانی"
    icon="i-heroicons-bell-alert"
    submit-label="ذخیره"
    width="lg"
    :loading="saving"
    :submit-disabled="loadingPhones || Boolean(loadError)"
    @update:open="emit('update:open', $event)"
    @submit="save"
  >
    <p class="text-sm text-gray-600 dark:text-gray-300 leading-6">
      برای هر پیام تازه‌ی فرم تماس، پیامکی به این شماره‌ها ارسال می‌شود. فهرست خالی یعنی پیامکی ارسال نمی‌شود.
    </p>

    <div v-if="loadingPhones" class="flex flex-wrap gap-2">
      <USkeleton class="h-7 w-32 rounded-full" />
      <USkeleton class="h-7 w-32 rounded-full" />
    </div>

    <p v-else-if="loadError" class="text-sm text-error" role="alert">{{ loadError }}</p>

    <template v-else>
      <div v-if="phones.length" class="flex flex-wrap gap-2" dir="ltr">
        <span
          v-for="phone in phones"
          :key="phone"
          class="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 ps-3 pe-1 py-1 text-sm text-gray-900 dark:text-white"
        >
          {{ phone }}
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            square
            icon="i-heroicons-x-mark"
            :disabled="saving"
            :aria-label="`حذف ${phone}`"
            @click="removePhone(phone)"
          />
        </span>
      </div>
      <p v-else class="text-sm text-gray-500 dark:text-gray-400">هیچ شماره‌ای ثبت نشده است</p>

      <UFormField
        label="افزودن شماره موبایل"
        :error="draftError || undefined"
        :help="atLimit ? `حداکثر ${MAX_PHONES} شماره` : `حداکثر ${MAX_PHONES} شماره، مثال ۰۹۱۲۱۲۳۴۵۶۷`"
      >
        <div class="flex items-center gap-2">
          <UInput
            v-model="draft"
            inputmode="numeric"
            dir="ltr"
            autocomplete="off"
            placeholder="09xxxxxxxxx"
            :disabled="atLimit || saving"
            class="w-full"
            @keydown.enter.prevent="addPhone"
          />
          <UButton
            color="neutral"
            variant="soft"
            icon="i-heroicons-plus"
            :disabled="atLimit || saving || !draft.trim()"
            @click="addPhone"
          >
            افزودن
          </UButton>
        </div>
      </UFormField>
    </template>
  </PanelFormModal>
</template>

<script setup>
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import { apiErrorMessage, isPending } from '~/utils/apiError.js'
import { normalizeNotifyPhone } from '~/utils/contactMeta.js'

// Which mobiles get an SMS for each new contact message. Loads its own list on every open; the page only hears `saved`.
const props = defineProps({
  open: { type: Boolean, required: true },
})

const emit = defineEmits(['update:open', 'saved'])

const app = useNuxtApp()
const toast = useAppToast()

const MAX_PHONES = 5

const phones = ref([])
const loadingPhones = ref(false)
const loadError = ref('')
const draft = ref('')
const draftError = ref('')
const saving = ref(false)

const atLimit = computed(() => phones.value.length >= MAX_PHONES)

const loadPhones = async () => {
  loadingPhones.value = true
  loadError.value = ''
  try {
    const res = await app.$api.contentAdmin.getContactSettings()
    phones.value = [...(res.data.data?.phones ?? [])]
  } catch (e) {
    phones.value = []
    loadError.value = apiErrorMessage(e, 'دریافت تنظیمات ناموفق بود')
  } finally {
    loadingPhones.value = false
  }
}

// Every open starts from the stored list with an empty draft
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    draft.value = ''
    draftError.value = ''
    loadPhones()
  }
)

// Enter in the field adds the number; it must not submit the form
const addPhone = () => {
  if (atLimit.value || saving.value) return
  const phone = normalizeNotifyPhone(draft.value)
  if (!phone) {
    draftError.value = 'شماره موبایل معتبر نیست'
    return
  }
  if (phones.value.includes(phone)) {
    draftError.value = 'این شماره قبلاً افزوده شده است'
    return
  }
  phones.value = [...phones.value, phone]
  draft.value = ''
  draftError.value = ''
}

const removePhone = (phone) => {
  phones.value = phones.value.filter((item) => item !== phone)
}

const save = async () => {
  if (saving.value || loadingPhones.value) return
  // A number typed but not added yet is added on save, so the button and the list never disagree
  if (draft.value.trim()) {
    const typed = normalizeNotifyPhone(draft.value)
    if (!typed) {
      draftError.value = 'شماره موبایل معتبر نیست'
      return
    }
    if (atLimit.value) {
      draftError.value = `حداکثر ${MAX_PHONES} شماره`
      return
    }
    if (phones.value.includes(typed)) {
      draftError.value = 'این شماره قبلاً افزوده شده است'
      return
    }
    phones.value = [...phones.value, typed]
    draft.value = ''
  }
  saving.value = true
  try {
    const res = await app.$api.contentAdmin.saveContactSettings({ data: { phones: phones.value } })
    if (isPending(res)) return emit('update:open', false)
    toast.success('تنظیمات اطلاع‌رسانی ذخیره شد')
    emit('saved', res.data.data?.phones ?? [])
    emit('update:open', false)
  } catch (e) {
    toast.error(apiErrorMessage(e, 'ذخیره تنظیمات ناموفق بود'))
  } finally {
    saving.value = false
  }
}
</script>
