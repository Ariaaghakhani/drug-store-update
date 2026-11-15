<!-- components/panel/workflow/StepCard.vue -->
<template>
  <div
    class="rounded-xl border bg-white dark:bg-gray-800 px-4 py-3"
    :class="errors.length ? 'border-error' : 'border-gray-200 dark:border-gray-700'"
  >
    <div class="flex items-start gap-3">
      <span
        class="w-8 h-8 flex-shrink-0 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold flex items-center justify-center"
      >
        {{ (index + 1).toLocaleString('fa-IR') }}
      </span>

      <div class="flex-1 min-w-0 space-y-2">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white min-w-0 break-words">{{ step.title || '—' }}</h3>
          <UBadge :color="type === 'APPROVAL' ? 'primary' : 'info'" variant="subtle" size="xs">{{ labelOf(STEP_TYPE_LABELS, type) }}</UBadge>
          <UBadge v-if="step.condition" color="warning" variant="subtle" size="xs" icon="i-heroicons-funnel">شرط دارد</UBadge>
          <span
            class="text-xs font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded px-2 py-0.5"
            dir="ltr"
          >
            {{ step.key }}
          </span>
        </div>

        <dl class="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <div v-for="row in summaryRows" :key="row.label" class="flex flex-wrap gap-x-2">
            <dt class="text-gray-400 dark:text-gray-500">{{ row.label }}:</dt>
            <dd class="min-w-0 break-words" :dir="row.ltr ? 'ltr' : undefined">{{ row.value }}</dd>
          </div>
        </dl>
      </div>

      <div v-if="!readonly" class="flex flex-shrink-0 items-center gap-1">
        <UButton
          color="neutral"
          variant="ghost"
          square
          size="xs"
          icon="i-heroicons-arrow-up"
          aria-label="انتقال به بالا"
          :disabled="disabled || index === 0"
          @click="emit('move-up')"
        />
        <UButton
          color="neutral"
          variant="ghost"
          square
          size="xs"
          icon="i-heroicons-arrow-down"
          aria-label="انتقال به پایین"
          :disabled="disabled || index === total - 1"
          @click="emit('move-down')"
        />
        <!-- The step editor is C22d: the button stays disabled until the page passes `edit-enabled` -->
        <UButton
          color="neutral"
          variant="outline"
          size="xs"
          icon="i-heroicons-pencil-square"
          :disabled="disabled || !editEnabled"
          @click="emit('edit')"
        >
          ویرایش
        </UButton>
        <UButton
          color="error"
          variant="ghost"
          square
          size="xs"
          icon="i-heroicons-trash"
          aria-label="حذف مرحله"
          :disabled="disabled"
          @click="emit('remove')"
        />
      </div>
    </div>

    <ul v-if="errors.length" class="mt-3 space-y-1">
      <li v-for="(message, i) in errors" :key="i" class="flex items-start gap-2 text-xs text-error">
        <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 flex-shrink-0" />
        <span>{{ message }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { labelOf } from '~/utils/enumMeta.js'
import { stepTypeOf } from '~/utils/workflowDefinition.js'
import {
  APPROVER_TYPE_LABELS,
  ATTACHMENT_MODE_LABELS,
  AUTO_DECISION_LABELS,
  COMPLETION_LABELS,
  DEADLINE_UNIT_LABELS,
  OVERDUE_ACTION_LABELS,
  STEP_TYPE_LABELS,
  WAIT_TIMEOUT_LABELS,
} from '~/utils/workflowMeta.js'

// One step of a definition in the editor's list (presentational: it never changes `step`). A summary only; the step editor is C22d.
// Props: `step` (BACK's WorkflowStepDTO, any fields, a missing `type` means APPROVAL), `index` (0-based), `total`, `errors` (strings of the
// last validation for this step), `readonly` (hides the buttons), `disabled` (a save is running), `editEnabled` (C22d switches it on),
// `approverNames` (`{roles: {<id>: title}, users: {<id>: name}}`, optional: without it a role or user shows as «نقش #id»).
// Emits `move-up`, `move-down`, `edit`, `remove`.
const props = defineProps({
  step: { type: Object, required: true },
  index: { type: Number, required: true },
  total: { type: Number, required: true },
  errors: { type: Array, default: () => [] },
  readonly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  editEnabled: { type: Boolean, default: false },
  approverNames: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['move-up', 'move-down', 'edit', 'remove'])

const type = computed(() => stepTypeOf(props.step))

// «نقش #۱۲»: an approver without an id (or a type this card does not know) shows its label only
const idText = (label, id) => (id === null || id === undefined ? label : `${label} #${Number(id).toLocaleString('fa-IR')}`)

const approverText = (approver) => {
  if (!approver) return '—'
  const label = labelOf(APPROVER_TYPE_LABELS, approver.type)
  if (approver.type === 'ROLE') return props.approverNames.roles?.[approver.roleId] || idText(label, approver.roleId)
  if (approver.type === 'USER') return props.approverNames.users?.[approver.userId] || idText(label, approver.userId)
  return label
}

const deadlineText = (deadline) => {
  const amount = Number(deadline.amount)
  const base = `${Number.isFinite(amount) ? amount.toLocaleString('fa-IR') : '—'} ${labelOf(DEADLINE_UNIT_LABELS, deadline.unit)}`
  return deadline.onOverdue && deadline.onOverdue !== 'NONE'
    ? `${base}؛ پس از مهلت: ${labelOf(OVERDUE_ACTION_LABELS, deadline.onOverdue)}`
    : base
}

// What the card tells about the step, by type. Only what is set is listed.
const summaryRows = computed(() => {
  const step = props.step
  const rows = []
  if (type.value === 'APPROVAL') {
    rows.push({
      label: 'گیرندگان',
      value: step.approvers?.length ? step.approvers.map(approverText).join('، ') : 'هنوز گیرنده‌ای انتخاب نشده',
    })
    if (step.completion) rows.push({ label: 'تکمیل', value: labelOf(COMPLETION_LABELS, step.completion) })
    if (step.attachments && step.attachments !== 'OPTIONAL') {
      rows.push({ label: 'پیوست', value: labelOf(ATTACHMENT_MODE_LABELS, step.attachments) })
    }
  } else if (type.value === 'ACTION') {
    rows.push({ label: 'اقدام', value: step.systemAction?.code || 'هنوز انتخاب نشده', ltr: Boolean(step.systemAction?.code) })
  } else if (type.value === 'WAIT') {
    rows.push({ label: 'رویداد', value: step.waitEvent?.code || 'هنوز انتخاب نشده', ltr: Boolean(step.waitEvent?.code) })
    if (step.waitEvent?.onTimeout) {
      rows.push({ label: 'پس از مهلت', value: labelOf(WAIT_TIMEOUT_LABELS, step.waitEvent.onTimeout) })
    }
  } else if (type.value === 'AUTO') {
    rows.push({ label: 'تصمیم', value: step.autoDecision ? labelOf(AUTO_DECISION_LABELS, step.autoDecision) : 'هنوز انتخاب نشده' })
  }
  if (step.deadline) rows.push({ label: 'مهلت', value: deadlineText(step.deadline) })
  if (step.goTo) rows.push({ label: 'رفتن به', value: step.goTo, ltr: true })
  return rows
})
</script>
