// Labels/colors for BACK's ticket enums (TicketStatus / TicketPriority / TicketCategory). Colors are Nuxt UI tokens.
export const TICKET_STATUS_META = {
  OPEN: { label: 'باز', color: 'info' },
  IN_PROGRESS: { label: 'در حال بررسی', color: 'warning' },
  WAITING_FOR_USER: { label: 'منتظر پاسخ کاربر', color: 'warning' },
  RESOLVED: { label: 'حل شده', color: 'success' },
  CLOSED: { label: 'بسته', color: 'neutral' },
}

export const TICKET_PRIORITY_META = {
  LOW: { label: 'کم', color: 'neutral' },
  MEDIUM: { label: 'متوسط', color: 'info' },
  HIGH: { label: 'زیاد', color: 'error' },
}

export const TICKET_CATEGORY_LABELS = {
  TECHNICAL: 'فنی',
  FINANCIAL: 'مالی',
  GENERAL: 'عمومی',
}

export const ticketStatusMeta = (status) =>
  TICKET_STATUS_META[status] ?? { label: status ?? '', color: 'neutral' }
export const ticketPriorityMeta = (priority) =>
  TICKET_PRIORITY_META[priority] ?? { label: priority ?? '', color: 'neutral' }

export const toSelectItems = (labels) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }))
