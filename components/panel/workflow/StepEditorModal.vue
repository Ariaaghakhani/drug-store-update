<!-- components/panel/workflow/StepEditorModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    title="ویرایش مرحله"
    icon="i-heroicons-pencil-square"
    submit-label="تأیید"
    width="4xl"
    :submit-disabled="!draft || hasErrors"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <template #footer-start>
      <p v-if="errorCount" class="text-xs text-error">{{ errorCount.toLocaleString('fa-IR') }} خطا؛ اول آن‌ها را رفع کنید</p>
      <p v-else-if="warningCount" class="text-xs text-warning">{{ warningCount.toLocaleString('fa-IR') }} هشدار (مانع تأیید نیست)</p>
    </template>

    <div v-if="draft" class="space-y-4">
      <!-- ===== key, title, type ===== -->
      <section :class="SECTION">
        <div class="grid gap-3 sm:grid-cols-2">
          <UFormField label="کلید مرحله" required :help="KEY_HELP" :error="firstError('key')">
            <UInput
              :model-value="draft.key"
              dir="ltr"
              autocomplete="off"
              spellcheck="false"
              placeholder="manager_review"
              class="w-full font-mono"
              @update:model-value="onKey"
            />
          </UFormField>
          <UFormField
            label="عنوان مرحله"
            required
            :help="`تا ${MAX_STEP_TITLE.toLocaleString('fa-IR')} نویسه`"
            :error="firstError('title')"
          >
            <UInput v-model="draft.title" :maxlength="MAX_STEP_TITLE" autocomplete="off" class="w-full" />
          </UFormField>
        </div>
        <p v-if="renameCount" class="flex items-start gap-1 text-xs text-info">
          <UIcon name="i-heroicons-information-circle" class="w-4 h-4 flex-shrink-0" />
          <span>
            با عوض شدن کلید، ارجاع {{ renameCount.toLocaleString('fa-IR') }} مرحله‌ی دیگر به این مرحله («رفتن به»، شرط یا ورودی اقدام) هم‌زمان به‌روز می‌شود.
          </span>
        </p>

        <UFormField label="نوع مرحله">
          <USelect :model-value="type" :items="TYPE_ITEMS" class="w-full" @update:model-value="requestType" />
        </UFormField>

        <UAlert
          v-if="pendingType"
          color="warning"
          variant="soft"
          icon="i-heroicons-exclamation-triangle"
          :title="`با تغییر نوع به «${labelOf(STEP_TYPE_LABELS, pendingType)}» این موارد پاک می‌شوند`"
        >
          <template #description>
            <ul class="list-disc ps-5 space-y-1">
              <li v-for="item in discardList" :key="item.key">{{ item.label }}</li>
            </ul>
          </template>
          <template #actions>
            <UButton color="warning" variant="soft" size="sm" icon="i-heroicons-arrow-path" @click="applyType(pendingType)">
              پاک کن و نوع را عوض کن
            </UButton>
            <UButton color="neutral" variant="outline" size="sm" @click="pendingType = null">انصراف</UButton>
          </template>
        </UAlert>
      </section>

      <!-- ===== APPROVAL ===== -->
      <template v-if="type === 'APPROVAL'">
        <!-- approvers -->
        <section :class="SECTION">
          <div class="flex flex-wrap items-center gap-2">
            <UIcon name="i-heroicons-users" class="w-4 h-4 text-brand-500 dark:text-brand-400" />
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
              گیرندگان
              <span class="text-xs font-normal text-gray-500 dark:text-gray-400">
                ({{ approversList.length.toLocaleString('fa-IR') }} از {{ MAX_APPROVERS.toLocaleString('fa-IR') }})
              </span>
            </h4>
            <UButton
              class="ms-auto"
              color="neutral"
              variant="outline"
              size="sm"
              icon="i-heroicons-plus"
              :disabled="approversList.length >= MAX_APPROVERS"
              @click="addApprover"
            >
              افزودن گیرنده
            </UButton>
          </div>

          <UAlert
            v-if="approvers.failed"
            color="warning"
            variant="soft"
            icon="i-heroicons-exclamation-triangle"
            title="فهرست نقش‌ها و کارمندان دریافت نشد"
            description="تا وقتی دریافت نشود، نقش یا کارمند تازه انتخاب نمی‌شود؛ گیرنده‌های ثبت‌شده همان‌طور که هستند می‌مانند."
          >
            <template #actions>
              <UButton color="neutral" variant="outline" size="sm" icon="i-heroicons-arrow-path" :loading="approvers.loading" @click="approvers.load(true)">
                تلاش دوباره
              </UButton>
            </template>
          </UAlert>

          <ul v-if="approversList.length" class="space-y-2">
            <li v-for="(approver, i) in approversList" :key="i" class="flex flex-wrap items-start gap-2">
              <USelect
                :model-value="approver.type"
                :items="APPROVER_TYPE_ITEMS"
                placeholder="نوع گیرنده"
                class="w-full sm:w-56"
                @update:model-value="setApproverType(i, $event)"
              />
              <div v-if="approver.type === 'ROLE'" class="flex-1 min-w-48">
                <USkeleton v-if="approvers.loading && !approvers.loaded" class="h-9 w-full rounded-lg" />
                <USelect
                  v-else
                  :model-value="approver.roleId ?? undefined"
                  :items="roleItems(approver.roleId)"
                  placeholder="انتخاب نقش"
                  class="w-full"
                  @update:model-value="setApproverRole(i, $event)"
                />
              </div>
              <div v-else-if="approver.type === 'USER'" class="flex-1 min-w-48">
                <USkeleton v-if="approvers.loading && !approvers.loaded" class="h-9 w-full rounded-lg" />
                <!-- ignore-filter: the list is whatever BACK answered for the typed text (debounced), not filtered here again -->
                <USelectMenu
                  v-else
                  :model-value="approver.userId ?? undefined"
                  :items="userItems(approver.userId)"
                  value-key="value"
                  placeholder="انتخاب کارمند"
                  :search-input="{ placeholder: 'جستجوی نام یا شماره‌ی کارمند' }"
                  :loading="approvers.searching"
                  ignore-filter
                  class="w-full"
                  @update:search-term="approvers.searchUsers($event)"
                  @update:open="onUserMenuOpen"
                  @update:model-value="setApproverUser(i, $event)"
                />
              </div>
              <p v-else class="flex-1 min-w-48 self-center text-xs text-gray-500 dark:text-gray-400">
                {{ approver.type === 'STARTER' ? 'کسی که درخواست را ثبت کرده است' : 'کسی که مرحله‌ی قبل را تصمیم‌گیری کرده است' }}
              </p>
              <UButton
                color="error"
                variant="ghost"
                square
                icon="i-heroicons-trash"
                aria-label="حذف گیرنده"
                @click="removeApprover(i)"
              />
            </li>
          </ul>
          <p v-else class="text-xs text-gray-500 dark:text-gray-400">هنوز گیرنده‌ای انتخاب نشده است.</p>

          <p v-if="approvers.searchFailed" class="text-xs text-warning">جستجوی کارمند ناموفق بود؛ فهرست قبلی نمایش داده می‌شود.</p>
          <StepIssueList :issues="[...issuesFor('approvers'), ...unknownUserIssues]" />
        </section>

        <!-- completion, starter, attachments -->
        <section :class="SECTION">
          <div class="grid gap-3 sm:grid-cols-2">
            <UFormField label="نحوه‌ی تکمیل" required :error="firstError('completion')">
              <USelect v-model="draft.completion" :items="COMPLETION_ITEMS" placeholder="انتخاب" class="w-full" />
            </UFormField>
            <UFormField label="پیوست فایل" help="«اجباری»: تأیید بدون دست‌کم یک فایل پذیرفته نمی‌شود">
              <USelect v-model="attachmentsMode" :items="ATTACHMENT_ITEMS" class="w-full" />
            </UFormField>
          </div>

          <div class="flex items-center justify-between gap-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white">ثبت‌کننده‌ی درخواست هم می‌تواند تصمیم بگیرد</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                پیش‌فرض خاموش است (کسی درخواست خودش را تأیید نمی‌کند). اگر «ثبت‌کننده» از گیرنده‌ها باشد، این تنظیم لازم نیست.
              </p>
            </div>
            <USwitch
              size="lg"
              :model-value="Boolean(draft.starterMayDecide)"
              :ui="SWITCH_UI"
              @update:model-value="draft.starterMayDecide = $event"
            />
          </div>

          <p v-if="draft.goTo" class="text-xs text-gray-600 dark:text-gray-400">
            اگر این مرحله رد شود، فرایند به مرحله‌ی
            <span class="font-mono" dir="ltr">{{ draft.goTo }}</span>
            می‌رود. این مقدار از این‌جا ویرایش نمی‌شود و همان‌طور که هست می‌ماند.
          </p>
          <StepIssueList :issues="[...issuesFor('completion'), ...issuesFor('goto')]" />
        </section>

        <!-- deadline -->
        <section :class="SECTION">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <h4 class="text-sm font-semibold text-gray-900 dark:text-white">مهلت تصمیم</h4>
              <p class="text-xs text-gray-500 dark:text-gray-400">پس از گذشتن مهلت، کار «دیرکرده» می‌شود و کار انتخاب‌شده انجام می‌شود.</p>
            </div>
            <USwitch size="lg" :model-value="deadlineOn" :ui="SWITCH_UI" @update:model-value="toggleDeadline" />
          </div>

          <template v-if="deadlineOn">
            <div class="grid gap-3 sm:grid-cols-3">
              <UFormField
                label="مدت"
                required
                :help="`${(1).toLocaleString('fa-IR')} تا ${MAX_DEADLINE_DAYS.toLocaleString('fa-IR')}`"
              >
                <UInput
                  :model-value="amountText"
                  inputmode="numeric"
                  dir="ltr"
                  autocomplete="off"
                  class="w-full"
                  @update:model-value="onAmount"
                />
              </UFormField>
              <UFormField label="واحد" required>
                <USelect v-model="draft.deadline.unit" :items="UNIT_ITEMS" placeholder="انتخاب" class="w-full" />
              </UFormField>
              <UFormField label="پس از گذشتن مهلت">
                <USelect :model-value="draft.deadline.onOverdue || 'NONE'" :items="OVERDUE_ITEMS" class="w-full" @update:model-value="setOverdue" />
              </UFormField>
            </div>

            <div v-if="overdue === 'ESCALATE' || overdue === 'REMIND_SMS'" class="grid gap-3 sm:grid-cols-3">
              <UFormField
                v-if="overdue === 'ESCALATE'"
                label="ارجاع به نقش"
                required
              >
                <USelect
                  :model-value="draft.deadline.escalateToRoleId ?? undefined"
                  :items="roleItems(draft.deadline.escalateToRoleId)"
                  placeholder="انتخاب نقش"
                  class="w-full"
                  @update:model-value="draft.deadline.escalateToRoleId = $event"
                />
              </UFormField>
              <UFormField
                label="تکرار هر (روز)"
                :help="`اختیاری، ${(1).toLocaleString('fa-IR')} تا ${MAX_REPEAT_DAYS.toLocaleString('fa-IR')}`"
              >
                <UInput
                  :model-value="repeatText"
                  inputmode="numeric"
                  dir="ltr"
                  autocomplete="off"
                  class="w-full"
                  @update:model-value="onRepeat"
                />
              </UFormField>
              <UFormField
                v-if="overdue === 'ESCALATE'"
                label="ارجاع دوم به نقش"
                :help="hasRepeat ? 'اختیاری' : 'اول فاصله‌ی تکرار را بنویسید'"
              >
                <USelect
                  :model-value="draft.deadline.escalateAgainToRoleId ?? NO_ROLE"
                  :items="[{ value: NO_ROLE, label: 'بدون ارجاع دوم' }, ...roleItems(draft.deadline.escalateAgainToRoleId)]"
                  :disabled="!hasRepeat && !draft.deadline.escalateAgainToRoleId"
                  class="w-full"
                  @update:model-value="setEscalateAgain"
                />
              </UFormField>
            </div>
            <StepIssueList :issues="issuesFor('deadline')" />
          </template>
        </section>
      </template>

      <!-- ===== ACTION, WAIT, AUTO: JSON of the type-specific keys ===== -->
      <section v-else :class="SECTION">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-code-bracket" class="w-4 h-4 text-brand-500 dark:text-brand-400" />
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white">ویژگی‌های «{{ labelOf(STEP_TYPE_LABELS, type) }}»</h4>
        </div>
        <!-- Re-created when the type changes, so its text starts from the new type's keys -->
        <StepJsonEditor
          :key="type"
          ref="jsonEditor"
          :model-value="draft"
          :type="type"
          :subject="subject"
          :system-actions="optionsReady ? approvers.systemActions : null"
          :targets="targets"
          @update:model-value="draft = $event"
          @error="jsonError = $event"
        />
        <StepIssueList :issues="issuesFor('details')" />
      </section>

      <!-- ===== run condition (every type) ===== -->
      <section :class="SECTION">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white">شرط اجرای مرحله</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{
                type === 'AUTO'
                  ? 'اگر شرط درست باشد فرایند با تصمیم خودکار تمام می‌شود؛ وگرنه مرحله‌ی بعد. برای این نوع مرحله شرط لازم است.'
                  : 'اگر شرط نادرست باشد، مرحله اجرا نمی‌شود و فرایند به مرحله‌ی بعد می‌رود. بدون شرط، مرحله همیشه اجرا می‌شود.'
              }}
            </p>
          </div>
          <USwitch
            size="lg"
            :model-value="conditionOn"
            :disabled="type === 'AUTO' && conditionOn"
            :ui="SWITCH_UI"
            @update:model-value="toggleCondition"
          />
        </div>
        <p v-if="conditionOn && !fieldsKnown" class="text-xs text-warning">
          فهرست فیلدهای این موجودیت دریافت نشد؛ فقط ساختار شرط بررسی می‌شود و درستی فیلدها موقع «اعتبارسنجی» معلوم می‌شود.
        </p>
        <ConditionBuilder
          v-if="conditionOn"
          :model-value="draft.condition"
          :fields="conditionFields"
          :fields-known="fieldsKnown"
          @update:model-value="draft.condition = $event"
        />
        <StepIssueList :issues="conditionTopIssues" />
      </section>
    </div>
  </PanelFormModal>
