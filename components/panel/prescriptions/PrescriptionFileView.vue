<template>
  <div>
    <div v-if="state === 'loading'" class="h-64 w-full">
      <USkeleton class="h-full w-full rounded-xl" />
    </div>

    <PanelEmptyState
      v-else-if="state === 'error'"
      variant="error"
      title="بارگذاری فایل ناموفق بود"
    >
      <template #action>
        <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
          تلاش دوباره
        </UButton>
      </template>
    </PanelEmptyState>

    <div
      v-else-if="isPdf"
      class="flex flex-col items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-800 p-6"
    >
      <UIcon name="i-heroicons-document-text" class="w-10 h-10 text-gray-400 dark:text-gray-600" />
      <p class="text-sm text-gray-500 dark:text-gray-400">این فایل PDF است</p>
      <UButton color="neutral" variant="outline" icon="i-heroicons-arrow-top-right-on-square" @click="openPdf">
        باز کردن PDF
      </UButton>
    </div>

    <div
      v-else
      class="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800"
    >
      <img :src="url" :alt="alt" class="w-full h-auto">
    </div>
  </div>
</template>

<script setup>
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'

// Shows one binary file of a prescription (image, or PDF as a button). The blob comes from `loader`, a function that
// returns the blob request (e.g. () => $api.prescription.imageRequest(false, id)). Object URLs are revoked on unmount.
const props = defineProps({
  loader: { type: Function, required: true },
  alt: { type: String, default: 'فایل نسخه' },
})

const state = ref('loading') // loading | ready | error
const url = ref('')
const isPdf = ref(false)
let unmounted = false

const revoke = () => {
  if (url.value) URL.revokeObjectURL(url.value)
  url.value = ''
}

async function load() {
  state.value = 'loading'
  revoke()
  try {
    const response = await props.loader()
    const blob = response?.data
    if (!(blob instanceof Blob)) throw new Error('file.no-blob')
    // The page left while the file was loading: do not create an object URL nobody will revoke
    if (unmounted) return
    isPdf.value = blob.type === 'application/pdf'
    url.value = URL.createObjectURL(blob)
    state.value = 'ready'
  } catch {
    state.value = 'error'
  }
}

const openPdf = () => {
  if (url.value) window.open(url.value, '_blank', 'noopener')
}

onMounted(load)

onBeforeUnmount(() => {
  unmounted = true
  revoke()
})
</script>
