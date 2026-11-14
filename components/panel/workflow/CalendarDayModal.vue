<!-- components/panel/workflow/CalendarDayModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    title="افزودن روز خاص"
    icon="i-heroicons-calendar-days"
    submit-label="افزودن"
    :loading="saving"
    :submit-disabled="!date"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <JalaliDateInput v-model="date" label="تاریخ" />

    <UFormField label="نوع روز" required>
      <URadioGroup v-model="type" :items="TYPE_ITEMS" value-key="value" orientation="vertical" />
    </UFormField>

    <UFormField label="عنوان" :help="`اختیاری، تا ${MAX_TITLE.toLocaleString('fa-IR')} نویسه`">
      <UInput v-model="title" :maxlength="MAX_TITLE" class="w-full" />
    </UFormField>
  </PanelFormModal>
</template>

<script setup>
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import JalaliDateInput from '@/components/panel/JalaliDateInput.vue'
import { apiErrorMessage } from '~/utils/apiError.js'
import { DAY_TYPE_META } from '~/utils/workflowMeta.js'

// Adds one special day to the store calendar (BACK module WORKFLOW_CALENDAR). Emits `update:open` and `done(day)`.
// A create request takes only CLOSED or WORKING (OFFICIAL_HOLIDAY is platform-only); one row per date, so a second one is a 409.
const MAX_TITLE = 200
const TYPE_ITEMS = [
  { value: 'CLOSED', label: DAY_TYPE_META.CLOSED.label, description: 'فروشگاه در این روز کار نمی‌کند و روز کاری حساب نمی‌شود' },
  { value: 'WORKING', label: DAY_TYPE_META.WORKING.label, description: 'روزی که طبق هفته‌ی کاری یا تعطیلات رسمی تعطیل است، این بار کاری حساب می‌شود' },
]

const props = defineProps({
  open: { type: Boolean, required: true },
})
const emit = defineEmits(['update:open', 'done'])

const app = useNuxtApp()
const toast = useAppToast()

const date = ref('')
const type = ref('CLOSED')
const title = ref('')
const saving = ref(false)
const serverError = ref('')

// Every open starts with an empty form
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    date.value = ''
    type.value = 'CLOSED'
    title.value = ''
    serverError.value = ''
  },
  { immediate: true }
)

async function submit() {
  if (saving.value || !date.value) return
  saving.value = true
  serverError.value = ''
  try {
    const data = { date: date.value, type: type.value }
    if (title.value.trim()) data.title = title.value.trim()
    const res = await app.$api.workflow.addCalendarDay({ data })
    toast.success('روز به تقویم اضافه شد')
    emit('done', res.data.data)
    emit('update:open', false)
  } catch (e) {
    // 409 `workflow.calendar.day.exists` (the date already has a row) stays in the modal
    serverError.value = apiErrorMessage(e, 'افزودن روز ناموفق بود')
  } finally {
    saving.value = false
  }
}
</script>
