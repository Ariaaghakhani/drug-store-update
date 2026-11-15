<!-- components/panel/workflow/TaskTimeline.vue -->
<template>
  <p v-if="!entries.length" class="text-sm text-gray-500 dark:text-gray-400">هنوز تصمیمی ثبت نشده است</p>
  <ol v-else class="space-y-3">
    <li
      v-for="(entry, index) in entries"
      :key="index"
      class="rounded-xl border p-3 space-y-1.5"
      :class="
        entry.decision === 'COMMENT'
          ? 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      "
    >
      <div class="flex items-center gap-2 flex-wrap">
        <StatusBadge :meta="metaOf(DECISION_META, entry.decision)" />
        <span class="text-sm font-semibold text-gray-900 dark:text-white">
          <template v-if="entry.actorName">{{ entry.actorName }}</template>
          <span v-else-if="entry.actorUsername" dir="ltr">{{ entry.actorUsername }}</span>
          <template v-else>سیستم</template>
        </span>
        <span v-if="entry.actorRoleTitles" class="text-xs text-gray-500 dark:text-gray-400">
          {{ entry.actorRoleTitles }}
        </span>
      </div>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        <template v-if="entry.stepTitle">{{ entry.stepTitle }} · </template>{{ formatJalali(entry.decidedAt, { withTime: true }) }}
      </p>
      <p v-if="entry.comment" class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ entry.comment }}</p>
    </li>
  </ol>
</template>

<script setup>
import StatusBadge from '@/components/panel/StatusBadge.vue'
import { metaOf } from '~/utils/enumMeta.js'
import { formatJalali } from '~/utils/jalali.js'
import { DECISION_META } from '~/utils/workflowMeta.js'

// Decisions of one run in the order BACK sends them (BACK's `timeline` of a task or run detail). The next decider reads
// who said what before deciding; COMMENT entries are notes that did not end the step, so they are tinted gray.
const props = defineProps({
  timeline: { type: Array, default: () => [] },
})

const entries = computed(() => props.timeline ?? [])
</script>
