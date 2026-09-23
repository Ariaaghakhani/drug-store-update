<template>
  <div class="space-y-2">
    <label class="text-xs font-medium text-gray-700 dark:text-gray-300">تصاویر محصول</label>

    <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
      <div
        v-for="(src, index) in modelValue"
        :key="index"
        class="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
      >
        <img :src="src" alt="" class="w-full h-full object-cover" />
        <button
          type="button"
          class="absolute top-1 end-1 w-6 h-6 rounded-full bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:border-error"
          @click="removeAt(index)"
        >
          <UIcon name="i-heroicons-x-mark" class="w-4 h-4 text-error" />
        </button>
      </div>

      <button
        type="button"
        class="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1 text-gray-400 dark:text-gray-500 hover:border-brand-500 hover:text-brand-500 dark:hover:border-brand-400 dark:hover:text-brand-400 transition-colors"
        @click="fileInput?.click()"
      >
        <UIcon name="i-heroicons-arrow-up-tray" class="w-5 h-5" />
        <span class="text-[11px] font-medium">افزودن تصویر</span>
      </button>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        class="hidden"
        @change="onFilesChange"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ modelValue: { type: Array, required: true } })
const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const onFilesChange = async (event) => {
  const input = event.target
  const files = Array.from(input.files ?? []).filter((f) => f.type.startsWith('image/'))
  if (files.length) {
    const urls = await Promise.all(files.map(readAsDataUrl))
    emit('update:modelValue', [...props.modelValue, ...urls])
  }
  input.value = ''
}

const removeAt = (index) => {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index))
}
</script>