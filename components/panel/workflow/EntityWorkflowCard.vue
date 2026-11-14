<!-- components/panel/workflow/EntityWorkflowCard.vue -->
<template>
  <UCard v-if="runs.length">
    <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">گردش کار</h4>
    <ul class="divide-y divide-gray-100 dark:divide-gray-800">
      <li v-for="run in runs" :key="run.id" class="py-3 first:pt-0 last:pb-0 space-y-1.5">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ run.definitionTitle || '—' }}</span>
          <span v-if="run.definitionVersion" class="text-xs text-gray-500 dark:text-gray-400">
            نسخه {{ run.definitionVersion.toLocaleString('fa-IR') }}
          </span>
          <StatusBadge :meta="metaOf(INSTANCE_STATUS_META, run.status)" />
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          ثبت‌شده توسط
          <template v-if="run.startedByName">{{ run.startedByName }}</template>
          <span v-else-if="run.startedBy" dir="ltr">{{ run.startedBy }}</span>
          <template v-else>سیستم</template>
          · {{ formatJalali(run.startedAt, { withTime: true }) }}
        </p>
        <p v-if="run.activeSteps?.length" class="text-xs text-gray-700 dark:text-gray-300">
          مرحله‌ی فعال: {{ run.activeSteps.join('، ') }}
        </p>
        <NuxtLink
          v-if="canMonitor"
          :to="`/panel/workflow/instances/${run.id}`"
          class="inline-block text-xs text-brand-500 dark:text-brand-400 hover:underline underline-offset-2"
        >
          جزئیات اجرا
        </NuxtLink>
      </li>
    </ul>
  </UCard>
</template>

<script setup>
import StatusBadge from '@/components/panel/StatusBadge.vue'
import { metaOf } from '~/utils/enumMeta.js'
import { formatJalali } from '~/utils/jalali.js'
import { INSTANCE_STATUS_META } from '~/utils/workflowMeta.js'

// «گردش کار» card of a record's detail page: every approval run BACK has for it (GET …/instances/by-entity, newest first).
// Hidden while loading, when the record has no runs, and on any error (workflow off or no grant): a missing card is never
// worth an error state on a page that is about something else. The run link needs WORKFLOW_MONITOR. Staff pages only.
// Changing `reloadKey` (e.g. the record's status after an action) fetches the runs again.
const props = defineProps({
  subject: { type: String, required: true }, // PURCHASE_ORDER | ORDER_RETURN
  entityId: { type: [String, Number], required: true },
  reloadKey: { type: [String, Number], default: '' },
})

const app = useNuxtApp()
const { canRead } = useModuleAccess()

const runs = ref([])
const canMonitor = computed(() => canRead('WORKFLOW_MONITOR'))

let latest = 0
async function load() {
  const request = ++latest
  try {
    const res = await app.$api.workflow.listInstancesByEntity({
      params: { subject: props.subject, entityId: String(props.entityId) },
    })
    if (request === latest) runs.value = res.data.data ?? []
  } catch {
    if (request === latest) runs.value = []
  }
}

onMounted(load)
watch(() => [props.subject, props.entityId, props.reloadKey], load)
</script>
