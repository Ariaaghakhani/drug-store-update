<!-- components/panel/prescriptions/InsurancesModal.vue -->
<template>
  <UModal
    :open="open"
    title="بیمه‌های طرف قرارداد"
    :dismissible="!busy"
    :ui="{ content: 'sm:max-w-2xl' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div dir="rtl" class="space-y-4 font-dana">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          بیمه‌های غیرفعال در فرم ثبت نسخه مشتری نمایش داده نمی‌شوند. نسخه‌های قبلی نام بیمه‌ی خود را نگه می‌دارند.
        </p>

        <div class="relative">
          <Transition name="sk">
            <div v-if="loading" key="skeleton" class="space-y-3">
              <USkeleton v-for="i in 3" :key="i" class="h-9 w-full rounded-lg" />
            </div>

            <PanelEmptyState
              v-else-if="error"
              key="error"
              variant="error"
              title="دریافت بیمه‌ها ناموفق بود"
            >
              <template #action>
                <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
                  تلاش دوباره
                </UButton>
              </template>
            </PanelEmptyState>

            <div v-else key="content" class="space-y-3">
              <p v-if="!rows.length" class="text-sm text-gray-500 dark:text-gray-400">
                هنوز بیمه‌ای ثبت نشده است.
              </p>

              <div
                v-for="row in rows"
                :key="row.id"
                class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center rounded-xl border border-gray-100 dark:border-gray-800 p-3"
              >
                <UInput v-model="row.name" :maxlength="100" aria-label="نام بیمه" class="sm:col-span-5" />
                <USelect v-model="row.kind" :items="KIND_ITEMS" class="sm:col-span-3" aria-label="نوع بیمه" />
                <UInput
                  v-model="row.sortOrder"
                  inputmode="numeric"
                  dir="ltr"
                  placeholder="ترتیب"
                  aria-label="ترتیب نمایش"
                  class="sm:col-span-2"
                />
                <div class="flex items-center gap-2 sm:col-span-2 justify-between">
                  <USwitch
                    v-model="row.active"
                    size="lg"
                    aria-label="فعال"
                    :ui="SWITCH_UI"
                  />
                  <div class="flex items-center gap-1">
                    <UButton
                      v-if="isDirty(row)"
                      color="primary"
                      variant="ghost"
                      square
                      icon="i-heroicons-check"
                      aria-label="ذخیره‌ی ردیف"
                      :loading="row.saving"
                      :disabled="busy"
                      @click="saveRow(row)"
                    />
                    <UButton
                      color="error"
                      variant="ghost"
                      square
                      icon="i-heroicons-trash"
                      aria-label="حذف بیمه"
                      :disabled="busy"
                      @click="askDelete(row)"
                    />
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-3 space-y-3">
                <p class="text-sm font-medium text-gray-900 dark:text-white">افزودن بیمه</p>
                <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <UInput v-model="draft.name" :maxlength="100" placeholder="نام بیمه" aria-label="نام بیمه‌ی جدید" class="sm:col-span-5" />
                  <USelect v-model="draft.kind" :items="KIND_ITEMS" class="sm:col-span-3" aria-label="نوع بیمه‌ی جدید" />
                  <UInput
                    v-model="draft.sortOrder"
                    inputmode="numeric"
                    dir="ltr"
                    placeholder="ترتیب"
                    aria-label="ترتیب نمایش بیمه‌ی جدید"
                    class="sm:col-span-2"
                  />
                  <div class="flex items-center gap-2 sm:col-span-2 justify-between">
                    <USwitch v-model="draft.active" size="lg" aria-label="فعال" :ui="SWITCH_UI" />
                    <UButton
                      color="primary"
                      icon="i-heroicons-plus"
                      square
                      aria-label="افزودن"
                      :loading="adding"
                      :disabled="busy"
                      @click="addInsurance"
                    />
                  </div>
                </div>
                <p v-if="draftError" class="text-xs text-error" role="alert">{{ draftError }}</p>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full items-center gap-2" dir="rtl">
        <UButton class="ms-auto" color="neutral" variant="soft" :disabled="busy" @click="emit('update:open', false)">
          بستن
        </UButton>
      </div>
    </template>
  </UModal>

  <PanelConfirmDialog
    v-model:open="deleteOpen"
    title="حذف بیمه"
    :message="deleteMessage"
    confirm-label="حذف"
    confirm-color="error"
    :loading="deleting"
    @confirm="confirmDelete"
  />
</template>

