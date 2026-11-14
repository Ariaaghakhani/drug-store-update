<!-- components/panel/workflow/BindModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    :title="current ? 'تغییر فرایند متصل' : 'اتصال فرایند'"
    icon="i-heroicons-link"
    :submit-label="current ? 'ذخیره‌ی تغییر' : 'اتصال'"
    :loading="saving"
    :submit-disabled="loadingDefinitions || !definitionId || definitionId === current?.definitionId"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <div class="rounded-xl bg-gray-50 dark:bg-gray-800/50 px-4 py-3 space-y-1">
      <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ subjectTitle }}</p>
      <p class="text-sm text-gray-600 dark:text-gray-300">{{ action.title || action.code }}</p>
      <p class="text-xs text-gray-400 dark:text-gray-500" dir="ltr">{{ subject }} · {{ action.code }}</p>
    </div>

    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <div v-if="loadingDefinitions" class="space-y-2">
      <USkeleton class="h-12 w-full rounded-lg" />
      <USkeleton class="h-12 w-full rounded-lg" />
    </div>

    <div v-else-if="loadError" class="space-y-3">
      <p class="text-sm text-error" role="alert">{{ loadError }}</p>
      <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="loadDefinitions">تلاش دوباره</UButton>
    </div>

    <div v-else-if="!choices.length" class="space-y-3">
      <p class="text-sm text-gray-600 dark:text-gray-300 leading-6">
        هیچ فرایند منتشرشده‌ای برای این کار وجود ندارد. فقط فرایندی که برای همین موجودیت و کار طراحی و منتشر شده باشد قابل اتصال است.
      </p>
      <UButton v-if="hasDefinitionsPage" to="/panel/workflow/definitions" color="neutral" variant="outline" icon="i-heroicons-arrow-top-right-on-square">
        رفتن به فرایندها
      </UButton>
    </div>

    <UFormField v-else label="فرایند منتشرشده" required>
      <URadioGroup v-model="definitionId" :items="choices" value-key="value" orientation="vertical" />
    </UFormField>

    <p v-if="current && choices.length" class="text-xs text-gray-500 dark:text-gray-400 leading-5">
      با تغییر اتصال، اجراهای در جریان روی فرایند قبلی تمام می‌شوند و کارهای بعدی با فرایند تازه بررسی می‌شوند.
    </p>
  </PanelFormModal>
</template>

<script setup>
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import { apiErrorMessage } from '~/utils/apiError.js'

// Binds one action of a subject to a PUBLISHED process designed for exactly that subject + action (BACK module WORKFLOW_DESIGN).
// Emits `update:open` and `done(binding)`. The processes come from `listDefinitions` (status PUBLISHED, one subject, size 100);
// BACK has no `action` filter, so the action is filtered here.
const props = defineProps({
  open: { type: Boolean, required: true },
  subject: { type: String, required: true },
  subjectTitle: { type: String, default: '' },
  // {code, title}
  action: { type: Object, required: true },
  // The existing WorkflowBindingDTO of this action, or null
  current: { type: Object, default: null },
})
const emit = defineEmits(['update:open', 'done'])

const app = useNuxtApp()
const router = useRouter()
const toast = useAppToast()

const definitions = ref([])
const loadingDefinitions = ref(false)
const loadError = ref('')
const definitionId = ref(null)
const saving = ref(false)
const serverError = ref('')

// The designer list (C22a) may not exist yet: link to it only when the route is there
const hasDefinitionsPage = computed(() => router.hasRoute('panel-workflow-definitions'))

const choices = computed(() =>
  definitions.value.map((definition) => ({
    value: definition.id,
    label: definition.title || definition.key,
    description: definition.publishedVersion
      ? `نسخه‌ی ${definition.publishedVersion.toLocaleString('fa-IR')}`
      : undefined,
  }))
)

async function loadDefinitions() {
  loadingDefinitions.value = true
  loadError.value = ''
  try {
    const res = await app.$api.workflow.listDefinitions({
      params: { status: 'PUBLISHED', subject: props.subject, size: 100 },
    })
    definitions.value = (res.data.data?.content ?? []).filter((definition) => definition.action === props.action.code)
    // Start on the process that is bound now, when it is still in the list
    definitionId.value = definitions.value.some((definition) => definition.id === props.current?.definitionId)
      ? props.current.definitionId
      : null
  } catch (e) {
    definitions.value = []
    loadError.value = apiErrorMessage(e, 'دریافت فرایندهای منتشرشده ناموفق بود')
  } finally {
    loadingDefinitions.value = false
  }
}

// Every open starts clean and reloads the list (immediate: the page mounts this modal already open)
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    serverError.value = ''
    definitionId.value = null
    loadDefinitions()
  },
  { immediate: true }
)

async function submit() {
  if (saving.value || !definitionId.value) return
  saving.value = true
  serverError.value = ''
  try {
    const res = await app.$api.workflow.bindWorkflow({
      data: { subject: props.subject, action: props.action.code, definitionId: definitionId.value },
    })
    toast.success('اتصال فرایند ذخیره شد')
    emit('done', res.data.data)
    emit('update:open', false)
  } catch (e) {
    // 409 (not published any more), 400 (subject or action mismatch) and 404 stay in the modal
    serverError.value = apiErrorMessage(e, 'ذخیره‌ی اتصال ناموفق بود')
  } finally {
    saving.value = false
  }
}
</script>
