// composables/useWorkflowTaskCount.js
// Shared open-task count of the workflow inbox (BACK `GET api/admin/workflow/tasks/count` → {mine, claimable, overdue}):
// drives the «کارتابل» sidebar badge in pages/panel.vue and the tab counts on /panel/tasks.
// Only staff holding WORKFLOW_TASK are tracked. A 403/404 (no grant, or workflow switched off for the store) clears the count
// and stops all further calls for this session; any other failure keeps the last known count. Nothing here ever toasts.
import { isWorkflowUnavailable } from '~/utils/workflowMeta.js'

const POLL_MS = 60_000

let pollTimer = null
let pollers = 0

export const useWorkflowTaskCount = () => {
  const { $api } = useNuxtApp()
  const userStore = useUserStore()
  const { getUserRole } = useUserPanelTabs()
  const { canRead } = useModuleAccess()

  const count = useState('workflow-task-count', () => null)
  const unavailable = useState('workflow-task-count-unavailable', () => false)

  // Customers and a not-yet-loaded user are never tracked; unknown grants fall through and BACK answers
  const tracked = () => Boolean(userStore.currentUser) && getUserRole() !== 'customer' && canRead('WORKFLOW_TASK')

  // `force` is for the inbox page: it retries after an «unavailable» answer (the user opened the page on purpose)
  async function refresh({ force = false } = {}) {
    if (!tracked() || (unavailable.value && !force)) return
    try {
      const response = await $api.workflow.getTaskCount()
      count.value = response.data.data ?? null
      unavailable.value = false
    } catch (e) {
      if (isWorkflowUnavailable(e)) {
        count.value = null
        unavailable.value = true
      }
      // any other failure keeps the last known count
    }
  }

  // Shared timer: several mounted callers poll once; a hidden tab skips the call
  function start() {
    pollers += 1
    if (pollTimer) return
    pollTimer = setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, POLL_MS)
  }

  function stop() {
    pollers = Math.max(0, pollers - 1)
    if (pollers === 0 && pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  // Logout: the next user starts clean
  function reset() {
    count.value = null
    unavailable.value = false
  }

  return { count, unavailable, refresh, start, stop, reset }
}
