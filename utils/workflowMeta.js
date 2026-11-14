// Labels, colors and helpers for BACK's workflow enums. The Persian labels are copied from BACK's `WorkflowPageLabels.java`
// (verified 2026-11-12). `*_META` maps are `{label, color}` with a Nuxt UI color token, `*_LABELS` maps are plain strings;
// read both through `metaOf` / `labelOf` (utils/enumMeta.js) so an unknown BACK value never breaks a screen.
// Sections: runs and decisions (C19), definitions and calendar (C20–C22), designer labels (C21), helpers.

// ---------- runs and decisions (C19) ----------
export const INSTANCE_STATUS_META = {
  RUNNING: { label: 'در جریان', color: 'info' },
  COMPLETED: { label: 'تأییدشده', color: 'success' },
  REJECTED: { label: 'ردشده', color: 'error' },
  RETURNED: { label: 'برگشت برای اصلاح', color: 'warning' },
  CANCELLED: { label: 'لغوشده', color: 'neutral' },
  FAILED: { label: 'خطا در اعمال نتیجه', color: 'error' },
}

// COMMENT is a note on an open task, not a decision: it never ends a step
export const DECISION_META = {
  APPROVE: { label: 'تأیید', color: 'success' },
  REJECT: { label: 'رد', color: 'error' },
  RETURN: { label: 'برگشت برای اصلاح', color: 'warning' },
  COMMENT: { label: 'یادداشت', color: 'neutral' },
}

// ---------- definitions and calendar (C20–C22) ----------
export const DEFINITION_STATUS_META = {
  DRAFT: { label: 'پیش‌نویس', color: 'neutral' },
  PUBLISHED: { label: 'منتشرشده', color: 'success' },
  RETIRED: { label: 'بازنشسته', color: 'neutral' },
}

export const DAY_TYPE_META = {
  OFFICIAL_HOLIDAY: { label: 'تعطیل رسمی', color: 'error' },
  CLOSED: { label: 'تعطیلی فروشگاه', color: 'warning' },
  WORKING: { label: 'کار در روز تعطیل', color: 'info' },
}

// ---------- designer labels (C21) ----------
export const STEP_TYPE_LABELS = {
  APPROVAL: 'تأیید کارمند',
  ACTION: 'اقدام سیستمی',
  WAIT: 'انتظار برای رویداد',
  AUTO: 'تصمیم خودکار',
}

export const APPROVER_TYPE_LABELS = {
  ROLE: 'نقش',
  USER: 'کارمند',
  STARTER: 'ثبت‌کننده‌ی درخواست',
  PREVIOUS_ACTOR: 'تصمیم‌گیرنده‌ی مرحله‌ی قبل',
}

export const COMPLETION_LABELS = {
  ANY: 'یک نفر کافی است',
  ALL: 'همه باید تأیید کنند',
  EACH: 'از هر گیرنده یک نفر (هم‌زمان)',
}

// What a step does with files: BACK's task detail `attachments` uses the same three codes
export const ATTACHMENT_MODE_LABELS = {
  OPTIONAL: 'اختیاری',
  NONE: 'خاموش (فایل پذیرفته نمی‌شود)',
  REQUIRED: 'اجباری برای تأیید',
}

export const OPERATOR_LABELS = {
  EQ: 'برابر',
  NE: 'نابرابر',
  GT: 'بیشتر از',
  GTE: 'بیشتر یا برابر',
  LT: 'کمتر از',
  LTE: 'کمتر یا برابر',
  IN: 'یکی از',
}

export const DEADLINE_UNIT_LABELS = {
  CALENDAR_DAYS: 'روز تقویمی',
  WORKING_DAYS: 'روز کاری',
}

export const OVERDUE_ACTION_LABELS = {
  NONE: 'فقط علامت تأخیر',
  REMIND_SMS: 'پیامک یادآوری',
  ESCALATE: 'ارجاع به نقش دیگر',
}

export const AUTO_DECISION_LABELS = {
  APPROVE: 'تأیید خودکار و پایان',
  REJECT: 'رد خودکار',
  GOTO: 'برو به مرحله‌ی دیگر',
}

export const WAIT_TIMEOUT_LABELS = {
  CONTINUE: 'ادامه بده',
  REJECT: 'رد کن',
}

// ---------- helpers ----------

// Panel page of the record a run is about; null for a subject without a detail page (e.g. an `API_<MODULE>` panel action)
export const entityLink = (subject, id) => {
  if (id === null || id === undefined || id === '') return null
  const key = encodeURIComponent(String(id))
  if (subject === 'PURCHASE_ORDER') return `/panel/purchase-orders/${key}`
  if (subject === 'ORDER_RETURN') return `/panel/returns/${key}`
  return null
}

// 403 (no grant) or 404 (route missing) on a workflow call = workflow is unavailable for this store. Do not toast it in a loop.
// A task detail 404 is different: there it means «this task is gone or not yours», so the detail page checks it before this.
export const isWorkflowUnavailable = (e) => {
  const status = e?.response?.status
  return status === 403 || status === 404
}

// «سفارش خرید #۳۲۰»: the entity id is a string in BACK's DTOs; numeric ids go through the fa-IR formatter
export const entityIdLabel = (id) => {
  const text = String(id ?? '')
  return /^\d+$/.test(text) ? Number(text).toLocaleString('fa-IR') : text
}

// Card/page title of a task or run: BACK's ready-made summary title, else «<subject title> #<entity id>»
export const taskTitle = (task) => {
  const title = task?.summary?.title
  if (title) return title
  const subject = task?.subjectTitle || task?.subject || ''
  return `${subject} #${entityIdLabel(task?.entityId)}`.trim()
}
