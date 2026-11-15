<!-- components/panel/workflow/WorkflowTabs.vue -->
<template>
  <PanelSectionTabs v-if="visibleTabs.length > 1" :tabs="visibleTabs" />
</template>

<script setup>
// Section switcher of the workflow area (the inbox and every /panel/workflow/* page). A tab shows only when the user can read its
// BACK module; with a single visible tab the switcher is hidden. Tabs are in the order of the plan: «فرایندها» (C22a,
// WORKFLOW_DESIGN) comes before the C21 tabs. The editor page `definitions/[id]` also shows this strip, and «فرایندها» stays active there
// (`PanelSectionTabs` matches by path prefix).
import PanelSectionTabs from '@/components/panel/PanelSectionTabs.vue'
import { useModuleAccess } from '@/composables/useModuleAccess.js'

const TABS = [
  { label: 'کارتابل', to: '/panel/tasks', icon: 'i-heroicons-inbox-stack', module: 'WORKFLOW_TASK' },
  { label: 'اجراها', to: '/panel/workflow/instances', icon: 'i-heroicons-arrow-path-rounded-square', module: 'WORKFLOW_MONITOR' },
  { label: 'فرایندها', to: '/panel/workflow/definitions', icon: 'i-heroicons-squares-2x2', module: 'WORKFLOW_DESIGN' },
  { label: 'اتصال‌ها', to: '/panel/workflow/bindings', icon: 'i-heroicons-link', module: 'WORKFLOW_DESIGN' },
  { label: 'رویدادها', to: '/panel/workflow/events', icon: 'i-heroicons-bolt', module: 'WORKFLOW_DESIGN' },
  { label: 'تقویم', to: '/panel/workflow/calendar', icon: 'i-heroicons-calendar-days', module: 'WORKFLOW_CALENDAR' },
]

const { canRead } = useModuleAccess()

const visibleTabs = computed(() =>
  TABS.filter((tab) => canRead(tab.module)).map(({ label, to, icon }) => ({ label, to, icon }))
)
</script>
