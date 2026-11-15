<!-- components/panel/pages/TermsFormModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    :title="terms ? 'ویرایش پیش‌نویس' : 'نسخه‌ی جدید قوانین'"
    icon="i-heroicons-document-text"
    submit-label="ذخیره"
    width="2xl"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UFormField label="نوع" required>
        <USelect v-model="form.type" :items="typeItems" :disabled="Boolean(terms)" class="w-full" />
      </UFormField>
      <UFormField label="شماره‌ی نسخه" required :error="errors.version" help="یکتا در هر نوع، مثل 1.0 یا 1403-07">
        <UInput v-model="form.version" :maxlength="50" dir="ltr" class="w-full" />
      </UFormField>
    </div>

    <UFormField label="عنوان" required :error="errors.title">
      <UInput v-model="form.title" :maxlength="200" class="w-full" />
    </UFormField>

    <JalaliDateInput v-model="form.effectiveDate" label="تاریخ اجرا (فقط نمایشی)" clearable />

    <UFormField label="متن (HTML)" required :error="errors.content">
      <UTextarea v-model="form.content" :rows="12" :maxlength="200000" dir="ltr" class="w-full font-mono" />
    </UFormField>

    <div v-if="previewText" class="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 space-y-1">
      <p class="text-xs font-medium text-gray-500 dark:text-gray-400">پیش‌نمایش متن</p>
      <p class="text-sm text-gray-700 dark:text-gray-300 leading-6 whitespace-pre-line">{{ previewText }}</p>
    </div>
  </PanelFormModal>
</template>

<script setup>
import JalaliDateInput from '@/components/panel/JalaliDateInput.vue'
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import { apiErrorMessage, errorStatus, isPending } from '~/utils/apiError.js'
import { selectItems } from '~/utils/enumMeta.js'
import { TERMS_TYPE_LABELS } from '~/utils/termsMeta.js'
import { htmlToText } from '~/utils/storefrontGoods.js'

// Creates a DRAFT, or saves a DRAFT's text (`terms` set). A PUBLISHED or ARCHIVED text is never edited here.
// `prefill` seeds a new version from an existing one ("نسخه‌ی جدید"): the type, title and text, with an empty version.
const props = defineProps({
  open: { type: Boolean, required: true },
  // TermsAndConditionsDTO of the draft being edited, or null for a new version
  terms: { type: Object, default: null },
  // {type, title, content} copied into a new version
  prefill: { type: Object, default: null },
})

const emit = defineEmits(['update:open', 'saved'])

const app = useNuxtApp()
const toast = useAppToast()

const typeItems = selectItems(TERMS_TYPE_LABELS)

const form = reactive({ type: 'TERMS_OF_USE', title: '', version: '', effectiveDate: '', content: '' })
const errors = ref({})
const saving = ref(false)
const previewText = computed(() => htmlToText(form.content))

// Every open starts from the draft (edit), the prefill (new version from another one), or blank
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    errors.value = {}
    const source = props.terms ?? props.prefill ?? {}
    form.type = source.type ?? 'TERMS_OF_USE'
    form.title = source.title ?? ''
    form.content = source.content ?? ''
    form.version = props.terms?.version ?? ''
    form.effectiveDate = props.terms?.effectiveDate ?? ''
  }
)

const validate = () => {
  const next = {}
  if (!form.title.trim()) next.title = 'عنوان را وارد کنید'
  else if (form.title.trim().length > 200) next.title = 'حداکثر ۲۰۰ نویسه'
  if (!form.version.trim()) next.version = 'شماره‌ی نسخه را وارد کنید'
  else if (form.version.trim().length > 50) next.version = 'حداکثر ۵۰ نویسه'
  if (!form.content.trim()) next.content = 'متن را وارد کنید'
  errors.value = next
  return Object.keys(next).length === 0
}

const save = async () => {
  if (saving.value || !validate()) return
  const body = {
    type: form.type,
    title: form.title.trim(),
    version: form.version.trim(),
    content: form.content.trim(),
    effectiveDate: form.effectiveDate || null,
  }
  saving.value = true
  try {
    const res = props.terms
      ? await app.$api.contentAdmin.updateTerms(props.terms.id, { data: body })
      : await app.$api.contentAdmin.createTerms({ data: body })
    if (isPending(res)) return emit('saved', null)
    toast.success(props.terms ? 'پیش‌نویس ذخیره شد' : 'پیش‌نویس ساخته شد')
    emit('saved', res.data.data)
    emit('update:open', false)
  } catch (e) {
    // A version number already used for this type is 409 on create: shown under the field, the modal stays open
    if (errorStatus(e) === 409 && !props.terms) {
      errors.value = { ...errors.value, version: apiErrorMessage(e, 'این شماره‌ی نسخه برای این نوع ثبت شده است') }
    } else {
      toast.error(apiErrorMessage(e, 'ذخیره‌ی قوانین ناموفق بود'))
    }
  } finally {
    saving.value = false
  }
}
</script>
