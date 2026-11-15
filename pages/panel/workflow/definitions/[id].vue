<!-- pages/panel/workflow/definitions/[id].vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader
      icon="i-heroicons-squares-2x2"
      title="ویرایش"
      accent="فرایند"
      :subtitle="subtitle"
    >
      <template #actions>
        <UButton to="/panel/workflow/definitions" color="neutral" variant="ghost" size="lg" icon="i-heroicons-arrow-right">
          فرایندها
        </UButton>
        <template v-if="definition">
          <UButton
            v-if="definition.publishedVersion"
            color="neutral"
            variant="outline"
            size="lg"
            icon="i-heroicons-rectangle-stack"
            @click="versionsOpen = true"
          >
            نسخه‌ها
          </UButton>
          <template v-if="!readOnly">
            <UButton color="neutral" variant="outline" size="lg" icon="i-heroicons-check-badge" :disabled="locked" :loading="busy === 'validate'" @click="onValidate">
              اعتبارسنجی
            </UButton>
            <UButton color="neutral" variant="outline" size="lg" icon="i-heroicons-rocket-launch" :disabled="!canPublish" :loading="busy === 'publish'" @click="publishOpen = true">
              انتشار
            </UButton>
            <!-- The one primary of the view: saving is what the editor is for; validate and publish are secondary -->
            <UButton color="primary" size="lg" icon="i-heroicons-check" :disabled="!dirty || locked" :loading="busy === 'save'" @click="onSave">
              ذخیره
            </UButton>
          </template>
        </template>
      </template>
    </PanelPageHeader>

    <WorkflowTabs />

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="space-y-4">
          <USkeleton class="h-40 w-full rounded-xl" />
          <USkeleton class="h-24 w-full rounded-xl" />
          <USkeleton class="h-24 w-full rounded-xl" />
        </div>

        <PanelEmptyState
          v-else-if="forbidden"
          key="forbidden"
          variant="forbidden"
          title="گردش کار در دسترس نیست"
          text="یا دسترسی ندارید یا گردش کار برای این فروشگاه روشن نیست"
        />

        <PanelEmptyState
          v-else-if="notFound"
          key="notfound"
          icon="i-heroicons-magnifying-glass"
          title="این فرایند پیدا نشد"
          text="ممکن است حذف شده باشد یا شناسه‌ی آن درست نباشد"
        >
          <template #action>
            <UButton to="/panel/workflow/definitions" color="neutral" variant="soft" icon="i-heroicons-arrow-right">
              بازگشت به فرایندها
            </UButton>
          </template>
        </PanelEmptyState>

        <PanelEmptyState v-else-if="loadError" key="error" variant="error" title="دریافت فرایند ناموفق بود">
          <template #action>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">تلاش دوباره</UButton>
          </template>
        </PanelEmptyState>

        <div v-else-if="definition" key="content" class="space-y-5">
          <!-- ===== banners ===== -->
          <UAlert
            v-if="readOnly"
            color="neutral"
            variant="soft"
            icon="i-heroicons-lock-closed"
            title="این فرایند بازنشسته است"
            description="فرایند بازنشسته تغییر نمی‌کند و شروع تازه ندارد. برای ادامه، فرایند تازه بسازید (می‌توانید «خروجی JSON» این فرایند را وارد کنید)."
          />

          <UAlert
            v-if="conflict"
            color="warning"
            variant="soft"
            icon="i-heroicons-exclamation-triangle"
            title="تغییرات شما ذخیره نشد"
            :description="conflictMessage"
          >
            <template #actions>
              <UButton color="neutral" variant="outline" size="sm" icon="i-heroicons-arrow-path" :loading="busy === 'reload'" @click="conflictOpen = true">
                بارگذاری دوباره
              </UButton>
              <UButton color="neutral" variant="outline" size="sm" icon="i-heroicons-arrow-down-tray" @click="exportMyEdits">
                دریافت تغییرات من (JSON)
              </UButton>
            </template>
          </UAlert>

          <UAlert
            v-if="validation && validation.valid"
            color="success"
            variant="soft"
            icon="i-heroicons-check-circle"
            title="فرایند معتبر است"
            :description="staleNote"
          />
          <UAlert
            v-else-if="validation"
            color="error"
            variant="soft"
            icon="i-heroicons-x-circle"
            :title="`${validation.errors.length.toLocaleString('fa-IR')} خطا در فرایند`"
          >
            <template #description>
              <p v-if="staleNote" class="text-xs mb-1">{{ staleNote }}</p>
              <ul v-if="globalErrors.length" class="list-disc ps-5 space-y-1">
                <li v-for="(item, i) in globalErrors" :key="i">{{ item.message }}</li>
              </ul>
              <p v-else class="text-sm">خطای هر مرحله کنار همان مرحله نوشته شده است.</p>
            </template>
          </UAlert>

          <!-- ===== definition: title and read-only facts ===== -->
          <UCard>
            <div class="space-y-4">
              <UFormField label="عنوان فرایند" required :error="titleError || undefined">
                <UInput
                  v-model="title"
                  :maxlength="MAX_DEFINITION_TITLE"
                  :disabled="locked"
                  autocomplete="off"
                  class="w-full"
                />
              </UFormField>

              <div class="flex flex-wrap items-center gap-2">
                <StatusBadge :meta="metaOf(DEFINITION_STATUS_META, definition.status)" />
                <UBadge v-if="definition.publishedVersion" color="success" variant="subtle" size="xs">
                  منتشرشده: v{{ definition.publishedVersion.toLocaleString('fa-IR') }}
                </UBadge>
                <UBadge v-if="definition.draftChanged" color="warning" variant="subtle" size="xs">تغییر منتشرنشده</UBadge>
                <UBadge v-if="dirty" color="warning" variant="subtle" size="xs">ذخیره‌نشده</UBadge>
              </div>

              <dl class="grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <dt class="text-xs text-gray-500 dark:text-gray-400">موجودیت</dt>
                  <dd class="text-gray-900 dark:text-white">
                    {{ definition.subjectTitle || subjectTitle(definition.subject) }}
                    <span class="text-xs text-gray-400 dark:text-gray-500" dir="ltr">{{ definition.subject }}</span>
                  </dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-500 dark:text-gray-400">کار</dt>
                  <dd class="text-gray-900 dark:text-white">
                    {{ actionTitle(definition.subject, definition.action) }}
                    <span class="text-xs text-gray-400 dark:text-gray-500" dir="ltr">{{ definition.action }}</span>
                  </dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-500 dark:text-gray-400">کلید فرایند</dt>
                  <dd class="text-xs text-gray-700 dark:text-gray-300 font-mono text-start" dir="ltr">{{ definition.key }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-500 dark:text-gray-400">آخرین تغییر</dt>
                  <dd class="text-xs text-gray-700 dark:text-gray-300">
                    {{ formatJalali(definition.updatedAt, { withTime: true }) || '—' }}
                  </dd>
                </div>
              </dl>
              <p v-if="!readOnly" class="text-xs text-gray-500 dark:text-gray-400">
                موجودیت و کار بعد از ساخت فرایند عوض نمی‌شوند.
                <template v-if="nothingToPublish">نسخه‌ی منتشرشده با پیش‌نویس یکی است؛ چیزی برای انتشار نیست.</template>
              </p>
            </div>
          </UCard>

          <!-- ===== steps ===== -->
          <UCard :ui="{ body: 'p-0' }">
            <template #header>
              <div class="flex flex-wrap items-center gap-2">
                <UIcon name="i-heroicons-queue-list" class="w-4 h-4 text-brand-500 dark:text-brand-400" />
                <h2 class="text-sm font-medium text-gray-900 dark:text-white">
                  مراحل
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    ({{ steps.length.toLocaleString('fa-IR') }} از {{ MAX_STEPS.toLocaleString('fa-IR') }})
                  </span>
                </h2>
                <UButton
                  v-if="!readOnly"
                  class="ms-auto"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  icon="i-heroicons-plus"
                  :disabled="locked || steps.length >= MAX_STEPS"
                  @click="addStep"
                >
                  افزودن مرحله
                </UButton>
              </div>
            </template>

            <ol v-if="steps.length" class="space-y-3 p-4 sm:p-6">
              <li v-for="(step, i) in steps" :key="`${i}:${step.key}`">
                <StepCard
                  :step="step"
                  :index="i"
                  :total="steps.length"
                  :errors="stepErrors.get(step.key) ?? []"
                  :readonly="readOnly"
                  :disabled="locked"
                  edit-enabled
                  :approver-names="approvers.names"
                  @move-up="moveStep(i, -1)"
                  @move-down="moveStep(i, 1)"
                  @edit="openStepEditor(i)"
                  @remove="removeIndex = i"
                />
              </li>
            </ol>
            <PanelEmptyState
              v-else
              icon="i-heroicons-queue-list"
              title="هنوز مرحله‌ای نیست"
              :text="readOnly ? 'این فرایند مرحله‌ای ندارد' : 'با «افزودن مرحله» اولین مرحله‌ی فرایند را بسازید'"
            />
          </UCard>
        </div>
      </Transition>
    </div>

    <DefinitionVersionsModal v-model:open="versionsOpen" :definition="definition" />

    <!-- edit one step (C22d–C22f): the modal works on a copy and hands the whole step back with `done` -->
    <StepEditorModal
      v-model:open="editorOpen"
      :step="editingStep"
      :index="editingIndex ?? 0"
      :steps="steps"
      :subject="subject"
      :approvers="approvers"
      @done="onStepDone"
    />

    <!-- remove a step -->
    <PanelConfirmDialog
      :open="removeIndex !== null"
      title="حذف مرحله"
      :message="removeMessage"
      confirm-label="حذف"
      confirm-color="error"
      @update:open="(value) => { if (!value) removeIndex = null }"
      @confirm="confirmRemove"
    />

    <!-- publish (not reversible): save, validate, publish, stopping at the first failure -->
    <PanelConfirmDialog
      :open="publishOpen"
      title="انتشار فرایند"
      :message="publishMessage"
      confirm-label="ذخیره، اعتبارسنجی و انتشار"
      :loading="busy === 'publish'"
      @update:open="(value) => { if (!value) publishOpen = false }"
      @confirm="confirmPublish"
    />

    <!-- someone saved in between (409): reload only after the user agrees -->
    <PanelConfirmDialog
      :open="conflictOpen"
      title="این فرایند در این فاصله تغییر کرده است"
      :message="conflictDialogMessage"
      confirm-label="بارگذاری دوباره"
      confirm-color="error"
      :loading="busy === 'reload'"
      @update:open="(value) => { if (!value) conflictOpen = false }"
      @confirm="reloadAfterConflict"
    />

    <!-- leaving with unsaved changes -->
    <PanelConfirmDialog
      :open="leaveOpen"
      title="تغییرات ذخیره‌نشده"
      message="تغییرات این صفحه ذخیره نشده‌اند و با رفتن از صفحه از بین می‌روند. صفحه را ترک می‌کنید؟"
      confirm-label="ترک صفحه"
      confirm-color="error"
      @update:open="(value) => { if (!value) answerLeave(false) }"
      @confirm="answerLeave(true)"
    />
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import WorkflowTabs from '@/components/panel/workflow/WorkflowTabs.vue'
import StepCard from '@/components/panel/workflow/StepCard.vue'
import DefinitionVersionsModal from '@/components/panel/workflow/DefinitionVersionsModal.vue'
import StepEditorModal from '@/components/panel/workflow/StepEditorModal.vue'
import { apiErrorMessage, errorStatus } from '~/utils/apiError.js'
import { metaOf } from '~/utils/enumMeta.js'
import { formatJalali } from '~/utils/jalali.js'
import { DEFINITION_STATUS_META } from '~/utils/workflowMeta.js'
import { MAX_DEFINITION_TITLE, MAX_STEPS, cloneJson, newStep, stepsJumpingTo } from '~/utils/workflowDefinition.js'
import { replaceStep } from '~/utils/workflowStep.js'

// Workflow definition editor shell (C22c, module WORKFLOW_DESIGN). Route name `panel-workflow-definitions-id`.
//
// The page is split in sections (marked `// ===== … =====` below) so the step editor (C22d–f) plugs in without touching the rest:
//   1. LOAD        `definition` = the last server copy without its steps, `version` = the optimistic lock.
//   2. WORKING COPY `title` and `steps` (array of BACK's WorkflowStepDTO objects, kept WHOLE) + `dirty` (compared with the saved snapshot).
//   3. STEP LIST   add / move / remove. These never rebuild a step: a step object is only moved, spliced out, or created whole.
//   4. STEP EDITOR  (C22d–C22f) a StepEditorModal edits one step on a copy and hands the whole new object back.
//   5. SAVE / VALIDATE / PUBLISH  the request logic (save → validate → publish, stopping at the first failure).
//   6. CONFLICT (409) and DIRTY GUARD.
const app = useNuxtApp()
const route = useRoute()
const toast = useAppToast()
const { download } = useFileDownload()
const { subjects, load: loadSubjects, subjectTitle, actionTitle } = useWorkflowSubjects()
// Roles, staff and system actions for the step editor; the page owns the one instance (fetched once) and StepCard names the approvers from it
const approvers = reactive(useApproverOptions())

// ===== 1. LOAD =====
const definitionId = computed(() => Number(route.params.id))
const definition = ref(null) // WorkflowDefinitionDTO minus `steps` (see applyServer)
const loading = ref(true)
const loadError = ref(null)

// 404 on this page = this one definition was not found (a non-numeric id is a 404 without a request); 403 = no WORKFLOW_DESIGN grant
const forbidden = computed(() => errorStatus(loadError.value) === 403)
const notFound = computed(() => errorStatus(loadError.value) === 404)
const readOnly = computed(() => definition.value?.status === 'RETIRED')

// ===== 2. WORKING COPY =====
const title = ref('')
const steps = ref([])
// Snapshot of what the server holds, to tell whether the page has unsaved changes (steps compared as JSON: moving a step and moving it
// back is clean again)
const savedTitle = ref('')
const savedSteps = ref('[]')

const dirty = computed(
  () => Boolean(definition.value) && (title.value !== savedTitle.value || JSON.stringify(steps.value) !== savedSteps.value)
)
const titleError = computed(() => (title.value.trim() ? '' : 'عنوان فرایند را وارد کنید'))

// The server copy replaces the working copy (after a load or a successful save). `steps` are copied whole, so every field BACK sent
// (also the ones this screen does not show) is held in the working copy and sent back on the next save.
function applyServer(dto) {
  const { steps: serverSteps, ...rest } = dto
  definition.value = rest
  title.value = rest.title ?? ''
  steps.value = cloneJson(serverSteps ?? [])
  savedTitle.value = title.value
  savedSteps.value = JSON.stringify(steps.value)
}

const fetchDefinition = async () => (await app.$api.workflow.getDefinition(definitionId.value)).data.data

async function load() {
  loading.value = true
  loadError.value = null
  if (!Number.isInteger(definitionId.value)) {
    loadError.value = { response: { status: 404 } }
    loading.value = false
    return
  }
  try {
    applyServer(await fetchDefinition())
    validation.value = null
    conflict.value = false
  } catch (e) {
    loadError.value = e
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
  loadSubjects() // titles and the subject's fields and events; a failure falls back to the codes
  approvers.load() // a failure shows ids instead of names, and the step editor offers a retry
})

// One request at a time: 'save' | 'validate' | 'publish' | 'reload'. Edits are locked while one runs, so the answer of a save can never
// overwrite something typed in the meantime.
const busy = ref(null)
const locked = computed(() => readOnly.value || busy.value !== null || conflict.value)

const subtitle = computed(() =>
  definition.value
    ? `${definition.value.subjectTitle || subjectTitle(definition.value.subject)} · ${actionTitle(definition.value.subject, definition.value.action)}`
    : ''
)

// ===== 3. STEP LIST =====
// Moving swaps two whole step objects; deleting splices one out; adding appends a fresh step. No step is ever rebuilt, so the fields
// this screen does not show (approvers, deadline, condition, systemAction, waitEvent, goTo, …) travel unchanged.
function addStep() {
  if (locked.value || steps.value.length >= MAX_STEPS) return
  steps.value.push(newStep(steps.value))
}

function moveStep(index, delta) {
  const target = index + delta
  if (locked.value || target < 0 || target >= steps.value.length) return
  const list = steps.value
  ;[list[index], list[target]] = [list[target], list[index]]
}

const removeIndex = ref(null)
const removeMessage = computed(() => {
  const step = removeIndex.value === null ? null : steps.value[removeIndex.value]
  if (!step) return ''
  const jumpers = stepsJumpingTo(steps.value, step.key)
  const warn = jumpers.length
    ? ` مرحله‌ی ${jumpers.map((item) => `«${item.title || item.key}»`).join('، ')} به این مرحله می‌رود و بعد از حذف خطای اعتبارسنجی می‌گیرد (آن مرحله دست‌نخورده می‌ماند).`
    : ''
  return `مرحله‌ی «${step.title || step.key}» حذف شود؟ تا وقتی ذخیره نکرده‌اید، با بارگذاری دوباره‌ی صفحه برمی‌گردد.${warn}`
})

function confirmRemove() {
  const index = removeIndex.value
  removeIndex.value = null
  if (index === null || locked.value) return
  steps.value.splice(index, 1)
}

// ===== 4. STEP EDITOR (C22d–C22f) =====
// «ویرایش» opens the StepEditorModal with a deep copy of the step; Cancel changes nothing. On `done(step)` the WHOLE step object is
// replaced (`replaceStep`): the modal starts from the existing object and changes only the fields it owns, so every other field
// survives. If the step key was renamed, `replaceStep` also updates the other steps that referred to the old key (`goTo`, condition
// fields `step.<key>.…`, action inputs), in the same edit. Replacing the object makes the page dirty by itself (`dirty` compares JSON).
// Context the modal gets: the subject's catalog entry (`fields`, `events`), the whole list (earlier steps give action outputs, later keys
// are goTo targets) and the approver options.
const editorOpen = ref(false)
const editingIndex = ref(null)
const editingStep = ref(null)
const subject = computed(() => subjects.value.find((item) => item.code === definition.value?.subject) ?? null)

const openStepEditor = (index) => {
  if (locked.value || index < 0 || index >= steps.value.length) return
  editingIndex.value = index
  editingStep.value = cloneJson(steps.value[index])
  editorOpen.value = true
}

function onStepDone(step) {
  const index = editingIndex.value
  if (index === null || locked.value || index >= steps.value.length) return
  const result = replaceStep(steps.value, index, step)
  steps.value = result.steps
  if (result.updatedSteps) {
    toast.info(`ارجاع ${result.updatedSteps.toLocaleString('fa-IR')} مرحله‌ی دیگر به کلید تازه به‌روز شد`)
  }
}

// ===== 5. SAVE / VALIDATE / PUBLISH =====
const validation = ref(null) // {valid, errors[{stepKey, message}]} of the last validate; it describes the SAVED draft
const conflict = ref(false)
const conflictOpen = ref(false)
const conflictMessage = ref('')

const keysInList = computed(() => new Set(steps.value.map((step) => step.key)))
const stepErrors = computed(() => {
  const map = new Map()
  for (const item of validation.value?.errors ?? []) {
    if (!item.stepKey || !keysInList.value.has(item.stepKey)) continue
    if (!map.has(item.stepKey)) map.set(item.stepKey, [])
    map.get(item.stepKey).push(item.message)
  }
  return map
})
// An error with no step key (or a key no step has any more) belongs to the whole definition
const globalErrors = computed(() =>
  (validation.value?.errors ?? []).filter((item) => !item.stepKey || !keysInList.value.has(item.stepKey))
)
const staleNote = computed(() => (dirty.value ? 'این نتیجه برای آخرین نسخه‌ی ذخیره‌شده است، نه تغییرات ذخیره‌نشده.' : ''))

const nothingToPublish = computed(
  () => definition.value?.status === 'PUBLISHED' && !definition.value.draftChanged && !dirty.value
)
// BACK answers 200 without a new version for a PUBLISHED definition whose draft did not change, so publishing is offered only when
// there is something to publish
const canPublish = computed(() => !locked.value && !nothingToPublish.value)

// PUT with the version this page loaded; the answer carries the new `version` (applyServer stores it). 409 = someone else saved
// (`workflow.definition.conflict`) or the definition was retired meanwhile: both mean the page is stale, so the user is asked.
// Returns true when saved. Does not touch `busy` (the callers do).
async function persist() {
  if (titleError.value) {
    toast.error(titleError.value)
    return false
  }
  try {
    const res = await app.$api.workflow.updateDefinition(definitionId.value, {
      data: { title: title.value.trim(), steps: cloneJson(steps.value), version: definition.value.version },
    })
    applyServer(res.data.data)
    validation.value = null // it described the previous draft
    return true
  } catch (e) {
    if (errorStatus(e) === 409) {
      conflict.value = true
      conflictMessage.value = apiErrorMessage(e, 'فرایند در این فاصله توسط کس دیگری تغییر کرده است.')
      conflictOpen.value = true
    } else {
      toast.error(apiErrorMessage(e, 'ذخیره‌ی فرایند ناموفق بود'))
    }
    return false
  }
}

async function onSave() {
  if (locked.value || !dirty.value) return
  busy.value = 'save'
  try {
    if (await persist()) toast.success('فرایند ذخیره شد')
  } finally {
    busy.value = null
  }
}

// Checks the saved draft (BACK validates what it stored, so unsaved changes are saved first by the callers). Returns the result or null.
async function requestValidate() {
  try {
    const res = await app.$api.workflow.validateDefinition(definitionId.value)
    validation.value = res.data.data
    return validation.value
  } catch (e) {
    toast.error(apiErrorMessage(e, 'اعتبارسنجی ناموفق بود'))
    return null
  }
}

const errorCountText = (result) => result.errors.length.toLocaleString('fa-IR')

async function onValidate() {
  if (locked.value) return
  busy.value = 'validate'
  try {
    if (dirty.value && !(await persist())) return
    const result = await requestValidate()
    if (!result) return
    if (result.valid) toast.success('فرایند معتبر است')
    else toast.error(`${errorCountText(result)} خطا در فرایند پیدا شد`)
  } finally {
    busy.value = null
  }
}

// Publish: save (when dirty) → validate → publish, stopping at the first failure. The confirm states the version that will be created
// (every publish deploys the next engine version of this definition). Not reversible from this UI.
const publishOpen = ref(false)
const publishMessage = computed(() => {
  if (!definition.value) return ''
  const next = ((definition.value.publishedVersion ?? 0) + 1).toLocaleString('fa-IR')
  const saveNote = dirty.value ? ' تغییرات ذخیره‌نشده‌ی این صفحه هم اول ذخیره می‌شوند.' : ''
  return `پیش‌نویس اعتبارسنجی می‌شود و اگر خطایی نداشت، نسخه‌ی v${next} ساخته و منتشر می‌شود.${saveNote} انتشار برگشت‌پذیر نیست: نسخه‌ی منتشرشده پاک نمی‌شود، فقط با انتشار بعدی جایگزین می‌شود یا فرایند را بازنشسته می‌کنید. اجراهای در جریان روی نسخه‌ی خودشان می‌مانند.`
})

async function confirmPublish() {
  if (locked.value || !canPublish.value) return
  busy.value = 'publish'
  try {
    if (dirty.value && !(await persist())) return
    const result = await requestValidate()
    if (!result) return
    if (!result.valid) {
      toast.error(`${errorCountText(result)} خطا در فرایند هست و منتشر نشد`)
      return
    }
    const res = await app.$api.workflow.publishDefinition(definitionId.value)
    applyServer(res.data.data)
    validation.value = null
    toast.success(`نسخه‌ی ${definition.value.publishedVersion.toLocaleString('fa-IR')} منتشر شد`)
  } catch (e) {
    // 400 `workflow.definition.invalid`, 409 retired
    toast.error(apiErrorMessage(e, 'انتشار فرایند ناموفق بود'))
  } finally {
    publishOpen.value = false
    busy.value = null
  }
}

// ===== 6a. CONFLICT (409) =====
const conflictDialogMessage = computed(
  () =>
    `${conflictMessage.value} با بارگذاری دوباره، تغییرات ذخیره‌نشده‌ی شما در این صفحه حذف می‌شود. اگر انصراف دهید، تغییرات شما همین‌جا می‌مانند و می‌توانید آن‌ها را به‌صورت فایل JSON دریافت کنید.`
)

// Only after the user confirmed: the working copy is replaced by the server's version
async function reloadAfterConflict() {
  if (busy.value) return
  busy.value = 'reload'
  try {
    applyServer(await fetchDefinition())
    validation.value = null
    conflict.value = false
    conflictOpen.value = false
    toast.info('نسخه‌ی تازه‌ی فرایند بارگذاری شد')
  } catch (e) {
    // The edits stay as they are
    toast.error(apiErrorMessage(e, 'بارگذاری دوباره ناموفق بود'))
  } finally {
    busy.value = null
  }
}

// Gives the user their unsaved work as a file (same shape as «خروجی JSON», so it can be imported), without sending anything
async function exportMyEdits() {
  if (!definition.value) return
  const body = {
    title: title.value.trim(),
    subject: definition.value.subject,
    action: definition.value.action,
    steps: cloneJson(steps.value),
  }
  const blob = new Blob([JSON.stringify(body, null, 2)], { type: 'application/json' })
  await download(Promise.resolve({ data: blob }), `${definition.value.key}-edits.json`)
}

// ===== 6b. DIRTY GUARD =====
// Leaving the route with unsaved changes asks first; a successful save makes `dirty` false, so nothing is asked right after it.
// `beforeunload` covers closing the tab or reloading; it is removed on unmount.
const leaveOpen = ref(false)
let leaveResolve = null

onBeforeRouteLeave(() => {
  if (!dirty.value) return true
  return new Promise((resolve) => {
    leaveResolve = resolve
    leaveOpen.value = true
  })
})

function answerLeave(allow) {
  const resolve = leaveResolve
  leaveResolve = null
  leaveOpen.value = false
  resolve?.(allow)
}

const onBeforeUnload = (event) => {
  if (!dirty.value) return
  event.preventDefault()
  event.returnValue = ''
}

const versionsOpen = ref(false)

onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', onBeforeUnload)
  // A leave dialog still waiting when the page goes away must not leave its navigation hanging
  leaveResolve?.(true)
  leaveResolve = null
})

useHead({ title: computed(() => `${definition.value?.title || 'ویرایش فرایند'} | پنل مدیریت`) })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
