<!-- components/panel/attributes/AssignAttributeModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    :title="assignment ? 'تنظیمات ویژگی دسته' : 'نسبت دادن ویژگی به دسته'"
    icon="i-heroicons-link"
    :submit-label="assignment ? 'ذخیره' : 'نسبت دادن'"
    width="lg"
    :loading="saving"
    :submit-disabled="loadingAttributes"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <UFormField label="ویژگی" required :error="errors.attributeId">
      <USelect
        v-model="form.attributeId"
        :items="attributeItems"
        :disabled="!!assignment || loadingAttributes"
        placeholder="انتخاب ویژگی"
        class="w-full"
      />
    </UFormField>

    <p v-if="!assignment && !loadingAttributes && !attributeItems.length" class="text-xs text-gray-500 dark:text-gray-400">
      همه‌ی ویژگی‌های کتابخانه پیش‌تر به این دسته نسبت داده شده‌اند.
    </p>

    <UFormField label="ترتیب نمایش" :error="errors.sortOrder" help="عدد کوچک‌تر، بالاتر نمایش داده می‌شود">
      <UInput v-model="form.sortOrder" inputmode="numeric" dir="ltr" class="w-full" />
    </UFormField>

    <section class="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
      <label class="flex items-center justify-between gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        اجباری (هنگام ثبت کالا پر شود)
        <USwitch v-model="form.required" size="lg" :ui="SWITCH_UI" />
      </label>

      <label class="flex items-center justify-between gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        قابل فیلتر در جستجوی فروشگاه
        <USwitch v-model="form.filterable" size="lg" :ui="SWITCH_UI" />
      </label>

      <div>
        <label
          class="flex items-center justify-between gap-3 text-sm text-gray-700 dark:text-gray-300"
          :class="canBeAxis ? 'cursor-pointer' : 'opacity-60'"
        >
          محور تنوع کالا (رنگ، سایز، …)
          <USwitch v-model="form.variantAxis" size="lg" :disabled="!canBeAxis" :ui="SWITCH_UI" />
        </label>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ variantAxisHint }}</p>
      </div>
    </section>
  </PanelFormModal>
</template>

<script setup>
// Assign one attribute to a category, or edit how an assigned one behaves there. The parent reloads on `saved`.
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import { apiErrorMessage, errorStatus, isPending } from '~/utils/apiError.js'
import { parseQuantity } from '~/utils/inventoryMeta.js'
import { useStoreProfile } from '~/composables/useStoreProfile.js'

const props = defineProps({
  open: { type: Boolean, required: true },
  // Category id as a string (the page's USelectMenu value)
  categoryId: { type: String, default: null },
  // CategoryAttributeDTO to edit, or null to assign
  assignment: { type: Object, default: null },
  // Attribute ids already assigned directly to this category; they are hidden from the picker on assign
  assignedIds: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:open', 'saved'])

const app = useNuxtApp()
const toast = useAppToast()
const { variantsEnabled } = useStoreProfile()

// Brand teal switch (DESIGN_SYSTEM "USwitch"): never color="teal"
const SWITCH_UI = {
  base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
}

const attributes = ref([])
const loadingAttributes = ref(false)

const form = reactive({
  attributeId: '',
  required: false,
  filterable: false,
  variantAxis: false,
  sortOrder: '0',
})

const errors = ref({})
const serverError = ref('')
const saving = ref(false)

// Assign mode lists the library minus the attributes this category already has directly
const attributeItems = computed(() => {
  const hidden = new Set(props.assignedIds.map(String))
  return attributes.value
    .filter((attribute) => !hidden.has(String(attribute.id)) || String(attribute.id) === form.attributeId)
    .map((attribute) => ({ label: attribute.name, value: String(attribute.id) }))
})

const selectedAttribute = computed(() => attributes.value.find((attribute) => String(attribute.id) === form.attributeId))

// Variant axes exist only with variants on and only for SELECT attributes (BACK: "فقط SELECT")
const canBeAxis = computed(() => Boolean(variantsEnabled.value) && selectedAttribute.value?.type === 'SELECT')

const variantAxisHint = computed(() => {
  if (!variantsEnabled.value) return 'برای تعریف محور تنوع، ابتدا «تنوع کالا» را در تنظیمات فروشگاه روشن کنید.'
  if (selectedAttribute.value && selectedAttribute.value.type !== 'SELECT') {
    return 'فقط ویژگی‌های «انتخاب تکی» می‌توانند محور تنوع باشند.'
  }
  return 'کالاهای این دسته بر اساس گزینه‌های این ویژگی تنوع می‌گیرند.'
})

const loadAttributes = async () => {
  loadingAttributes.value = true
  try {
    const res = await app.$api.catalogAdmin.listAttributes()
    attributes.value = res.data.data ?? []
  } catch (e) {
    attributes.value = []
    serverError.value = apiErrorMessage(e, 'دریافت فهرست ویژگی‌ها ناموفق بود')
  } finally {
    loadingAttributes.value = false
  }
}

// Every open starts from the assignment being edited, or from empty defaults for a new one
const initForm = () => {
  const source = props.assignment
  Object.assign(form, {
    attributeId: source?.attribute?.id != null ? String(source.attribute.id) : '',
    required: Boolean(source?.required),
    filterable: Boolean(source?.filterable),
    variantAxis: Boolean(source?.variantAxis),
    sortOrder: String(source?.sortOrder ?? 0),
  })
  errors.value = {}
  serverError.value = ''
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    initForm()
    loadAttributes()
  }
)

// Changing the attribute can take away the axis option
watch(canBeAxis, (allowed) => {
  if (!allowed) form.variantAxis = false
})

const validate = () => {
  errors.value = {}
  if (!form.attributeId) errors.value.attributeId = 'ویژگی را انتخاب کنید'

  const text = form.sortOrder.trim()
  const sortOrder = text === '' ? 0 : parseQuantity(text)
  if (sortOrder === null) errors.value.sortOrder = 'فقط عدد صحیح و مثبت'
  return Object.keys(errors.value).length === 0
}

const submit = async () => {
  if (saving.value || !validate()) return
  saving.value = true
  serverError.value = ''
  try {
    const res = await app.$api.catalogAdmin.assignCategoryAttribute({
      data: {
        categoryId: Number(props.categoryId),
        attributeId: Number(form.attributeId),
        required: form.required,
        filterable: form.filterable,
        variantAxis: canBeAxis.value && form.variantAxis,
        sortOrder: parseQuantity(form.sortOrder.trim() || '0') ?? 0,
      },
    })
    if (isPending(res)) {
      emit('update:open', false)
      emit('saved')
      return
    }
    toast.success('ویژگی دسته ذخیره شد')
    emit('update:open', false)
    emit('saved')
  } catch (e) {
    // 400 and 409 messages from BACK stay inside the modal; anything else toasts
    const status = errorStatus(e)
    if (status === 400 || status === 409) serverError.value = apiErrorMessage(e, 'ذخیره ویژگی دسته ناموفق بود')
    else toast.error(apiErrorMessage(e, 'ذخیره ویژگی دسته ناموفق بود'))
  } finally {
    saving.value = false
  }
}
</script>