</template>

<script setup>
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import ConditionBuilder from '@/components/panel/workflow/ConditionBuilder.vue'
import StepIssueList from '@/components/panel/workflow/StepIssueList.vue'
import StepJsonEditor from '@/components/panel/workflow/StepJsonEditor.vue'
import { labelOf, selectItems } from '~/utils/enumMeta.js'
import { parseQuantity } from '~/utils/inventoryMeta.js'
import { toLatinDigits } from '~/utils/jalali.js'
import {
  APPROVER_TYPE_LABELS,
  ATTACHMENT_MODE_LABELS,
  COMPLETION_LABELS,
  DEADLINE_UNIT_LABELS,
  OVERDUE_ACTION_LABELS,
  STEP_TYPE_LABELS,
} from '~/utils/workflowMeta.js'
import { cloneJson, stepTypeOf } from '~/utils/workflowDefinition.js'
import { conditionFieldsFor, newGroup } from '~/utils/workflowCondition.js'
import {
  MAX_APPROVERS,
  MAX_DEADLINE_DAYS,
  MAX_REPEAT_DAYS,
  MAX_STEP_TITLE,
  applyTypeChange,
  countRenameReferences,
  discardedOnTypeChange,
  goToTargets,
  sameStep,
  validateStep,
} from '~/utils/workflowStep.js'

