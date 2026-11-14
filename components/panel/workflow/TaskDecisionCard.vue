<!-- components/panel/workflow/TaskDecisionCard.vue -->
<template>
  <UCard>
    <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-4">تصمیم شما</h4>

    <form class="space-y-4" @submit.prevent="submit">
      <UFormField label="تصمیم" required>
        <URadioGroup v-model="decision" :items="DECISION_ITEMS" orientation="horizontal" :disabled="busy" />
      </UFormField>

      <UFormField
        label="توضیح"
        :required="commentRequired"
        :error="commentError || undefined"
        :help="`${comment.length.toLocaleString('fa-IR')} از ${MAX_COMMENT.toLocaleString('fa-IR')} کاراکتر`"
      >
        <UTextarea v-model="comment" :rows="3" :maxlength="MAX_COMMENT" class="w-full" :disabled="busy" />
      </UFormField>

      <!-- Files belong to the whole run; the step decides if they are off, optional or required for «تأیید» -->
      <div v-if="attachments !== 'NONE'" class="space-y-2">
        <div class="flex items-center gap-3 flex-wrap">
          <FilePickButton
            label="پیوست فایل"
            icon="i-heroicons-paper-clip"
            multiple
            :loading="uploading"
            :disabled="busy"
            @pick="uploadFiles"
          />
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ fileCount.toLocaleString('fa-IR') }} فایل روی این کار پیوست شده است
          </span>
        </div>
        <p v-if="attachmentMissing" class="text-xs text-warning" role="status">
          برای تأیید دست‌کم یک فایل پیوست کنید
        </p>
      </div>

      <div class="flex justify-end">
        <UButton
          type="submit"
          :color="SUBMIT_COLORS[decision]"
          icon="i-heroicons-check-circle"
          :loading="submitting"
          :disabled="busy || attachmentMissing"
        >
          ثبت تصمیم
        </UButton>
      </div>
    </form>
  </UCard>
</template>

<script setup>
import FilePickButton from '@/components/panel/FilePickButton.vue'
import { apiErrorMessage } from '~/utils/apiError.js'
import { DECISION_META } from '~/utils/workflowMeta.js'

// Decision form of one open task: approve / reject / return with a comment, plus file attachments unless the step turned
// them off. Files upload as soon as they are picked (one request per file) and count toward «attachedFiles»; a step that
// requires files blocks «تأیید» until one exists. Emits `decided(WorkflowInstanceDTO)` after BACK accepted the decision;
// the page decides what happens next. Errors toast BACK's translated message and keep the form as it was.
const MAX_COMMENT = 1000

const props = defineProps({
  taskId: { type: String, required: true },
  // BACK's step setting from the task detail: NONE | OPTIONAL | REQUIRED
  attachments: { type: String, default: 'OPTIONAL' },
  attachedFiles: { type: Number, default: 0 },
})
const emit = defineEmits(['decided'])

const app = useNuxtApp()
const toast = useAppToast()

const DECISION_ITEMS = ['APPROVE', 'REJECT', 'RETURN'].map((value) => ({
  value,
  label: DECISION_META[value].label,
}))
const SUBMIT_COLORS = { APPROVE: 'primary', REJECT: 'error', RETURN: 'warning' }

const decision = ref('APPROVE')
const comment = ref('')
const commentError = ref('')
const submitting = ref(false)
const uploading = ref(false)
const fileCount = ref(props.attachedFiles)

watch(
  () => props.attachedFiles,
  (value) => {
    fileCount.value = value
  }
)

const busy = computed(() => submitting.value || uploading.value)
const commentRequired = computed(() => decision.value !== 'APPROVE')
const attachmentMissing = computed(
  () => props.attachments === 'REQUIRED' && decision.value === 'APPROVE' && fileCount.value === 0
)

watch(decision, () => {
  commentError.value = ''
})

async function uploadFiles(files) {
  if (busy.value) return
  uploading.value = true
  let added = 0
  try {
    for (const file of files) {
      try {
        const body = new FormData()
        body.append('file', file)
        await app.$api.workflow.attachToTask(props.taskId, { data: body })
        added += 1
        fileCount.value += 1
      } catch (e) {
        toast.error(apiErrorMessage(e, `پیوست «${file.name}» ناموفق بود`))
      }
    }
  } finally {
    uploading.value = false
  }
  if (added) toast.success(`${added.toLocaleString('fa-IR')} فایل پیوست شد`)
}

async function submit() {
  if (busy.value || attachmentMissing.value) return
  const text = comment.value.trim()
  if (commentRequired.value && !text) {
    commentError.value = 'برای رد یا برگشت، توضیح لازم است'
    return
  }
  commentError.value = ''
  submitting.value = true
  try {
    const res = await app.$api.workflow.decideTask(props.taskId, {
      data: { decision: decision.value, comment: text || undefined },
    })
    emit('decided', res.data.data)
  } catch (e) {
    toast.error(apiErrorMessage(e, 'ثبت تصمیم ناموفق بود'))
  } finally {
    submitting.value = false
  }
}
</script>
