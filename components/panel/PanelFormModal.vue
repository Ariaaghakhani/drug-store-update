<!-- components/panel/PanelFormModal.vue -->
<template>
  <UModal
    :open="open"
    :dismissible="!loading"
    :ui="{ content: widthClass }"
    @update:open="emit('update:open', $event)"
  >
    <template #header>
      <div class="flex items-center gap-3 min-w-0" dir="rtl">
        <UIcon v-if="icon" :name="icon" class="w-5 h-5 flex-shrink-0 text-brand-500 dark:text-brand-400" />
        <h3 class="text-base font-bold text-gray-900 dark:text-white truncate">{{ title }}</h3>
      </div>
    </template>

    <template #body>
      <!-- The footer buttons sit outside the form, so the submit button points at it with `form` -->
      <form :id="formId" dir="rtl" class="space-y-4 font-dana" @submit.prevent="onSubmit">
        <slot />
      </form>
    </template>

    <template #footer>
      <div class="flex w-full items-center gap-2" dir="rtl">
        <slot name="footer-start" />
        <div class="ms-auto flex items-center gap-2">
          <UButton color="neutral" variant="soft" :disabled="loading" @click="emit('update:open', false)">
            انصراف
          </UButton>
          <UButton
            type="submit"
            :form="formId"
            color="primary"
            :loading="loading"
            :disabled="loading || submitDisabled"
          >
            {{ submitLabel }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup>
// Form dialog for panel writes. The parent owns the fields and the request; this only frames them.
const WIDTH_CLASSES = {
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  '2xl': 'sm:max-w-2xl',
}

const props = defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
  icon: { type: String, default: '' },
  submitLabel: { type: String, default: 'ذخیره' },
  loading: { type: Boolean, default: false },
  submitDisabled: { type: Boolean, default: false },
  width: {
    type: String,
    default: 'md',
    validator: (value) => ['md', 'lg', '2xl'].includes(value),
  },
})

const emit = defineEmits(['update:open', 'submit'])

const widthClass = computed(() => WIDTH_CLASSES[props.width])
const formId = `panel-form-${useId()}`

// Enter in a field and the footer button both come through here: ignore them while busy or disabled.
const onSubmit = () => {
  if (props.loading || props.submitDisabled) return
  emit('submit')
}
</script>
