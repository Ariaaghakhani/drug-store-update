/**
 * Workflow Service — approval workflow, verified against BACK's `WorkflowTaskController` (`/api/admin/workflow/tasks`,
 * module WORKFLOW_TASK) and `WorkflowInstanceController` (`/api/admin/workflow/instances`) on `main` 2026-11-12.
 * Every route exists only when the store has workflow switched on (`workflow.enabled`): a 403 (no grant) or 404 (route
 * missing) on any call means "workflow unavailable for this store" (see `isWorkflowUnavailable` in utils/workflowMeta.js).
 * Payload = `res.data.data` (no RAW endpoints here). `taskId` is a string, so it is always `encodeURIComponent`-ed;
 * instance and definition ids are numbers. Sections: task inbox (C19), run reads (C19), run monitoring (C20), bindings,
 * calendar and custom events (C21), designer (C22a–C22c; C22d appends `getApproverOptions`).
 */
const TASKS = 'api/admin/workflow/tasks'
const INSTANCES = 'api/admin/workflow/instances'
const BINDINGS = 'api/admin/workflow/bindings'
const DEFINITIONS = 'api/admin/workflow/definitions'
const CALENDAR = 'api/admin/workflow/calendar'
const CUSTOM_EVENTS = 'api/admin/workflow/custom-events'
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

  // ========== RUN MONITORING (C20, module WORKFLOW_MONITOR) ==========
  // Note: the run detail and attachment reads above need WORKFLOW_TASK, the calls below need WORKFLOW_MONITOR.

  // GET, 0-based `page`, `size` 1..100, newest first, via config.params {status? RUNNING|COMPLETED|REJECTED|RETURNED|CANCELLED|FAILED
  // (any other value is a 400), subject? (code), entityId? (string), definitionId?, startedByUserId?, from?, to? (both yyyy-MM-dd; `to`
  // is inclusive, both filter the START day), page, size} → PageResponse<WorkflowInstanceDTO>. The DTO carries codes only
  // (`subject`, `action`), no titles: take them from listSubjects()
  listInstances(config) {
    return apiCaller.get(INSTANCES, config)
  },

  // module WORKFLOW_DESIGN (not MONITOR: a monitor without the designer grant gets a 403 and must fall back to codes).
  // [{code, title, actions[{code, title}], fields[{key, title, type NUMBER|TEXT|BOOLEAN|ID}], events[{code, title}]}], sorted by code.
  // `events` are the built-in ones AND the store's custom events (BACK's registry concatenates both; checked 2026-11-14), so a
  // custom event is told apart only through listCustomEvents()
  listSubjects() {
    return apiCaller.get('api/admin/workflow/subjects')
  },

  // POST, no body. Re-queues the failed system steps (3 more tries). Answers the WorkflowInstanceDetailDTO. 409
  // `workflow.instance.not.running` (run ended) or `workflow.instance.no.incident` (nothing failed)
  retryInstance(id) {
    return apiCaller.post(`${INSTANCES}/${id}/retry`)
  },

  // body {reason (required, <=500)}. Only a RUNNING run (409 `workflow.instance.not.running` otherwise). The record goes back to its
  // state before the request, as after a rejection. Answers the WorkflowInstanceDTO (status CANCELLED, endReason = reason)
  cancelInstance(id, config) {
    return apiCaller.post(`${INSTANCES}/${id}/cancel`, config)
  },

  // POST api/admin/workflow/events, body {subject (<=50), entityId (<=64, string), event (<=50)}. Moves every RUNNING run of that
  // RECORD (not one run) that waits for this event on. Answers the Integer number of steps that moved on (0 = nothing was waiting).
  // 400 `workflow.event.unknown` when the event is neither built in for the subject nor a custom event
  publishEvent(config) {
    return apiCaller.post('api/admin/workflow/events', config)
  },

  // ========== BINDINGS (C21a, module WORKFLOW_DESIGN) ==========
  // Verified against WorkflowBindingController / WorkflowBindingServiceImpl (backend copy, 2026-11-14)

  // GET → [{subject, subjectTitle, action, definitionId, definitionKey, definitionTitle, publishedVersion, definitionStatus
  // DRAFT|PUBLISHED|RETIRED}], unpaged, sorted by subject then action. A subject/action without a row is simply not bound
  listBindings() {
    return apiCaller.get(BINDINGS)
  },

  // PUT body {subject (<=50), action (<=50), definitionId}: answers the binding row. The definition must be PUBLISHED (409
  // `workflow.binding.definition.not.published`) and designed for the same subject and action (400 `workflow.binding.mismatch`);
  // unknown action 400 `workflow.action.unknown`, unknown definition 404. Replaces the previous binding of that action: runs
  // already in flight on the old definition end
  bindWorkflow(config) {
    return apiCaller.put(BINDINGS, config)
  },

  // DELETE with config.params {subject, action} (query string, both required). Answers 200 with `data: null`; 404
  // `workflow.binding.not.found` when the action is not bound. Runs in flight end; later actions need no approval
  unbindWorkflow(subject, action) {
    return apiCaller.delete(BINDINGS, { params: { subject, action } })
  },

  // GET api/admin/workflow/definitions via config.params {status? DRAFT|PUBLISHED|RETIRED, subject? (code), page (0-based, default 0),
  // size 1..100 (default 20)}, last changed first → PageResponse<WorkflowDefinitionDTO {id, key, title, subject, subjectTitle, action,
  // status, publishedVersion, publishedAt, draftChanged, steps (empty in the list), version, createdAt, updatedAt}>.
  // BACK has no `action` filter: callers filter by action themselves
  listDefinitions(config) {
    return apiCaller.get(DEFINITIONS, config)
  },

  // ========== CALENDAR (C21b, module WORKFLOW_CALENDAR) ==========
  // Verified against WorkflowCalendarController / WorkflowCalendarServiceImpl. The official holidays (`/holidays*`) are platform-only
  // (PlatformRoles) and not wrapped; the store's day list below already contains them (read-only, `store: false`)

  // GET → {workingDays ['SATURDAY'…], startTime 'HH:mm', endTime 'HH:mm', defaults (true = the store has not saved one yet, the
  // values are BACK's defaults: Saturday to Wednesday, 08:00 to 16:00)}
  getCalendar() {
    return apiCaller.get(CALENDAR)
  },

  // PUT body {workingDays (non-empty set of DayOfWeek names), startTime 'HH:mm', endTime 'HH:mm' (strictly after startTime)}: answers
  // the saved calendar (defaults false). 400 `workflow.calendar.invalid` when start >= end (or no working day)
  saveCalendar(config) {
    return apiCaller.put(CALENDAR, config)
  },

  // GET config.params {year (Jalali, e.g. 1405, required int)} → [{id, date 'yyyy-MM-dd', type OFFICIAL_HOLIDAY|CLOSED|WORKING, title,
  // store}], sorted by date. `store` true = the store's own day (deletable); official holidays carry `store: false`
  listCalendarDays(config) {
    return apiCaller.get(`${CALENDAR}/days`, config)
  },

  // POST body {date 'yyyy-MM-dd' (Gregorian ISO), type CLOSED|WORKING (OFFICIAL_HOLIDAY is not accepted), title? (<=200)}. Answers
  // 201 with the day row. One row per date: 409 `workflow.calendar.day.exists`
  addCalendarDay(config) {
    return apiCaller.post(`${CALENDAR}/days`, config)
  },

  // DELETE, the store's own days only (404 `workflow.calendar.day.not.found` otherwise). Answers 200 with `data: null`
  deleteCalendarDay(id) {
    return apiCaller.delete(`${CALENDAR}/days/${id}`)
  },

  // ========== CUSTOM EVENTS (C21c, module WORKFLOW_DESIGN) ==========
  // Verified against WorkflowCustomEventController / WorkflowCustomEventServiceImpl

  // GET → [{id, subject, subjectTitle, code, title}], unpaged, sorted by subject then code
  listCustomEvents() {
    return apiCaller.get(CUSTOM_EVENTS)
  },

  // POST body {subject (<=50, a code from listSubjects), code, title (<=200, trimmed, required)}. `code` must match
  // ^[A-Z][A-Z0-9_]{1,49}$ (BACK trims and upper-cases it first, then answers 400 `workflow.custom-event.code.invalid`); a code that is
  // already a built-in or custom event of that subject is 409 `workflow.custom-event.duplicate`. Answers 201 with the row
  createCustomEvent(config) {
    return apiCaller.post(CUSTOM_EVENTS, config)
  },

  // DELETE. Answers 200 with `data: null`, 404 `workflow.custom-event.not.found`. Steps waiting for it only move on when their
  // deadline passes
  deleteCustomEvent(id) {
    return apiCaller.delete(`${CUSTOM_EVENTS}/${id}`)
  },

  // ========== DESIGNER (C22a–C22c, module WORKFLOW_DESIGN) ==========
  // Verified against WorkflowDefinitionController / WorkflowDefinitionServiceImpl / WorkflowStepDTO (backend copy, 2026-11-14).
  // `listDefinitions` (above, C21a) is the list. A step (WorkflowStepDTO) carries 13 fields: key, title, approvers[{type ROLE|USER|STARTER|
  // PREVIOUS_ACTOR, roleId, userId}], completion ANY|ALL|EACH, condition, deadline{amount, unit, onOverdue, escalateToRoleId, repeatEvery,
  // escalateAgainToRoleId}, starterMayDecide, type APPROVAL|ACTION|WAIT|AUTO (null = APPROVAL), systemAction{code, params}, waitEvent{code,
  // onTimeout CONTINUE|REJECT}, autoDecision APPROVE|REJECT|GOTO, goTo, attachments NONE|OPTIONAL|REQUIRED. BACK answers every field
  // (null when unset); a save must send the whole step back, so callers never rebuild a step field by field.

  // GET → WorkflowDefinitionDTO {id, key, title, subject, subjectTitle, action, status DRAFT|PUBLISHED|RETIRED, publishedVersion, publishedAt,
  // draftChanged, steps[], version (Long, the optimistic lock: send it back on save), createdAt, updatedAt}. 404 `workflow.definition.not.found`
  getDefinition(id) {
    return apiCaller.get(`${DEFINITIONS}/${id}`)
  },

  // POST body {title (required, <=200), subject (required, <=50), action (required, <=50), steps (required, may be [], <=20, may be
  // incomplete)}. Answers 201 with the draft (steps included). 400 `workflow.subject.unknown` / `workflow.action.unknown`. The same body is
  // what exportDefinition answers, so an import is this call. subject and action never change afterwards
  createDefinition(config) {
    return apiCaller.post(DEFINITIONS, config)
  },

  // PUT body {title (required, <=200), steps (required, <=20), version (required, the value read with the definition)}. Answers the saved
  // definition with its NEW `version`. 409 `workflow.definition.conflict` (someone saved in between: reload) or `workflow.definition.retired`;
  // the 409 body's `errorCode` tells them apart (`e.response.data.errorCode`). Saving a PUBLISHED definition sets `draftChanged` even
  // when nothing changed. A JPA lock failure under a real race has no handler in BACK's code, so it may surface as a plain 500
  updateDefinition(id, config) {
    return apiCaller.put(`${DEFINITIONS}/${id}`, config)
  },

  // POST, no body. Checks the SAVED draft, not what the page holds (save first). → {valid, errors[{stepKey (null = the whole definition),
  // message}]}. An empty step list is itself an error (`workflow.steps.count`)
  validateDefinition(id) {
    return apiCaller.post(`${DEFINITIONS}/${id}/validate`)
  },

  // POST, no body. Publishes the saved draft as a NEW version → the definition (status PUBLISHED, `publishedVersion` = the new number).
  // 400 `workflow.definition.invalid` (message carries the error count; details through validate), 409 `workflow.definition.retired`.
  // A PUBLISHED definition whose draft did not change answers 200 with the same definition and creates NO version (silent no-op)
  publishDefinition(id) {
    return apiCaller.post(`${DEFINITIONS}/${id}/publish`)
  },

  // POST, no body. PUBLISHED only (409 `workflow.definition.not.published`); 409 `workflow.definition.in.use` while an action is bound to it
  // (unbind first). New runs stop, runs in flight carry on. Not reversible. Answers the definition (status RETIRED)
  retireDefinition(id) {
    return apiCaller.post(`${DEFINITIONS}/${id}/retire`)
  },

  // DELETE. Only a definition that was never published (status DRAFT; 409 `workflow.definition.not.draft` otherwise: retire it instead).
  // Answers 200 with `data: null`
  deleteDefinition(id) {
    return apiCaller.delete(`${DEFINITIONS}/${id}`)
  },

  // GET → {title, subject, action, steps}: exactly the createDefinition body (BACK's WorkflowDefinitionRequest). Role and user ids inside
  // the steps belong to this store: they must be chosen again after an import elsewhere
  exportDefinition(id) {
    return apiCaller.get(`${DEFINITIONS}/${id}/export`)
  },

  // GET → [{version (Integer), publishedAt, publishedBy (string), deploymentId}], newest first, published versions only
  listDefinitionVersions(id) {
    return apiCaller.get(`${DEFINITIONS}/${id}/versions`)
  },

  // GET config.params {version? (Integer; empty = the latest published one)} → the payload `res.data.data` is the BPMN 2.0 XML STRING inside the
  // normal JSON envelope (BACK answers ApiResponse<String>): NOT a blob, no responseType. 404 `workflow.definition.version.not.found`
  getDefinitionBpmn(id, config) {
    return apiCaller.get(`${DEFINITIONS}/${id}/bpmn`, config)
  },
})
