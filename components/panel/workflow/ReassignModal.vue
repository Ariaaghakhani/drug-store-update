<!-- components/panel/workflow/ReassignModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    title="ارجاع کار"
    icon="i-heroicons-arrow-uturn-right"
    submit-label="ارجاع"
    :loading="saving"
    :submit-disabled="loadingStaff || !userId"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p class="text-sm text-gray-600 dark:text-gray-300 leading-6">
      کار به کارمند انتخاب‌شده سپرده می‌شود و دیگر در کارتابل دارنده‌ی قبلی نیست.
    </p>

    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <USkeleton v-if="loadingStaff" class="h-9 w-full rounded-lg" />

    <div v-else-if="staffError" class="space-y-3">
      <p class="text-sm text-error" role="alert">{{ staffError }}</p>
      <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="loadStaff">تلاش دوباره</UButton>
    </div>

    <!-- The staff list needs the user-management grant; without it the user id is typed by hand -->
    <UFormField
      v-else-if="manualId"
      label="شناسه کاربر"
      required
      help="فهرست کارمندان برای شما در دسترس نیست؛ شناسه‌ی کارمند را وارد کنید"
    >
      <UInput v-model="manualIdText" inputmode="numeric" dir="ltr" autocomplete="off" class="w-full" />
    </UFormField>

    <UFormField v-else label="کارمند" required>
      <USelectMenu
        v-model="selectedId"
        :items="staffItems"
        value-key="value"
        placeholder="انتخاب کارمند"
        :search-input="{ placeholder: 'جستجوی نام یا شماره' }"
        class="w-full"
      />
    </UFormField>
  </PanelFormModal>
</template>

<script setup>
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import { apiErrorMessage } from '~/utils/apiError.js'
import { toLatinDigits } from '~/utils/jalali.js'

// Hands one task to another staff member of this store (BACK module WORKFLOW_MONITOR). Emits `update:open` and `done(task)`.
// Staff come from `user.listStaff()` (module USER_MANAGEMENT); a 403 there switches to a numeric «شناسه کاربر» input.
const props = defineProps({
  open: { type: Boolean, required: true },
  taskId: { type: String, required: true },
})
const emit = defineEmits(['update:open', 'done'])

const app = useNuxtApp()
const toast = useAppToast()

const staff = ref([])
const loadingStaff = ref(false)
const staffError = ref('')
const manualId = ref(false)
const selectedId = ref(null)
const manualIdText = ref('')
const saving = ref(false)
const serverError = ref('')

const staffItems = computed(() =>
  staff.value.map((user) => {
    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username || `#${user.id}`
    return { value: user.id, label: user.phone ? `${name} · ${user.phone}` : name }
  })
)

// The id to send: the picked staff member, or the typed number in manual mode (digits from a Persian keyboard are converted)
const userId = computed(() => {
  if (!manualId.value) return selectedId.value
  const digits = toLatinDigits(manualIdText.value).trim()
  return /^\d+$/.test(digits) && Number(digits) > 0 ? Number(digits) : null
})

async function loadStaff() {
  loadingStaff.value = true
  staffError.value = ''
  try {
    const res = await app.$api.user.listStaff()
    staff.value = res.data.data ?? []
    manualId.value = false
  } catch (e) {
    if (e?.response?.status === 403) manualId.value = true
    else staffError.value = apiErrorMessage(e, 'دریافت فهرست کارمندان ناموفق بود')
  } finally {
    loadingStaff.value = false
  }
}

// Every open starts clean and reloads the staff list
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    selectedId.value = null
    manualIdText.value = ''
    serverError.value = ''
    loadStaff()
  }
)

async function submit() {
  if (saving.value || !userId.value) return
  saving.value = true
  serverError.value = ''
  try {
    const res = await app.$api.workflow.reassignTask(props.taskId, { data: { userId: userId.value } })
    toast.success('کار ارجاع شد')
    emit('done', res.data.data)
    emit('update:open', false)
  } catch (e) {
    // 400 `workflow.reassign.user.invalid` (not an active staff user) and 404 stay in the modal
    serverError.value = apiErrorMessage(e, 'ارجاع کار ناموفق بود')
  } finally {
    saving.value = false
  }
}
</script>
