// Error and result helpers for panel writes. BACK messages are already translated, so they win over the generic text.
// Pattern: `toast.error(apiErrorMessage(e, 'خطا در ذخیره'))`.

export const errorStatus = (e) => e?.response?.status ?? null

// BACK's `message` first, then the generic 403 / 413 texts, then the caller's fallback.
export const apiErrorMessage = (e, fallback) => {
  const message = e?.response?.data?.message
  if (typeof message === 'string' && message) return message
  const status = errorStatus(e)
  if (status === 403) return 'دسترسی به این کار ندارید'
  if (status === 413) return 'حجم فایل بیش از حد مجاز است'
  return fallback
}

// A workflow-gated write returns `{pending: true}` after the plugin already toasted. The caller closes and reloads.
export const isPending = (res) => res?.pending === true
