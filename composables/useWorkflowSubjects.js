// composables/useWorkflowSubjects.js
// Titles of the workflow subjects (BACK `GET api/admin/workflow/subjects`, module WORKFLOW_DESIGN). A run only carries codes
// (`subject`, `action`), so the monitoring screens look the Persian titles up here. Each caller loads its own copy (no shared cache,
// so nothing outlives a logout). `failed` is true when the list is unavailable (a monitor without the designer grant gets a 403):
// the screens then show the raw codes and the list filter becomes a text input. Nothing here ever toasts.
export const useWorkflowSubjects = () => {
  const { $api } = useNuxtApp()

  const subjects = ref([]) // WorkflowSubjectDTO[] {code, title, actions[{code, title}], fields[], events[{code, title}]}
  const loaded = ref(false)
  const failed = ref(false)

  async function load() {
    try {
      const res = await $api.workflow.listSubjects()
      subjects.value = res.data.data ?? []
      failed.value = false
    } catch {
      subjects.value = []
      failed.value = true
    } finally {
      loaded.value = true
    }
  }

  const find = (code) => subjects.value.find((subject) => subject.code === code)

  // Each lookup falls back to the code, so a subject or action BACK adds later never renders blank
  const subjectTitle = (code) => find(code)?.title || code || '—'
  const actionTitle = (subject, action) => find(subject)?.actions?.find((item) => item.code === action)?.title || action || '—'
  const eventTitle = (subject, code) => find(subject)?.events?.find((item) => item.code === code)?.title || code || '—'

  return { subjects, loaded, failed, load, subjectTitle, actionTitle, eventTitle }
}
