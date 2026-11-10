<!-- components/panel/questions/QuestionAnswerModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    :title="question?.answer ? 'ویرایش پاسخ' : 'پاسخ به پرسش'"
    icon="i-heroicons-chat-bubble-left-right"
    submit-label="ثبت پاسخ"
    width="lg"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <div class="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3 space-y-1">
      <p class="text-xs text-gray-500 dark:text-gray-400">
        پرسش از {{ question?.authorName || 'کاربر' }}
        <span v-if="question?.anonymous">(ناشناس برای سایت)</span>
      </p>
      <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{{ question?.question }}</p>
    </div>

    <UFormField
      label="متن پاسخ"
      required
      :error="error"
      help="متن ساده، حداکثر ۲۰۰۰ نویسه. پاسخ اول به پرسش‌کننده پیامک می‌شود؛ اگر پرسش عمومی باشد، در سایت نمایش داده می‌شود"
    >
      <UTextarea v-model="answer" :rows="5" :maxlength="ANSWER_MAX" class="w-full" />
    </UFormField>
  </PanelFormModal>
</template>

<script setup>
// Writes the store's answer to one question. The parent replaces the row from the `saved` payload.
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import { apiErrorMessage, errorStatus } from '~/utils/apiError.js'

const props = defineProps({
  open: { type: Boolean, required: true },
  // GoodsQuestionAdminDTO being answered
  question: { type: Object, default: null },
})

const emit = defineEmits(['update:open', 'saved'])

const app = useNuxtApp()
const toast = useAppToast()

const ANSWER_MAX = 2000
const answer = ref('')
const error = ref('')
const serverError = ref('')
const saving = ref(false)

// Every open starts from the answer already stored (edit) or empty (first answer)
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    answer.value = props.question?.answer ?? ''
    error.value = ''
    serverError.value = ''
  }
)

const submit = async () => {
  if (saving.value) return
  const text = answer.value.trim()
  if (!text) {
    error.value = 'متن پاسخ را وارد کنید'
    return
  }
  error.value = ''
  serverError.value = ''
  saving.value = true
  try {
    const res = await app.$api.contentAdmin.answerQuestion(props.question.id, { data: { answer: text } })
    toast.success('پاسخ ثبت شد')
    emit('saved', res.data.data)
    emit('update:open', false)
  } catch (e) {
    // The modal stays open; the message is shown here rather than as a toast
    if (errorStatus(e) === 400) serverError.value = apiErrorMessage(e, 'متن پاسخ نامعتبر است')
    else toast.error(apiErrorMessage(e, 'ثبت پاسخ ناموفق بود'))
  } finally {
    saving.value = false
  }
}
</script>
