<!-- components/panel/workflow/DefinitionImportModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    title="ورود فرایند از JSON"
    icon="i-heroicons-arrow-up-tray"
    submit-label="ساخت پیش‌نویس"
    width="lg"
    :loading="saving"
    :submit-disabled="!canSubmit"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <p class="text-sm text-gray-600 dark:text-gray-300 leading-6">
      فایل «خروجی JSON» یک فرایند را انتخاب کنید یا متن آن را بچسبانید. فرایند همیشه به‌صورت پیش‌نویس ساخته می‌شود و چیزی منتشر نمی‌شود.
    </p>

    <div class="flex flex-wrap items-center gap-3">
      <FilePickButton label="انتخاب فایل JSON" accept=".json,application/json" :disabled="saving" @pick="onPick" />
      <span v-if="fileName" class="text-xs text-gray-500 dark:text-gray-400" dir="ltr">{{ fileName }}</span>
    </div>

    <UFormField label="یا متن JSON را بچسبانید">
      <UTextarea
        v-model="text"
        :rows="8"
        dir="ltr"
        autocomplete="off"
        spellcheck="false"
        placeholder='{ "title": "...", "subject": "...", "action": "...", "steps": [] }'
        class="w-full font-mono text-xs"
        :disabled="saving"
        @update:model-value="fileName = ''"
      />
    </UFormField>

    <!-- Everything below is plain text interpolation: the imported content is never rendered as HTML -->
    <p v-if="readError" class="text-sm text-error" role="alert">{{ readError }}</p>
    <p v-else-if="text.trim() && !parsed.ok" class="text-sm text-error" role="alert">{{ parsed.error }}</p>
    <p v-else-if="parsed.ok && catalogError" class="text-sm text-error" role="alert">{{ catalogError }}</p>

    <div v-if="parsed.ok" class="rounded-xl bg-gray-50 dark:bg-gray-800/50 px-4 py-3 space-y-2">
      <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ parsed.value.title }}</p>
      <p class="text-sm text-gray-600 dark:text-gray-300">
        {{ subjectTitle }}
        <span class="text-gray-400 dark:text-gray-500">·</span>
        {{ actionTitle }}
      </p>
      <p class="text-xs text-gray-400 dark:text-gray-500" dir="ltr">{{ parsed.value.subject }} · {{ parsed.value.action }}</p>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        {{ parsed.value.steps.length.toLocaleString('fa-IR') }} مرحله
      </p>
      <ol v-if="parsed.value.steps.length" class="space-y-1 text-xs text-gray-700 dark:text-gray-300">
        <li v-for="(step, i) in parsed.value.steps" :key="i" class="flex items-baseline gap-2">
          <span class="text-gray-400 dark:text-gray-500">{{ (i + 1).toLocaleString('fa-IR') }}.</span>
          <span class="min-w-0 truncate">{{ stepLabel(step) }}</span>
        </li>
      </ol>
    </div>

    <UAlert
      color="warning"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      description="نقش‌ها و کارمندان فایل مال فروشگاهِ دیگری هستند: بعد از ساخت، گیرنده‌ی هر مرحله را دوباره انتخاب کنید و فرایند را اعتبارسنجی کنید."
    />
  </PanelFormModal>
</template>

<script setup>
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import FilePickButton from '@/components/panel/FilePickButton.vue'
import { apiErrorMessage } from '~/utils/apiError.js'
import { IMPORT_MAX_BYTES, parseDefinitionImport } from '~/utils/workflowDefinition.js'

// Imports a definition exported with «خروجی JSON» (BACK: the same body as the create call, so the import is `createDefinition`). The text is
// parsed with `JSON.parse` only and checked by `parseDefinitionImport` (a wrong shape shows an inline error and nothing is created). The
// steps go to BACK untouched. `subjects` (catalog of listSubjects) only adds a friendlier check: when the catalog is loaded, an unknown
// subject or action is refused here instead of by BACK. Emits `update:open` and `done(definition)`.
const props = defineProps({
  open: { type: Boolean, required: true },
  subjects: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:open', 'done'])

const app = useNuxtApp()
const toast = useAppToast()

const text = ref('')
const fileName = ref('')
const readError = ref('')
const saving = ref(false)
const serverError = ref('')

const parsed = computed(() => parseDefinitionImport(text.value))

const subjectDef = computed(() =>
  parsed.value.ok ? props.subjects.find((item) => item.code === parsed.value.value.subject) : undefined
)
const subjectTitle = computed(() => subjectDef.value?.title || parsed.value.value?.subject || '—')
const actionTitle = computed(() => {
  const code = parsed.value.value?.action
  return subjectDef.value?.actions?.find((item) => item.code === code)?.title || code || '—'
})

// Only when the catalog was loaded: its absence must not block an import (BACK checks the codes anyway)
const catalogError = computed(() => {
  if (!parsed.value.ok || !props.subjects.length) return ''
  if (!subjectDef.value) return 'این موجودیت در این فروشگاه وجود ندارد'
  if (!subjectDef.value.actions?.some((item) => item.code === parsed.value.value.action)) {
    return 'این کار برای این موجودیت وجود ندارد'
  }
  return ''
})

const canSubmit = computed(() => parsed.value.ok && !catalogError.value)

// «key: title» of a step for the preview; any value is shown as text, a non-string one is skipped
const stepLabel = (step) => {
  const key = typeof step.key === 'string' ? step.key : ''
  const title = typeof step.title === 'string' ? step.title : ''
  return [title, key && `(${key})`].filter(Boolean).join(' ') || '—'
}

// A file is read as text and shown in the textarea, so what is created is always what the user sees
async function onPick(file) {
  readError.value = ''
  serverError.value = ''
  if (file.size > IMPORT_MAX_BYTES) {
    text.value = ''
    fileName.value = ''
    readError.value = 'حجم فایل بیش از یک مگابایت است'
    return
  }
  try {
    const content = await file.text()
    text.value = content
    fileName.value = file.name
  } catch {
    text.value = ''
    fileName.value = ''
    readError.value = 'خواندن فایل ناموفق بود'
  }
}

// Every open starts empty
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    text.value = ''
    fileName.value = ''
    readError.value = ''
    serverError.value = ''
  },
  { immediate: true }
)

async function submit() {
  if (saving.value || !canSubmit.value) return
  saving.value = true
  serverError.value = ''
  try {
    const res = await app.$api.workflow.createDefinition({ data: parsed.value.value })
    toast.success('پیش‌نویس فرایند از فایل ساخته شد')
    emit('done', res.data.data)
    emit('update:open', false)
  } catch (e) {
    serverError.value = apiErrorMessage(e, 'ورود فرایند ناموفق بود')
  } finally {
    saving.value = false
  }
}
</script>
