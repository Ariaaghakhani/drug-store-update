<!-- components/panel/workflow/CustomEventModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    title="رویداد جدید"
    icon="i-heroicons-bolt"
    submit-label="افزودن"
    :loading="saving"
    :submit-disabled="!canSubmit"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <UFormField label="موجودیت" required>
      <USelect
        v-if="subjects.length"
        v-model="subject"
        :items="subjectItems"
        placeholder="انتخاب موجودیت"
        class="w-full"
      />
      <!-- The catalog could not be loaded: the subject code is typed (e.g. PURCHASE_ORDER) -->
      <UInput v-else v-model="subject" dir="ltr" placeholder="PURCHASE_ORDER" autocomplete="off" class="w-full" />
    </UFormField>

    <UFormField label="کد رویداد" required :help="CODE_HINT" :error="codeError || undefined">
      <UInput
        :model-value="code"
        dir="ltr"
        autocomplete="off"
        placeholder="SUPPLIER_APPROVED"
        :maxlength="CODE_MAX"
        class="w-full"
        @update:model-value="onCode"
      />
    </UFormField>

    <UFormField label="عنوان" required :help="`تا ${TITLE_MAX.toLocaleString('fa-IR')} نویسه`">
      <UInput v-model="title" :maxlength="TITLE_MAX" class="w-full" />
    </UFormField>
  </PanelFormModal>
</template>

<script setup>
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import { apiErrorMessage } from '~/utils/apiError.js'
import { toLatinDigits } from '~/utils/jalali.js'

// Defines a custom event of the store for one subject (BACK module WORKFLOW_DESIGN). Emits `update:open` and `done(event)`.
// `code` follows BACK's exact pattern; BACK trims and upper-cases it, so it is upper-cased here as the user types.
// A code that already exists for the subject (built in or custom: both are in the subject's `events`) is refused before sending.
const CODE_PATTERN = /^[A-Z][A-Z0-9_]{1,49}$/
const CODE_MAX = 50
const TITLE_MAX = 200
const CODE_HINT = `با حرف انگلیسی شروع شود؛ فقط حرف بزرگ انگلیسی، رقم و _ (${(2).toLocaleString('fa-IR')} تا ${CODE_MAX.toLocaleString('fa-IR')} نویسه)`

const props = defineProps({
  open: { type: Boolean, required: true },
  // WorkflowSubjectDTO[] ({code, title, events[]}); empty when the catalog could not be loaded
  subjects: { type: Array, default: () => [] },
  // Subject code to start on (the group the «افزودن» came from), or ''
  initialSubject: { type: String, default: '' },
})
const emit = defineEmits(['update:open', 'done'])

const app = useNuxtApp()
const toast = useAppToast()

const subject = ref('')
const code = ref('')
const title = ref('')
const saving = ref(false)
const serverError = ref('')

const subjectItems = computed(() =>
  props.subjects.map((item) => ({ value: item.code, label: item.title || item.code }))
)

// Persian digits are converted, letters upper-cased
const onCode = (value) => {
  code.value = toLatinDigits(value).toUpperCase().trim()
}

const existingCodes = computed(() => {
  const found = props.subjects.find((item) => item.code === subject.value)
  return (found?.events ?? []).map((event) => event.code)
})

const codeError = computed(() => {
  if (!code.value) return ''
  if (!CODE_PATTERN.test(code.value)) return 'کد رویداد با الگوی گفته‌شده نمی‌خواند'
  if (existingCodes.value.includes(code.value)) return 'این رویداد برای این موجودیت از قبل وجود دارد'
  return ''
})

const canSubmit = computed(
  () => Boolean(subject.value.trim()) && CODE_PATTERN.test(code.value) && !codeError.value && Boolean(title.value.trim())
)

// Every open starts with an empty form (the subject of the group it was opened from, when there is one)
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    subject.value = props.initialSubject
    code.value = ''
    title.value = ''
    serverError.value = ''
  },
  { immediate: true }
)

async function submit() {
  if (saving.value || !canSubmit.value) return
  saving.value = true
  serverError.value = ''
  try {
    const res = await app.$api.workflow.createCustomEvent({
      data: { subject: subject.value.trim(), code: code.value, title: title.value.trim() },
    })
    toast.success('رویداد تعریف شد')
    emit('done', res.data.data)
    emit('update:open', false)
  } catch (e) {
    // 400 (bad subject, code or title) and 409 (duplicate) stay in the modal
    serverError.value = apiErrorMessage(e, 'تعریف رویداد ناموفق بود')
  } finally {
    saving.value = false
  }
}
</script>
