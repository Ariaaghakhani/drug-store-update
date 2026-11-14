<!-- components/panel/workflow/WorkflowTabs.vue -->
<template>
  <PanelSectionTabs v-if="visibleTabs.length > 1" :tabs="visibleTabs" />
</template>

<script setup>
// Section switcher of the workflow area (the inbox and every /panel/workflow/* page). A tab shows only when the user can read its
// BACK module; with a single visible tab the switcher is hidden. Tabs are in the order of the plan: C22a adds «فرایندها»
// (WORKFLOW_DESIGN) at the marked place, before the C21 tabs.
import PanelSectionTabs from '@/components/panel/PanelSectionTabs.vue'
import { useModuleAccess } from '@/composables/useModuleAccess.js'

const TABS = [
  { label: 'کارتابل', to: '/panel/tasks', icon: 'i-heroicons-inbox-stack', module: 'WORKFLOW_TASK' },
  { label: 'اجراها', to: '/panel/workflow/instances', icon: 'i-heroicons-arrow-path-rounded-square', module: 'WORKFLOW_MONITOR' },
  // C22a: { label: 'فرایندها', to: '/panel/workflow/definitions', module: 'WORKFLOW_DESIGN' }
  { label: 'اتصال‌ها', to: '/panel/workflow/bindings', icon: 'i-heroicons-link', module: 'WORKFLOW_DESIGN' },
  { label: 'رویدادها', to: '/panel/workflow/events', icon: 'i-heroicons-bolt', module: 'WORKFLOW_DESIGN' },
  { label: 'تقویم', to: '/panel/workflow/calendar', icon: 'i-heroicons-calendar-days', module: 'WORKFLOW_CALENDAR' },
]

const { canRead } = useModuleAccess()

const visibleTabs = computed(() =>
  TABS.filter((tab) => canRead(tab.module)).map(({ label, to, icon }) => ({ label, to, icon }))
)
</script>
