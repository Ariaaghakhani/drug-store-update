<template>
  <div class="space-y-2">
    <label class="text-xs font-medium text-gray-700 dark:text-gray-300">
      عکس کالا (اختیاری، حداکثر {{ max.toLocaleString('fa-IR') }} عکس)
    </label>

    <div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
      <div
        v-for="preview in previews"
        :key="preview.url"
        class="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
      >
        <img :src="preview.url" :alt="preview.file.name" class="w-full h-full object-cover">
        <button
          type="button"
          aria-label="حذف عکس"
          class="absolute top-1 end-1 w-7 h-7 rounded-full bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-error"
          @click="removeAt(preview.file)"
        >
          <UIcon name="i-heroicons-x-mark" class="w-4 h-4 text-error" />
        </button>
      </div>

      <button
        v-if="!atLimit"
        type="button"
        class="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1 text-gray-400 dark:text-gray-500 hover:border-brand-500 hover:text-brand-500 dark:hover:border-brand-400 dark:hover:text-brand-400 transition-colors"
        @click="fileInput?.click()"
      >
        <UIcon name="i-heroicons-arrow-up-tray" class="w-5 h-5" />
        <span class="text-xs font-medium">افزودن عکس</span>
      </button>

      <input
        ref="fileInput"
        type="file"
        :accept="ACCEPTED_TYPES.join(',')"
        multiple
        class="hidden"
        @change="onPick"
      >
    </div>

    <p v-if="limitError" class="text-xs text-error">
      حداکثر {{ max.toLocaleString('fa-IR') }} عکس می‌توانید ضمیمه کنید
    </p>
    <p v-if="fileError" class="text-xs text-error">{{ fileError }}</p>
  </div>
</template>

<script setup>
// Photos for a return request. v-model is a File[] of local picks only (nothing is uploaded here; the parent sends
// them after the return exists). Thumbnails are object URLs owned by this component: each one is revoked when its
// photo is removed or the component unmounts.
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
// BACK's spring.servlet.multipart.max-file-size
const MAX_BYTES = 20 * 1024 * 1024

const props = defineProps({
  modelValue: { type: Array, required: true },
  max: { type: Number, default: 5 },
})
const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const limitError = ref(false)
const fileError = ref('')

const atLimit = computed(() => props.modelValue.length >= props.max)

const thumbs = new Map() // File -> object URL
const previews = ref([]) // { file, url } in modelValue order

watch(
  () => props.modelValue,
  (files) => {
    const keep = new Set(files)
    for (const [file, url] of thumbs) {
      if (!keep.has(file)) {
        URL.revokeObjectURL(url)
        thumbs.delete(file)
      }
    }
    for (const file of files) {
      if (!thumbs.has(file)) thumbs.set(file, URL.createObjectURL(file))
    }
    previews.value = files.map((file) => ({ file, url: thumbs.get(file) }))
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  for (const url of thumbs.values()) URL.revokeObjectURL(url)
  thumbs.clear()
})

const onPick = (event) => {
  const input = event.target
  const picked = Array.from(input.files ?? [])
  input.value = ''

  let rejected = false
  const valid = picked.filter((file) => {
    const ok = ACCEPTED_TYPES.includes(file.type) && file.size <= MAX_BYTES
    if (!ok) rejected = true
    return ok
  })

  const room = Math.max(props.max - props.modelValue.length, 0)
  const accepted = valid.slice(0, room)
  limitError.value = valid.length > accepted.length
  fileError.value = rejected
    ? `فقط عکس با فرمت JPG، PNG یا WebP و حجم تا ${(MAX_BYTES / (1024 * 1024)).toLocaleString('fa-IR')} مگابایت ثبت می‌شود`
    : ''

  if (accepted.length) emit('update:modelValue', [...props.modelValue, ...accepted])
}

const removeAt = (file) => {
  limitError.value = false
  emit(
    'update:modelValue',
    props.modelValue.filter((item) => item !== file)
  )
}
</script>
