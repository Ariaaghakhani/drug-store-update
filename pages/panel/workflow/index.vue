<!-- pages/panel/workflow/index.vue -->
<template>
  <div class="relative">
    <Transition name="sk">
      <PanelEmptyState
        v-if="noTarget"
        key="none"
        variant="forbidden"
        title="گردش کار در دسترس نیست"
        text="یا دسترسی ندارید یا گردش کار برای این فروشگاه روشن نیست"
      />
      <div v-else key="skeleton" class="space-y-3">
        <USkeleton class="h-10 w-64 rounded-xl" />
        <USkeleton class="h-32 w-full rounded-xl" />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'

// Landing route of the «گردش کار» menu entry: replaces itself with the first section the user can read. The list below is in the
// order of the plan; C21/C22 add their pages at the marked places. A section that is not built yet must not be listed (a
// redirect there would end in a 404), so a user who holds only a later module sees the unavailable state until it lands.
const SECTIONS = [
  { to: '/panel/workflow/instances', module: 'WORKFLOW_MONITOR' },
  // C22a: { to: '/panel/workflow/definitions', module: 'WORKFLOW_DESIGN' }
  // C21b: { to: '/panel/workflow/calendar', module: 'WORKFLOW_CALENDAR' }
]

const { canRead } = useModuleAccess()
const noTarget = ref(false)

// Client-side: the grants come from the persisted permissions, which the server render does not have
onMounted(() => {
  const target = SECTIONS.find((section) => canRead(section.module))
  if (target) navigateTo(target.to, { replace: true })
  else noTarget.value = true
})

useHead({ title: 'گردش کار | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