// Editor of ONE step of a definition (C22d approval step, C22e condition, C22f the other three types). Emits `update:open` and
// `done(step)`; the page replaces the whole step with it (`replaceStep` in utils/workflowStep.js, which also renames references to a
// renamed key in the other steps).
// Props: `open`; `step` (the step to edit; the modal works on its own deep copy, so Cancel changes nothing); `index` (its position);
// `steps` (the whole current list: key uniqueness, earlier action outputs for conditions, goTo targets); `subject` (the catalog entry
// `{fields, events}` of the definition's subject, or null when the catalog did not load); `approvers` (the page's `useApproverOptions()`
// result made reactive: roles, users, systemActions, load(), searchUsers()).
//
// The draft starts as a copy of `step` and only the fields this modal owns are changed; everything else comes back as it was. The one
// deliberate exception is a type change, which removes the fields BACK forbids for the new type, after saying so (see `requestType`).
// When nothing really changed (`sameStep`), the ORIGINAL object is handed back, so the page does not turn dirty.
const props = defineProps({
  open: { type: Boolean, required: true },
  step: { type: Object, default: null },
  index: { type: Number, default: 0 },
  steps: { type: Array, default: () => [] },
  subject: { type: Object, default: null },
  approvers: { type: Object, required: true },
})
const emit = defineEmits(['update:open', 'done'])