<script setup>
// Staff list of the store's insurances (module PRESCRIPTION). Each row edits in place and saves with its own check button.
// The parent reloads its insurance filter through the `changed` event after any create, save or delete.
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import { apiErrorMessage } from '~/utils/apiError.js'
import { INSURANCE_KIND_LABELS } from '~/utils/prescriptionMeta.js'
import { parseQuantity } from '~/utils/inventoryMeta.js'

const props = defineProps({
  open: { type: Boolean, required: true },
})

const emit = defineEmits(['update:open', 'changed'])

const app = useNuxtApp()
const toast = useAppToast()

const KIND_ITEMS = Object.entries(INSURANCE_KIND_LABELS).map(([value, label]) => ({ value, label }))
const SWITCH_UI = {
  base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
}

const blankDraft = () => ({ name: '', kind: 'BASIC', sortOrder: '0', active: true })

const loading = ref(false)
const error = ref(null)
const rows = ref([])
const draft = reactive(blankDraft())
const draftError = ref('')
const adding = ref(false)
const deleteOpen = ref(false)
const deleting = ref(false)
const pendingDelete = ref(null)

const busy = computed(() => adding.value || deleting.value || rows.value.some((row) => row.saving))
const deleteMessage = computed(() => {
  const name = pendingDelete.value?.name ?? ''
  return `بیمه‌ی «${name}» از لیست حذف شود؟ نسخه‌های قبلی نام بیمه را نگه می‌دارند.`
})

// Validation shared by create and save. Returns the request body, or null with the message in `message`.
function toBody(source) {
  const name = String(source.name ?? '').trim()
  if (!name) return { message: 'نام بیمه را وارد کنید' }
  if (name.length > 100) return { message: 'نام بیمه بیش از ۱۰۰ کاراکتر است' }
  const sortOrder = parseQuantity(source.sortOrder === '' ? 0 : source.sortOrder)
  if (sortOrder === null || sortOrder > 10000) return { message: 'ترتیب باید عددی بین ۰ تا ۱۰٬۰۰۰ باشد' }
  return { body: { name, kind: source.kind, sortOrder, active: Boolean(source.active) } }
}

const toRow = (item) => ({
  id: item.id,
  name: item.name ?? '',
  kind: item.kind,
  sortOrder: String(item.sortOrder ?? 0),
  active: item.active !== false,
  original: { name: item.name ?? '', kind: item.kind, sortOrder: String(item.sortOrder ?? 0), active: item.active !== false },
  saving: false,
})

const isDirty = (row) => {
  const o = row.original
  return row.name !== o.name || row.kind !== o.kind || String(row.sortOrder) !== o.sortOrder || row.active !== o.active
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const response = await app.$api.prescription.listInsurances()
    rows.value = (response.data.data ?? []).map(toRow)
  } catch (e) {
    rows.value = []
    error.value = e
  } finally {
    loading.value = false
  }
}

// Every open starts from the server list and a blank draft
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    Object.assign(draft, blankDraft())
    draftError.value = ''
    load()
  }
)

async function saveRow(row) {
  const parsed = toBody(row)
  if (parsed.message) {
    toast.error(parsed.message)
    return
  }
  row.saving = true
  try {
    const response = await app.$api.prescription.updateInsurance(row.id, { data: parsed.body })
    const saved = toRow(response.data.data)
    Object.assign(row, saved)
    emit('changed')
    toast.success('بیمه ذخیره شد')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'ذخیره‌ی بیمه ناموفق بود'))
    // A 409 means the list moved on: refresh it
    if (e?.response?.status === 409) await load()
  } finally {
    row.saving = false
  }
}

async function addInsurance() {
  draftError.value = ''
  const parsed = toBody(draft)
  if (parsed.message) {
    draftError.value = parsed.message
    return
  }
  adding.value = true
  try {
    const response = await app.$api.prescription.createInsurance({ data: parsed.body })
    rows.value = [...rows.value, toRow(response.data.data)]
    Object.assign(draft, blankDraft())
    emit('changed')
    toast.success('بیمه افزوده شد')
  } catch (e) {
    draftError.value = apiErrorMessage(e, 'افزودن بیمه ناموفق بود')
  } finally {
    adding.value = false
  }
}

const askDelete = (row) => {
  pendingDelete.value = row
  deleteOpen.value = true
}

async function confirmDelete() {
  const row = pendingDelete.value
  if (!row) return
  deleting.value = true
  try {
    await app.$api.prescription.deleteInsurance(row.id)
    rows.value = rows.value.filter((item) => item.id !== row.id)
    deleteOpen.value = false
    emit('changed')
    toast.success('بیمه حذف شد')
  } catch (e) {
    deleteOpen.value = false
    toast.error(apiErrorMessage(e, 'حذف بیمه ناموفق بود'))
    await load()
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
