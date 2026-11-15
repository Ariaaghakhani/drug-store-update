<!-- components/panel/workflow/ConditionBuilder.vue -->
<template>
  <!-- ===== group: ALL / ANY of items ===== -->
  <div
    v-if="group"
    class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-3 space-y-3"
  >
    <div class="flex flex-wrap items-center gap-2">
      <USelect
        :model-value="modelValue.join"
        :items="JOIN_ITEMS"
        placeholder="نوع گروه"
        size="sm"
        class="w-full sm:w-72"
        :disabled="disabled"
        @update:model-value="setJoin"
      />
      <span class="text-xs text-gray-500 dark:text-gray-400">
        {{ modelValue.items.length.toLocaleString('fa-IR') }} از {{ MAX_CONDITION_ITEMS.toLocaleString('fa-IR') }} شرط
      </span>
      <div class="ms-auto flex flex-wrap items-center gap-1">
        <UButton
          color="neutral"
          variant="outline"
          size="xs"
          icon="i-heroicons-plus"
          :disabled="disabled || !canAddItem"
          @click="addItem(newLeaf())"
        >
          شرط
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          size="xs"
          icon="i-heroicons-squares-plus"
          :disabled="disabled || !canAddItem || !canAddGroup"
          :title="canAddGroup ? undefined : `حداکثر ${MAX_CONDITION_DEPTH.toLocaleString('fa-IR')} سطح گروه`"
          @click="addItem(newGroup())"
        >
          گروه
        </UButton>
        <UButton
          v-if="removable"
          color="error"
          variant="ghost"
          square
          size="xs"
          icon="i-heroicons-trash"
          aria-label="حذف گروه"
          :disabled="disabled"
          @click="emit('remove')"
        />
      </div>
    </div>

    <p v-if="issue" class="flex items-start gap-1 text-xs text-error">
      <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 flex-shrink-0" />
      <span>{{ issue }}</span>
    </p>

    <ul v-if="modelValue.items.length" class="space-y-2">
      <li v-for="(item, i) in modelValue.items" :key="i">
        <!-- A component may refer to itself by its own file name (Vue resolves it), so the recursion needs no import -->
        <ConditionBuilder
          :model-value="item"
          :fields="fields"
          :fields-known="fieldsKnown"
          :depth="depth + 1"
          :disabled="disabled"
          removable
          @update:model-value="setItem(i, $event)"
          @remove="removeItem(i)"
        />
      </li>
    </ul>
  </div>

  <!-- ===== leaf: field, operator, value ===== -->
  <div
    v-else
    class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 space-y-2"
  >
    <div class="flex flex-wrap items-start gap-2">
      <div class="w-full sm:w-64">
        <USelectMenu
          :model-value="modelValue.field || undefined"
          :items="fieldItems"
          value-key="value"
          placeholder="انتخاب فیلد"
          :search-input="{ placeholder: 'جستجوی فیلد' }"
          size="sm"
          class="w-full"
          :disabled="disabled"
          @update:model-value="setField"
        />
      </div>
      <USelect
        :model-value="modelValue.operator || undefined"
        :items="operatorItems"
        placeholder="عملگر"
        size="sm"
        class="w-full sm:w-40"
        :disabled="disabled"
        @update:model-value="setOperator"
      />
      <div class="flex-1 min-w-40">
        <USelect
          v-if="fieldType === 'BOOLEAN'"
          :model-value="booleanText"
          :items="BOOLEAN_ITEMS"
          placeholder="انتخاب"
          size="sm"
          class="w-full"
          :disabled="disabled"
          @update:model-value="setBoolean"
        />
        <UInput
          v-else
          :model-value="text"
          :dir="fieldType === 'TEXT' || !fieldType ? 'auto' : 'ltr'"
          :inputmode="fieldType === 'NUMBER' ? 'decimal' : fieldType === 'ID' ? 'numeric' : undefined"
          :placeholder="valuePlaceholder"
          autocomplete="off"
          size="sm"
          class="w-full"
          :disabled="disabled"
          @update:model-value="onText"
        />
      </div>
      <UButton
        v-if="removable"
        color="error"
        variant="ghost"
        square
        size="xs"
        icon="i-heroicons-trash"
        aria-label="حذف شرط"
        :disabled="disabled"
        @click="emit('remove')"
      />
    </div>

    <p v-if="modelValue.field" class="text-xs text-gray-500 dark:text-gray-400 font-mono text-start" dir="ltr">
      {{ modelValue.field }}
    </p>
    <p v-if="textError" class="flex items-start gap-1 text-xs text-error">
      <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 flex-shrink-0" />
      <span>{{ textError }}</span>
    </p>
    <p v-else-if="issue" class="flex items-start gap-1 text-xs text-error">
      <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 flex-shrink-0" />
      <span>{{ issue }}</span>
    </p>

    <!-- A single condition at the top can grow into a group -->
    <UButton
      v-if="depth === 1"
      color="neutral"
      variant="ghost"
      size="xs"
      icon="i-heroicons-plus"
      :disabled="disabled"
      @click="emit('update:modelValue', newGroup([modelValue, newLeaf()]))"
    >
      افزودن شرط دیگر
    </UButton>
  </div>
</template>

<script setup>
import { selectItems } from '~/utils/enumMeta.js'
import { OPERATOR_LABELS, operatorsFor } from '~/utils/workflowMeta.js'
import {
  MAX_CONDITION_DEPTH,
  MAX_CONDITION_ITEMS,
  fieldMapOf,
  isGroup,
  newGroup,
  newLeaf,
  nodeIssue,
  parseValueText,
  valueToText,
  withLeafField,
  withLeafOperator,
} from '~/utils/workflowCondition.js'