const SECTION = 'rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3'
const SWITCH_UI = {
  base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
}
const KEY_HELP = `حرف کوچک انگلیسی، رقم و _ ؛ با حرف شروع شود؛ حداکثر ${(30).toLocaleString('fa-IR')} نویسه`
const NO_ROLE = 'none'

const TYPE_ITEMS = selectItems(STEP_TYPE_LABELS)
const APPROVER_TYPE_ITEMS = selectItems(APPROVER_TYPE_LABELS)
const COMPLETION_ITEMS = selectItems(COMPLETION_LABELS)
const ATTACHMENT_ITEMS = selectItems(ATTACHMENT_MODE_LABELS)
const UNIT_ITEMS = selectItems(DEADLINE_UNIT_LABELS)
const OVERDUE_ITEMS = selectItems(OVERDUE_ACTION_LABELS)

const isSet = (value) => value !== null && value !== undefined
const fa = (n) => Number(n).toLocaleString('fa-IR')

// ---------- the draft ----------
const draft = ref(null)
const original = ref(null)
const pendingType = ref(null) // a type change waiting for the user's answer
const jsonError = ref('')
const jsonEditor = ref(null)
const amountText = ref('')
const repeatText = ref('')
// What a switch turned off held, so turning it back on in the same session brings it back instead of an empty default
let stashedCondition = null
let stashedDeadline = null

