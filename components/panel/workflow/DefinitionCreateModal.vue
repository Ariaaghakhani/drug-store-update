<!-- components/panel/workflow/DefinitionCreateModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    title="فرایند جدید"
    icon="i-heroicons-plus-circle"
    submit-label="ساخت و ویرایش"
    :loading="saving"
    :submit-disabled="!canSubmit"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <p
      v-if="!subjectItems.length"
      class="text-sm text-gray-600 dark:text-gray-300 leading-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 px-4 py-3"
    >
      فهرست موجودیت‌ها دریافت نشد، بنابراین فرایند تازه ساخته نمی‌شود. صفحه را به‌روز کنید و دوباره تلاش کنید.
    </p>

    <UFormField label="عنوان فرایند" required :help="`تا ${MAX_DEFINITION_TITLE.toLocaleString('fa-IR')} نویسه`">
      <UInput v-model="title" :maxlength="MAX_DEFINITION_TITLE" autocomplete="off" class="w-full" />
    </UFormField>

    <UFormField label="موجودیت" required>
      <USelect v-model="subject" :items="subjectItems" placeholder="انتخاب موجودیت" class="w-full" />
    </UFormField>

    <UFormField label="کار" required help="موجودیت و کار بعد از ساخت فرایند عوض نمی‌شوند">
      <USelect
        v-model="action"
        :items="actionItems"
        :disabled="!subject"
        placeholder="انتخاب کار"
        class="w-full"
      />
    </UFormField>
  </PanelFormModal>
</template>

<script setup>
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import { apiErrorMessage } from '~/utils/apiError.js'
import { MAX_DEFINITION_TITLE } from '~/utils/workflowDefinition.js'

// Creates an empty draft (`steps: []`) for one action of one subject (BACK module WORKFLOW_DESIGN) and hands it back with `done(definition)`;
// the page then opens the editor. `subjects` is the catalog of `listSubjects()` (`{code, title, actions[{code, title}]}`), loaded by the page.
// BACK answers 400 for an unknown subject or action; that stays inline.
const props = defineProps({
  open: { type: Boolean, required: true },
  subjects: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:open', 'done'])

const app = useNuxtApp()
const toast = useAppToast()

const title = ref('')
const subject = ref('')
const action = ref('')
const saving = ref(false)
const serverError = ref('')

// A subject with no action cannot start a process, so it is not offered
const subjectItems = computed(() =>
  props.subjects
    .filter((item) => item.actions?.length)
    .map((item) => ({ value: item.code, label: item.title || item.code }))
)
const actionItems = computed(() => {
  const found = props.subjects.find((item) => item.code === subject.value)
  return (found?.actions ?? []).map((item) => ({ value: item.code, label: item.title || item.code }))
})

// A new subject clears the action (the old one belongs to the old subject)
watch(subject, () => {
  action.value = ''
})

const canSubmit = computed(() => Boolean(title.value.trim()) && Boolean(subject.value) && Boolean(action.value))

// Every open starts with an empty form
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    title.value = ''
    subject.value = ''
    action.value = ''
    serverError.value = ''
  },
  { immediate: true }
)

async function submit() {
  if (saving.value || !canSubmit.value) return
  saving.value = true
  serverError.value = ''
  try {
    const res = await app.$api.workflow.createDefinition({
      data: { title: title.value.trim(), subject: subject.value, action: action.value, steps: [] },
    })
    toast.success('پیش‌نویس فرایند ساخته شد')
    emit('done', res.data.data)
    emit('update:open', false)
  } catch (e) {
    serverError.value = apiErrorMessage(e, 'ساخت فرایند ناموفق بود')
  } finally {
    saving.value = false
  }
}
</script>
