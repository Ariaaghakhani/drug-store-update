<!-- components/panel/attributes/AttributeFormModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    :title="attribute ? 'ویرایش ویژگی' : 'ویژگی جدید'"
    icon="i-heroicons-adjustments-horizontal"
    :submit-label="attribute ? 'ذخیره' : 'ساخت ویژگی'"
    width="lg"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UFormField label="نام" required :error="errors.name">
        <UInput v-model="form.name" :maxlength="100" class="w-full" placeholder="مثال: رنگ" />
      </UFormField>

      <UFormField label="نوع" required :error="errors.type">
        <USelect v-model="form.type" :items="ATTRIBUTE_TYPE_ITEMS" class="w-full" />
      </UFormField>
    </div>

    <UFormField v-if="form.type === 'NUMBER'" label="واحد" :error="errors.unit" help="مثال: گرم، اینچ — اختیاری">
      <UInput v-model="form.unit" :maxlength="30" class="w-full" />
    </UFormField>

    <section v-if="hasOptions(form.type)" class="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
      <div class="flex items-center justify-between gap-2">
        <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">گزینه‌ها</h4>
        <span class="text-xs text-gray-400 dark:text-gray-500">ترتیب نمایش همین فهرست است</span>
      </div>

      <p v-if="errors.options" class="text-xs text-error" role="alert">{{ errors.options }}</p>

      <ul class="space-y-2">
        <li v-for="(option, index) in form.options" :key="option.key" class="flex items-center gap-2">
          <UInput
            v-model="option.value"
            :maxlength="100"
            :aria-label="`گزینه ${(index + 1).toLocaleString('fa-IR')}`"
            :color="optionError(option) ? 'error' : 'primary'"
            class="flex-1 min-w-0"
          />
          <UButton
            color="neutral"
            variant="ghost"
            square
            size="xs"
            icon="i-heroicons-arrow-up"
            aria-label="بالا بردن"
            :disabled="index === 0"
            @click="move(index, -1)"
          />
          <UButton
            color="neutral"
            variant="ghost"
            square
            size="xs"
            icon="i-heroicons-arrow-down"
            aria-label="پایین بردن"
            :disabled="index === form.options.length - 1"
            @click="move(index, 1)"
          />
          <UButton
            color="error"
            variant="ghost"
            square
            size="xs"
            icon="i-heroicons-trash"
            aria-label="حذف گزینه"
            @click="removeOption(index)"
          />
        </li>
      </ul>

      <UButton color="neutral" variant="soft" size="sm" icon="i-heroicons-plus" @click="addOption">
        افزودن گزینه
      </UButton>
    </section>
  </PanelFormModal>
</template>

<script setup>
// Create or edit one goods attribute. Options exist only for SELECT / MULTI_SELECT. The parent reloads on `saved`.
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import { apiErrorMessage, errorStatus, isPending } from '~/utils/apiError.js'
import { ATTRIBUTE_TYPE_ITEMS, hasOptions } from '~/utils/attributeMeta.js'

const props = defineProps({
  open: { type: Boolean, required: true },
  // AttributeDefinitionDTO to edit, or null to create
  attribute: { type: Object, default: null },
})

const emit = defineEmits(['update:open', 'saved'])

const app = useNuxtApp()
const toast = useAppToast()

const MAX_NAME = 100
const MAX_UNIT = 30
const MAX_OPTION = 100

// Local key for each option row, so a row keeps its identity while the list is reordered or edited
let nextKey = 0
const newOption = (value = '', id = null) => ({ key: ++nextKey, id, value })

const emptyForm = () => ({ name: '', type: 'SELECT', unit: '', options: [] })

const form = reactive(emptyForm())
const errors = ref({})
const serverError = ref('')
const saving = ref(false)

// Loads the form from the attribute being edited (or the defaults for create) every time the modal opens
const initForm = () => {
  Object.assign(form, emptyForm())
  const source = props.attribute
  if (source) {
    form.name = source.name ?? ''
    form.type = source.type ?? 'TEXT'
    form.unit = source.unit ?? ''
    form.options = [...(source.options ?? [])]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((option) => newOption(option.value, option.id))
  }
  errors.value = {}
  serverError.value = ''
}

watch(
  () => [props.open, props.attribute],
  ([isOpen]) => {
    if (isOpen) initForm()
  },
  { immediate: true }
)

// A switch to an option type starts with one empty row; a switch away from it drops the options
watch(
  () => form.type,
  (type) => {
    if (hasOptions(type)) {
      if (!form.options.length) form.options.push(newOption())
    } else {
      form.options = []
    }
    if (type !== 'NUMBER') form.unit = ''
  }
)

const addOption = () => form.options.push(newOption())

const removeOption = (index) => form.options.splice(index, 1)

const move = (index, delta) => {
  const target = index + delta
  if (target < 0 || target >= form.options.length) return
  const [moved] = form.options.splice(index, 1)
  form.options.splice(target, 0, moved)
}

// A row is wrong when it is empty, too long, or repeats an earlier value
const optionError = (option) => {
  const value = option.value.trim()
  if (!value) return 'empty'
  if (value.length > MAX_OPTION) return 'long'
  const first = form.options.find((other) => other.value.trim() === value)
  return first !== option ? 'duplicate' : ''
}

const validate = () => {
  errors.value = {}

  const name = form.name.trim()
  if (!name) errors.value.name = 'نام را وارد کنید'
  else if (name.length > MAX_NAME) errors.value.name = `حداکثر ${MAX_NAME.toLocaleString('fa-IR')} نویسه`

  if (!form.type) errors.value.type = 'نوع را انتخاب کنید'

  if (form.type === 'NUMBER' && form.unit.trim().length > MAX_UNIT) {
    errors.value.unit = `حداکثر ${MAX_UNIT.toLocaleString('fa-IR')} نویسه`
  }

  if (hasOptions(form.type)) {
    if (!form.options.length) {
      errors.value.options = 'حداقل یک گزینه لازم است'
    } else if (form.options.some((option) => optionError(option))) {
      errors.value.options = 'گزینه‌ها باید خالی نباشند، تکراری نباشند و از ۱۰۰ نویسه بیشتر نشوند'
    }
  }

  return Object.keys(errors.value).length === 0
}

// Full body: options in list order (sortOrder = index), non-option types send null, unit only for NUMBER
const buildBody = () => ({
  name: form.name.trim(),
  type: form.type,
  unit: form.type === 'NUMBER' ? form.unit.trim() || null : null,
  options: hasOptions(form.type)
    ? form.options.map((option, index) => ({
        ...(option.id ? { id: option.id } : {}),
        value: option.value.trim(),
        sortOrder: index,
      }))
    : null,
})

const submit = async () => {
  if (saving.value || !validate()) return
  saving.value = true
  serverError.value = ''
  try {
    const data = buildBody()
    let res
    if (props.attribute) {
      res = await app.$api.catalogAdmin.updateAttribute({ data: { id: props.attribute.id, ...data } })
    } else {
      res = await app.$api.catalogAdmin.createAttribute({ data })
    }
    if (isPending(res)) {
      emit('update:open', false)
      emit('saved')
      return
    }
    toast.success('ویژگی ذخیره شد')
    emit('update:open', false)
    emit('saved')
  } catch (e) {
    // 400 stays inside the modal (for example a duplicate or a rule BACK rejects); other failures toast
    if (errorStatus(e) === 400) serverError.value = apiErrorMessage(e, 'اطلاعات ویژگی نامعتبر است')
    else toast.error(apiErrorMessage(e, 'ذخیره ویژگی ناموفق بود'))
  } finally {
    saving.value = false
  }
}
</script>