// Every open starts from the step the page handed in
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    original.value = cloneJson(props.step ?? {})
    draft.value = cloneJson(props.step ?? {})
    pendingType.value = null
    jsonError.value = ''
    amountText.value = isSet(draft.value.deadline?.amount) ? String(draft.value.deadline.amount) : ''
    repeatText.value = isSet(draft.value.deadline?.repeatEvery) ? String(draft.value.deadline.repeatEvery) : ''
    stashedCondition = null
    stashedDeadline = null
    props.approvers.load() // cached after the first time; a failed load is retried here
  },
  { immediate: true }
)

const type = computed(() => (draft.value ? stepTypeOf(draft.value) : 'APPROVAL'))
const optionsReady = computed(() => props.approvers.loaded)

// ---------- validation ----------
const issues = computed(() =>
  draft.value
    ? validateStep(draft.value, {
        index: props.index,
        steps: props.steps,
        subject: props.subject,
        roles: optionsReady.value ? props.approvers.roles : null,
        systemActions: optionsReady.value ? props.approvers.systemActions : null,
      })
    : []
)
const errorCount = computed(() => issues.value.filter((item) => item.level === 'error').length + (jsonError.value ? 1 : 0))
const warningCount = computed(() => issues.value.filter((item) => item.level === 'warning').length)
const hasErrors = computed(() => errorCount.value > 0)

const issuesFor = (area) => issues.value.filter((item) => item.area === area)
const firstError = (area) => issuesFor(area).find((item) => item.level === 'error')?.message
// The condition's own problems are shown inside the builder per node; here only what has no node (AUTO without any condition)
const conditionTopIssues = computed(() => (draft.value?.condition ? [] : issuesFor('condition')))

