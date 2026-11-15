<!-- components/panel/workflow/DefinitionVersionsModal.vue -->
<template>
  <UModal :open="open" title="نسخه‌های منتشرشده" :ui="{ content: 'sm:max-w-2xl' }" @update:open="emit('update:open', $event)">
    <template #body>
      <div dir="rtl" class="space-y-4 font-dana">
        <p v-if="definition" class="text-sm text-gray-600 dark:text-gray-300">
          {{ definition.title }}
          <span class="text-xs text-gray-400 dark:text-gray-500" dir="ltr">{{ definition.key }}</span>
        </p>

        <div class="relative">
          <Transition name="sk">
            <div v-if="loading" key="skeleton" class="space-y-2">
              <USkeleton v-for="i in 3" :key="i" class="h-10 w-full rounded-lg" />
            </div>

            <div v-else-if="error" key="error" class="space-y-3">
              <p class="text-sm text-error" role="alert">{{ error }}</p>
              <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">تلاش دوباره</UButton>
            </div>

            <div v-else-if="versions.length" key="content" class="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">نسخه</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">زمان انتشار</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">منتشرکننده</th>
                    <th class="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in versions"
                    :key="row.version"
                    class="border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                  >
                    <td class="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      v{{ Number(row.version).toLocaleString('fa-IR') }}
                    </td>
                    <td class="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {{ formatJalali(row.publishedAt, { withTime: true }) || '—' }}
                    </td>
                    <td class="px-4 py-3 text-xs text-gray-700 dark:text-gray-300" dir="ltr">
                      <span class="block text-start">{{ row.publishedBy || '—' }}</span>
                    </td>
                    <td class="px-4 py-3 text-end">
                      <UButton
                        color="neutral"
                        variant="outline"
                        size="xs"
                        icon="i-heroicons-arrow-down-tray"
                        :loading="downloading === row.version"
                        :disabled="downloading !== null"
                        @click="downloadBpmn(row.version)"
                      >
                        دانلود BPMN
                      </UButton>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <PanelEmptyState
              v-else
              key="empty"
              icon="i-heroicons-rectangle-stack"
              title="هنوز نسخه‌ای منتشر نشده است"
              text="با انتشار پیش‌نویس، اولین نسخه ساخته می‌شود"
            />
          </Transition>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full items-center gap-2" dir="rtl">
        <UButton class="ms-auto" color="neutral" variant="soft" @click="emit('update:open', false)">بستن</UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup>
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import { apiErrorMessage } from '~/utils/apiError.js'
import { formatJalali } from '~/utils/jalali.js'

// Published versions of one definition (`GET …/definitions/{id}/versions`, newest first) and the BPMN 2.0 XML of each
// (`GET …/{id}/bpmn?version=`: the XML is a string inside the JSON envelope, so it is wrapped in a Blob here and saved as
// `<key>-v<n>.bpmn`). Props: `open`, `definition` (needs `id`, `key`, `title`). Emits `update:open`. Reloads on every open.
const props = defineProps({
  open: { type: Boolean, required: true },
  definition: { type: Object, default: null },
})
const emit = defineEmits(['update:open'])

const app = useNuxtApp()
const toast = useAppToast()
const { download } = useFileDownload()

const versions = ref([])
const loading = ref(false)
const error = ref('')
const downloading = ref(null) // the version being fetched

async function load() {
  if (!props.definition) return
  loading.value = true
  error.value = ''
  try {
    const res = await app.$api.workflow.listDefinitionVersions(props.definition.id)
    versions.value = res.data.data ?? []
  } catch (e) {
    versions.value = []
    error.value = apiErrorMessage(e, 'دریافت نسخه‌ها ناموفق بود')
  } finally {
    loading.value = false
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    versions.value = []
    downloading.value = null
    load()
  },
  { immediate: true }
)

// `download` (useFileDownload) creates the object URL, clicks a link and revokes the URL
async function downloadBpmn(version) {
  if (downloading.value !== null || !props.definition) return
  downloading.value = version
  try {
    const res = await app.$api.workflow.getDefinitionBpmn(props.definition.id, { params: { version } })
    const xml = res.data.data
    if (typeof xml !== 'string' || !xml) throw new Error('bpmn.empty')
    const blob = new Blob([xml], { type: 'application/xml' })
    await download(Promise.resolve({ data: blob }), `${props.definition.key}-v${version}.bpmn`)
  } catch (e) {
    toast.error(apiErrorMessage(e, 'دریافت BPMN ناموفق بود'))
  } finally {
    downloading.value = null
  }
}
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
