/**
 * Workflow Service — approval workflow, verified against BACK's `WorkflowTaskController` (`/api/admin/workflow/tasks`,
 * module WORKFLOW_TASK) and `WorkflowInstanceController` (`/api/admin/workflow/instances`) on `main` 2026-11-12.
 * Every route exists only when the store has workflow switched on (`workflow.enabled`): a 403 (no grant) or 404 (route
 * missing) on any call means "workflow unavailable for this store" (see `isWorkflowUnavailable` in utils/workflowMeta.js).
 * Payload = `res.data.data` (no RAW endpoints here). `taskId` is a string, so it is always `encodeURIComponent`-ed;
 * instance and definition ids are numbers. C20–C22 add the monitoring, designer and calendar sections below.
 */
const TASKS = 'api/admin/workflow/tasks'
const INSTANCES = 'api/admin/workflow/instances'
const task = (taskId) => `${TASKS}/${encodeURIComponent(taskId)}`

export default (apiCaller) => ({
  // ========== TASK INBOX (C19, module WORKFLOW_TASK) ==========

  // GET, 0-based `page`, `size` 1..100 (newest first), `scope` MINE (default) | CLAIMABLE via config.params →
  // PageResponse<WorkflowTaskDTO {taskId, instanceId, stepKey, stepTitle, subject, subjectTitle, entityId, action,
  // summary{title, lines[{label, value}]}, status OPEN|CLAIMED, mine, assigneeUserId, startedBy, createdAt, dueAt, overdue,
  // startedByName, assigneeName}>. BACK has no `subject`/`overdue` filter (docs/WORKFLOW.md mentions them, the request class does not)
  listTasks(config) {
    return apiCaller.get(TASKS, config)
  },

  // {mine, claimable, overdue}: numbers for the menu badge
  getTaskCount() {
    return apiCaller.get(`${TASKS}/count`)
  },

  // {task, instance, timeline[{stepKey, stepTitle, decision APPROVE|REJECT|RETURN|COMMENT, comment, actorUserId, actorUsername,
  // actorRoles, decidedAt, actorName, actorRoleTitles}], attachments NONE|OPTIONAL|REQUIRED, attachedFiles}.
  // 404 `workflow.task.not.found` when the task does not exist or the user is neither its assignee nor a candidate
  getTask(taskId) {
    return apiCaller.get(task(taskId))
  },

  // POST, no body. Answers the WorkflowTaskDTO. 409 `workflow.task.claimed` (someone else holds it), 403 `workflow.task.self.decide`
  // (the requester cannot claim a step of their own request unless the step allows it)
  claimTask(taskId) {
    return apiCaller.post(`${task(taskId)}/claim`)
  },

  // POST, no body. Only a task the user claimed; 409 for an «all approvers» step (nobody else could take it). Answers the WorkflowTaskDTO
  unclaimTask(taskId) {
    return apiCaller.post(`${task(taskId)}/unclaim`)
  },

  // body {comment (required, <=1000)}: a note without a decision, the task stays open. Answers the WorkflowTaskDetailDTO (fresh timeline)
  commentTask(taskId, config) {
    return apiCaller.post(`${task(taskId)}/comments`, config)
  },

  // multipart `file` (caller builds the FormData, one file per call). Answers AttachmentDTO. 400 `workflow.task.attachment.disabled`
  // when the step's attachments are NONE. The file belongs to the whole run, `attachedFiles` of getTask counts them per task
  attachToTask(taskId, config) {
    return apiCaller.post(`${task(taskId)}/attachments`, config)
  },

  // body {decision APPROVE|REJECT|RETURN, comment <=1000 (required for REJECT and RETURN)}. An unclaimed task is claimed by deciding.
  // Answers WorkflowInstanceDTO {id, subject, entityId, action, definitionId, definitionTitle, definitionVersion, status RUNNING|COMPLETED|
  // REJECTED|RETURNED|CANCELLED|FAILED, startedByUserId, startedBy, startedAt, endedAt, endReason, activeSteps[], startedByName}.
  // 400 `workflow.task.attachment.required` (APPROVE on a REQUIRED step with no file), 409 `workflow.task.claimed`
  decideTask(taskId, config) {
    return apiCaller.post(`${task(taskId)}/decide`, config)
  },

  // module WORKFLOW_MONITOR (not WORKFLOW_TASK). body {userId (required)}: an active staff user of this store (400
  // `workflow.reassign.user.invalid` otherwise). Answers the WorkflowTaskDTO; the previous holder loses the task
  reassignTask(taskId, config) {
    return apiCaller.post(`${task(taskId)}/reassign`, config)
  },

  // ========== RUNS (C19 reads, module WORKFLOW_TASK) ==========

  // {instance, timeline[], openTasks[WorkflowTaskDTO], incidents[{jobId, stepKey, message, failedAt}], waits[{stepKey, stepTitle,
  // eventCode, since}], attachments[AttachmentDTO {id, fileName, fileType, ...}], answers[{stepKey, stepTitle, key, title, value}]}
  getInstance(id) {
    return apiCaller.get(`${INSTANCES}/${id}`)
  },

  // GET with config.params {subject, entityId} (both required): every run of one record, newest first → WorkflowInstanceDTO[] (unpaged)
  listInstancesByEntity(config) {
    return apiCaller.get(`${INSTANCES}/by-entity`, config)
  },

  // Blob of one run attachment (attachmentId from getInstance().attachments[].id); consume with useFileDownload()
  instanceAttachment(id, attachmentId) {
    return apiCaller.get(`${INSTANCES}/${id}/attachments/${attachmentId}`, { responseType: 'blob' })
  },
})
