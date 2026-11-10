<!-- components/panel/FilePickButton.vue -->
<template>
  <div class="inline-flex">
    <input ref="input" type="file" class="hidden" :accept="accept" :multiple="multiple" @change="onChange">
    <UButton
      color="neutral"
      variant="outline"
      :icon="icon"
      :loading="loading"
      :disabled="disabled || loading"
      @click="input?.click()"
    >
      {{ label }}
    </UButton>
  </div>
</template>

<script setup>
// Picks local files and emits them. It uploads nothing: the parent decides what to do with the File(s).
const props = defineProps({
  label: { type: String, required: true },
  icon: { type: String, default: 'i-heroicons-arrow-up-tray' },
  accept: { type: String, default: '' },
  multiple: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['pick'])
const input = ref(null)

const onChange = (event) => {
  const files = Array.from(event.target.files ?? [])
  // Reset so picking the same file again still fires `change`
  event.target.value = ''
  if (!files.length) return
  // With `multiple` the parent gets an array (even for one file); without it, a single File.
  emit('pick', props.multiple ? files : files[0])
}
</script>
