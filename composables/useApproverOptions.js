// composables/useApproverOptions.js
// What the workflow step editor picks from (BACK `GET api/admin/workflow/approver-options`, module WORKFLOW_DESIGN): the staff roles, the
// active staff (at most 100 per answer, filtered by `q`) and the registered system actions with their inputs and outputs.
// The first `load()` is cached for this instance (the page that holds the editor owns one instance and hands it to the step editor, so the
// roles and actions are fetched once). `searchUsers(q)` is debounced and only replaces `users`; `q` empty brings the first list back
// without a request. Plain per-caller refs (no `useState`, so nothing outlives a logout). Nothing here ever toasts: `failed` and
// `forbidden` tell the screen what to show, and a failed search keeps the list it had.
import { toLatinDigits } from '~/utils/jalali.js'

const SEARCH_DELAY_MS = 300

export const useApproverOptions = () => {
  const { $api } = useNuxtApp()

  const roles = ref([]) // [{id, name, description, title}]
  const users = ref([]) // [{id, username, fullName}]: the list for the current search
  const systemActions = ref([]) // [{code, title, params[], outputs[]}]
  const loading = ref(false)
  const loaded = ref(false)
  const failed = ref(false)
  const forbidden = ref(false) // 403 or 404: the designer is not available to this user
  const searching = ref(false)
  const searchFailed = ref(false)

  // Every id → name ever received, so a user found by a search still has a name after a later search replaced the list, and StepCard can
  // name the approvers of every step. An id that was never received is not here (the caller marks it unknown).
  const userNames = ref({})
  const roleTitles = computed(() => Object.fromEntries(roles.value.map((role) => [role.id, role.title || role.name])))

  let firstUsers = [] // the list of the first (unfiltered) load
  let timer = null
  let sequence = 0 // a stale search answer is dropped

  const userLabel = (user) => user.fullName || user.username || `#${user.id}`
  const remember = (list) => {
    for (const user of list) userNames.value[user.id] = userLabel(user)
  }

  const fetchOptions = async (query) => {
    const res = await $api.workflow.getApproverOptions(query ? { params: { q: query } } : undefined)
    return res.data.data ?? {}
  }

  async function load(force = false) {
    if (loading.value || (loaded.value && !force)) return
    loading.value = true
    failed.value = false
    forbidden.value = false
    try {
      const data = await fetchOptions('')
      roles.value = data.roles ?? []
      firstUsers = data.users ?? []
      users.value = firstUsers
      systemActions.value = data.systemActions ?? []
      remember(firstUsers)
      loaded.value = true
    } catch (e) {
      failed.value = true
      const status = e?.response?.status
      forbidden.value = status === 403 || status === 404
    } finally {
      loading.value = false
    }
  }

  // Debounced; BACK searches the staff by part of a name or mobile number (Persian digits are converted)
  function searchUsers(q) {
    clearTimeout(timer)
    const term = toLatinDigits(q ?? '').trim()
    sequence += 1
    searchFailed.value = false
    if (!term) {
      searching.value = false
      users.value = firstUsers
      return
    }
    const mine = sequence
    searching.value = true
    timer = setTimeout(async () => {
      try {
        const data = await fetchOptions(term)
        if (mine !== sequence) return
        users.value = data.users ?? []
        remember(users.value)
      } catch {
        if (mine === sequence) searchFailed.value = true
      } finally {
        if (mine === sequence) searching.value = false
      }
    }, SEARCH_DELAY_MS)
  }

  // `{roles: {<id>: title}, users: {<id>: name}}`: the shape StepCard's `approverNames` prop takes
  const names = computed(() => ({ roles: roleTitles.value, users: userNames.value }))

  if (getCurrentInstance()) onBeforeUnmount(() => clearTimeout(timer))

  return {
    roles,
    users,
    systemActions,
    loading,
    loaded,
    failed,
    forbidden,
    searching,
    searchFailed,
    userNames,
    names,
    load,
    searchUsers,
  }
}
