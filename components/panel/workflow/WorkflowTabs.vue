<!-- components/panel/workflow/WorkflowTabs.vue -->
<template>
  <PanelSectionTabs v-if="visibleTabs.length > 1" :tabs="visibleTabs" />
</template>

<script setup>
// Section switcher of the workflow area (the inbox and every /panel/workflow/* page). A tab shows only when the user can read its
// BACK module; with a single visible tab the switcher is hidden. Tabs are in the order of the plan: C21/C22 append the designer
// tabs (فرایندها، اتصال‌ها، رویدادها: WORKFLOW_DESIGN) and تقویم (WORKFLOW_CALENDAR) at the marked place.
import PanelSectionTabs from '@/components/panel/PanelSectionTabs.vue'
import { useModuleAccess } from '@/composables/useModuleAccess.js'

const TABS = [
  { label: 'کارتابل', to: '/panel/tasks', icon: 'i-heroicons-inbox-stack', module: 'WORKFLOW_TASK' },
  { label: 'اجراها', to: '/panel/workflow/instances', icon: 'i-heroicons-arrow-path-rounded-square', module: 'WORKFLOW_MONITOR' },
  // C22a: { label: 'فرایندها', to: '/panel/workflow/definitions', module: 'WORKFLOW_DESIGN' }
  // C21a: { label: 'اتصال‌ها', to: '/panel/workflow/bindings', module: 'WORKFLOW_DESIGN' }
  // C21c: { label: 'رویدادها', to: '/panel/workflow/events', module: 'WORKFLOW_DESIGN' }
  // C21b: { label: 'تقویم', to: '/panel/workflow/calendar', module: 'WORKFLOW_CALENDAR' }
]

const { canRead } = useModuleAccess()

const visibleTabs = computed(() =>
  TABS.filter((tab) => canRead(tab.module)).map(({ label, to, icon }) => ({ label, to, icon }))
)
</script>