// ---------- key ----------
// Lower-cased and Persian digits converted as the user types; the pattern itself is validated (a bad key is shown, not corrected)
const onKey = (value) => {
  draft.value.key = toLatinDigits(value).toLowerCase().trim()
}
const renameCount = computed(() =>
  draft.value && typeof draft.value.key === 'string' ? countRenameReferences(props.steps, props.index, draft.value.key) : 0
)

// ---------- type ----------
const discardList = computed(() => (pendingType.value ? discardedOnTypeChange(draft.value, pendingType.value) : []))

function requestType(newType) {
  if (newType === type.value) {
    pendingType.value = null
    return
  }
  // Nothing non-empty would be lost: change at once. Otherwise ask first (the alert above lists what goes).
  if (discardedOnTypeChange(draft.value, newType).length) pendingType.value = newType
  else applyType(newType)
}

function applyType(newType) {
  draft.value = applyTypeChange(draft.value, newType)
  pendingType.value = null
  jsonError.value = ''
  stashedDeadline = null
  amountText.value = isSet(draft.value.deadline?.amount) ? String(draft.value.deadline.amount) : ''
  repeatText.value = isSet(draft.value.deadline?.repeatEvery) ? String(draft.value.deadline.repeatEvery) : ''
}

// ---------- approvers (APPROVAL) ----------
const approversList = computed(() => (Array.isArray(draft.value?.approvers) ? draft.value.approvers : []))
const setApprovers = (list) => {
  draft.value.approvers = list
}
const addApprover = () => setApprovers([...approversList.value, { type: 'ROLE' }])
const removeApprover = (i) => setApprovers(approversList.value.filter((_, at) => at !== i))
const replaceApprover = (i, approver) => setApprovers(approversList.value.map((old, at) => (at === i ? approver : old)))
// A row of another type starts empty: roleId and userId belong to the old type
const setApproverType = (i, newType) => replaceApprover(i, { type: newType })
const setApproverRole = (i, roleId) => replaceApprover(i, { type: 'ROLE', roleId })
const setApproverUser = (i, userId) => replaceApprover(i, { type: 'USER', userId })

// An id stored on the step but not in the loaded options stays selectable (and is kept on save unless the user picks another). The label
// says «ناشناخته» only when the options did load; if they did not, nothing can be claimed about the id.
const unknownSuffix = computed(() => (optionsReady.value ? ' (ناشناخته)' : ''))
const roleItems = (selectedId) => {
  const items = props.approvers.roles.map((role) => ({ value: role.id, label: role.title || role.name }))
  if (isSet(selectedId) && !items.some((item) => item.value === selectedId)) {
    items.unshift({ value: selectedId, label: `نقش #${fa(selectedId)}${unknownSuffix.value}` })
  }
  return items
}
const userItems = (selectedId) => {
  const items = props.approvers.users.map((user) => ({
    value: user.id,
    label: props.approvers.userNames[user.id] ?? user.username,
  }))
  if (isSet(selectedId) && !items.some((item) => item.value === selectedId)) {
    const known = props.approvers.userNames[selectedId]
    items.unshift({ value: selectedId, label: known ?? `کارمند #${fa(selectedId)}${unknownSuffix.value}` })
  }
  return items
}
// The list holds at most 100 staff, so a stored user may be missing from it without being wrong: a warning, not an error
const unknownUserIssues = computed(() =>
  optionsReady.value
    ? approversList.value
        .map((approver, i) => ({ approver, i }))
        .filter(({ approver }) => approver.type === 'USER' && isSet(approver.userId) && props.approvers.userNames[approver.userId] === undefined)
        .map(({ approver, i }) => ({
          level: 'warning',
          message: `گیرنده‌ی ${fa(i + 1)}: کارمند #${fa(approver.userId)} در فهرست بارگذاری‌شده نیست (فهرست حداکثر ${fa(100)} کارمند را نشان می‌دهد؛ با جستجو پیدایش کنید). تا عوضش نکنید همین مقدار ذخیره می‌شود.`,
        }))
    : []
)
// Closing the picker drops the search and brings the first list back
const onUserMenuOpen = (isOpen) => {
  if (!isOpen) props.approvers.searchUsers('')
}