// Recursive, fully controlled editor of a step's run condition (C22e): `modelValue` in, `update:modelValue` out with a NEW node; the input
// is never mutated. A node is a group `{join: ALL|ANY, items[1..10]}` (nested up to 3 levels) or a leaf `{field, operator, value}`.
// Props: `modelValue` (the node), `fields` (`[{key, title, type}]` from `conditionFieldsFor`), `fieldsKnown` (false when the subject
// catalog did not load: only the shape is checked), `depth` (1 at the top; the parent passes depth + 1), `removable` (shows the trash
// button; the parent decides what removing means), `disabled`. Emits `update:modelValue` and `remove`.
// Values are typed: numbers as numbers (NUMBER, ID), booleans as booleans, text as text, and IN as an array. The value input keeps the
// raw text locally while the user types and emits the parsed value (`null` while it does not parse yet).
const props = defineProps({
  modelValue: { type: Object, required: true },
  fields: { type: Array, default: () => [] },
  fieldsKnown: { type: Boolean, default: true },
  depth: { type: Number, default: 1 },
  removable: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'remove'])

const JOIN_ITEMS = [
  { value: 'ALL', label: 'همه‌ی این شرط‌ها درست باشند' },
  { value: 'ANY', label: 'دست‌کم یکی از این شرط‌ها درست باشد' },
]
const BOOLEAN_ITEMS = [
  { value: 'true', label: 'بله' },
  { value: 'false', label: 'خیر' },
]

const group = computed(() => isGroup(props.modelValue))
const fieldMap = computed(() => fieldMapOf(props.fields))
const issue = computed(() => nodeIssue(props.modelValue, props.depth, fieldMap.value, props.fieldsKnown))

// ---------- group ----------
const canAddItem = computed(() => props.modelValue.items.length < MAX_CONDITION_ITEMS)
const canAddGroup = computed(() => props.depth < MAX_CONDITION_DEPTH)

const emitNode = (node) => emit('update:modelValue', node)
const setJoin = (join) => emitNode({ ...props.modelValue, join })
const addItem = (item) => emitNode({ ...props.modelValue, items: [...props.modelValue.items, item] })
const setItem = (index, item) =>
  emitNode({ ...props.modelValue, items: props.modelValue.items.map((old, i) => (i === index ? item : old)) })
const removeItem = (index) => emitNode({ ...props.modelValue, items: props.modelValue.items.filter((_, i) => i !== index) })

// ---------- leaf ----------
const fieldType = computed(() => fieldMap.value.get(props.modelValue.field)?.type)

// The stored field is always an option, even when the catalog does not list it (marked unknown, kept until the user picks another)
const fieldItems = computed(() => {
  const items = props.fields.map((field) => ({ value: field.key, label: field.title }))
  const stored = props.modelValue.field
  if (stored && !fieldMap.value.has(stored)) items.unshift({ value: stored, label: `${stored} (ناشناخته)` })
  return items
})

const operatorItems = computed(() => {
  const allowed = operatorsFor(fieldType.value)
  const items = selectItems(OPERATOR_LABELS).filter((item) => allowed.includes(item.value))
  const stored = props.modelValue.operator
  // An operator the type does not allow (imported data) stays visible so the user sees what is wrong
  if (stored && !allowed.includes(stored)) items.unshift({ value: stored, label: `${labelOfOperator(stored)} (مجاز نیست)` })
  return items
})
const labelOfOperator = (operator) => OPERATOR_LABELS[operator] ?? operator

const valuePlaceholder = computed(() => {
  if (props.modelValue.operator === 'IN') return 'مقدارها را با ویرگول جدا کنید'
  if (fieldType.value === 'NUMBER') return 'عدد'
  if (fieldType.value === 'ID') return 'شناسه (عدد صحیح)'
  return 'مقدار'
})

const setField = (key) => {
  const next = fieldMap.value.get(key)
  const leaf = withLeafField(props.modelValue, key, next?.type, fieldType.value)
  text.value = valueToText(leaf.value)
  textError.value = ''
  emitNode(leaf)
}
const setOperator = (operator) => {
  const leaf = withLeafOperator(props.modelValue, operator)
  if (leaf.value === null) {
    text.value = ''
    textError.value = ''
  }
  emitNode(leaf)
}

// BOOLEAN: a select
const booleanText = computed(() => (props.modelValue.value === true ? 'true' : props.modelValue.value === false ? 'false' : undefined))
const setBoolean = (choice) => emitNode({ ...props.modelValue, value: choice === 'true' })

// Other types: the raw text lives here while the user types; the parsed value goes up. While it does not parse, `null` goes up (the
// parent shows the node as incomplete) and the error stays under the input.
const text = ref(valueToText(props.modelValue.value))
const textError = ref('')

const onText = (raw) => {
  text.value = raw
  if (!String(raw).trim()) {
    textError.value = ''
    emitNode({ ...props.modelValue, value: null })
    return
  }
  const parsed = parseValueText(fieldType.value, props.modelValue.operator, raw)
  textError.value = parsed.ok ? '' : parsed.error
  emitNode({ ...props.modelValue, value: parsed.ok ? parsed.value : null })
}

// The value changed from outside (another leaf moved into this slot, a field or operator change): show it. The text the user is typing
// is left alone as long as it still means the stored value (or nothing, while it does not parse).
watch(
  () => [props.modelValue.field, props.modelValue.operator, JSON.stringify(props.modelValue.value ?? null)],
  () => {
    if (group.value) return
    const stored = props.modelValue.value ?? null
    const parsed = parseValueText(fieldType.value, props.modelValue.operator, text.value)
    const inSync = parsed.ok ? JSON.stringify(parsed.value) === JSON.stringify(stored) : stored === null
    if (!inSync) {
      text.value = valueToText(stored)
      textError.value = ''
    }
  }
)
</script>
