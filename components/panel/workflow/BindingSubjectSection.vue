<!-- components/panel/workflow/BindingSubjectSection.vue -->
<template>
  <section class="border-b border-gray-100 dark:border-gray-800 last:border-0">
    <button
      type="button"
      class="flex w-full items-center gap-3 px-4 sm:px-6 py-3 text-start hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
      :aria-expanded="open"
      @click="emit('toggle')"
    >
      <UIcon
        name="i-heroicons-chevron-down"
        class="w-4 h-4 flex-shrink-0 text-gray-400 dark:text-gray-500 transition-transform"
        :class="open ? '' : 'rotate-90'"
      />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ subject.title || subject.code }}</p>
        <p class="text-xs text-gray-400 dark:text-gray-500" dir="ltr">{{ subject.code }}</p>
      </div>
      <span class="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
        {{ boundCount.toLocaleString('fa-IR') }} از {{ subject.actions.length.toLocaleString('fa-IR') }} کار متصل
      </span>
    </button>

    <ul v-if="open" class="divide-y divide-gray-100 dark:divide-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
      <li
        v-for="action in actions"
        :key="action.code"
        class="flex flex-wrap items-center gap-3 ps-10 pe-4 sm:pe-6 py-3"
      >
        <div class="flex-1 min-w-48">
          <p class="text-sm text-gray-900 dark:text-white">{{ action.title || action.code }}</p>
          <p class="text-xs text-gray-400 dark:text-gray-500" dir="ltr">{{ action.code }}</p>
        </div>

        <div class="flex-1 min-w-48">
          <template v-if="bindingOf(action.code)">
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ bindingOf(action.code).definitionTitle || bindingOf(action.code).definitionKey }}
              <span v-if="bindingOf(action.code).publishedVersion" class="text-xs text-gray-500 dark:text-gray-400">
                · v{{ bindingOf(action.code).publishedVersion.toLocaleString('fa-IR') }}
              </span>
            </p>
            <StatusBadge :meta="metaOf(DEFINITION_STATUS_META, bindingOf(action.code).definitionStatus)" />
          </template>
          <span v-else class="text-sm text-gray-400 dark:text-gray-500">بدون فرایند</span>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            :icon="bindingOf(action.code) ? 'i-heroicons-pencil-square' : 'i-heroicons-link'"
            @click="emit('bind', action)"
          >
            {{ bindingOf(action.code) ? 'تغییر' : 'اتصال' }}
          </UButton>
          <UButton
            v-if="bindingOf(action.code)"
            color="error"
            variant="soft"
            size="sm"
            icon="i-heroicons-link-slash"
            @click="emit('unbind', action)"
          >
            برداشتن اتصال
          </UButton>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup>
import StatusBadge from '@/components/panel/StatusBadge.vue'
import { metaOf } from '~/utils/enumMeta.js'
import { DEFINITION_STATUS_META } from '~/utils/workflowMeta.js'

// One subject of the bindings page: a collapsible header and one row per action (the actions to show, already filtered by the search).
// Presentational: the page owns the data and the requests. Emits `toggle`, `bind(action)` and `unbind(action)`.
const props = defineProps({
  // WorkflowSubjectDTO {code, title, ...}
  subject: { type: Object, required: true },
  // The actions to list (a subset of subject.actions while a search is active)
  actions: { type: Array, required: true },
  // action code → WorkflowBindingDTO
  bindings: { type: Object, default: () => ({}) },
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['toggle', 'bind', 'unbind'])

const bindingOf = (code) => props.bindings[code] ?? null
// Counts every action of the subject, not only the ones the search leaves visible
const boundCount = computed(() => props.subject.actions.filter((action) => bindingOf(action.code)).length)
</script>