// ---------- attachments (APPROVAL) ----------
// OPTIONAL is sent as null (BACK reads a missing or null value as OPTIONAL); the other two as they are. Untouched, nothing is written.
const attachmentsMode = computed({
  get: () => draft.value.attachments || 'OPTIONAL',
  set: (mode) => {
    draft.value.attachments = mode === 'OPTIONAL' ? null : mode
  },
})

// ---------- deadline (APPROVAL) ----------
const deadlineOn = computed(() => Boolean(draft.value?.deadline) && typeof draft.value.deadline === 'object')
const overdue = computed(() => draft.value?.deadline?.onOverdue || 'NONE')
const hasRepeat = computed(() => isSet(draft.value?.deadline?.repeatEvery))

function toggleDeadline(on) {
  if (on) {
    draft.value.deadline = stashedDeadline ?? { amount: 1, unit: 'WORKING_DAYS', onOverdue: 'NONE' }
    amountText.value = isSet(draft.value.deadline.amount) ? String(draft.value.deadline.amount) : ''
    repeatText.value = isSet(draft.value.deadline.repeatEvery) ? String(draft.value.deadline.repeatEvery) : ''
    stashedDeadline = null
  } else {
    stashedDeadline = draft.value.deadline
    delete draft.value.deadline
  }
}

// Text typed on a Persian keyboard: parseQuantity reads it. Text that is not a whole number stores null (amount) or 0 (repeat), which the
// validation reports as out of range, so the user sees why «تأیید» is off instead of the value being quietly dropped.
const onAmount = (value) => {
  amountText.value = value
  draft.value.deadline.amount = parseQuantity(value)
}
const onRepeat = (value) => {
  repeatText.value = value
  if (!String(value).trim()) {
    delete draft.value.deadline.repeatEvery
    return
  }
  draft.value.deadline.repeatEvery = parseQuantity(value) ?? 0
}

// Leaving ESCALATE drops the escalation roles (the second one is an error without it); NONE drops the repeat too
function setOverdue(value) {
  const deadline = draft.value.deadline
  deadline.onOverdue = value
  if (value !== 'ESCALATE') {
    delete deadline.escalateToRoleId
    delete deadline.escalateAgainToRoleId
  }
  if (value === 'NONE') {
    delete deadline.repeatEvery
    repeatText.value = ''
  }
}
const setEscalateAgain = (value) => {
  if (value === NO_ROLE) delete draft.value.deadline.escalateAgainToRoleId
  else draft.value.deadline.escalateAgainToRoleId = value
}

// ---------- condition (every type) ----------
const conditionOn = computed(() => isSet(draft.value?.condition))
const fieldsKnown = computed(() => Boolean(props.subject))
const conditionFields = computed(() =>
  conditionFieldsFor(props.subject, props.steps.slice(0, props.index), optionsReady.value ? props.approvers.systemActions : [])
)

function toggleCondition(on) {
  if (on) {
    draft.value.condition = stashedCondition ?? newGroup()
    stashedCondition = null
  } else {
    stashedCondition = draft.value.condition
    delete draft.value.condition
  }
}

// ---------- JSON editor (ACTION, WAIT, AUTO) ----------
const targets = computed(() => goToTargets(props.steps.map((other, i) => (i === props.index ? draft.value : other)), props.index, type.value))

// ---------- accept ----------
function submit() {
  if (!draft.value) return
  // Text typed in the JSON box and never blurred (Enter in another field) is applied first; invalid text stops here
  if (jsonEditor.value && !jsonEditor.value.commit()) return
  if (hasErrors.value) return
  // Nothing really changed: hand back the original object, so the page stays clean
  const result = sameStep(original.value, draft.value) ? original.value : draft.value
  emit('done', cloneJson(result))
  emit('update:open', false)
}
</script>
