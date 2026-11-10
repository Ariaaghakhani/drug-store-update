<!-- components/panel/PanelConfirmDialog.vue -->
<template>
  <UModal
    :open="open"
    :dismissible="!loading"
    :title="title"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div dir="rtl" class="space-y-4 font-dana">
        <p class="text-sm text-gray-600 dark:text-gray-300 leading-6">{{ message }}</p>
        <UFormField v-if="noteLabel" :label="noteLabel" :required="noteRequired">
          <UTextarea
            v-model="note"
            :rows="3"
            :maxlength="noteMax"
            class="w-full"
            :disabled="loading"
          />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full items-center gap-2" dir="rtl">
        <UButton class="ms-auto" color="neutral" variant="soft" :disabled="loading" @click="emit('update:open', false)">
          انصراف
        </UButton>
        <UButton
          :color="confirmColor"
          :loading="loading"
          :disabled="loading || confirmDisabled"
          @click="onConfirm"
        >
          {{ confirmLabel }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup>
// Confirm dialog with an optional note (e.g. the reason for a reject). The parent runs the action on `confirm`.
const props = defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'تأیید' },
  confirmColor: { type: String, default: 'primary' },
  loading: { type: Boolean, default: false },
  noteLabel: { type: String, default: '' },
  noteRequired: { type: Boolean, default: false },
  noteMax: { type: Number, default: 500 },
})

const emit = defineEmits(['update:open', 'confirm'])

const note = ref('')

// Every open starts with an empty note.
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) note.value = ''
  }
)

const confirmDisabled = computed(() => props.noteRequired && !note.value.trim())

const onConfirm = () => {
  if (props.loading || confirmDisabled.value) return
  emit('confirm', note.value.trim())
}
</script>
