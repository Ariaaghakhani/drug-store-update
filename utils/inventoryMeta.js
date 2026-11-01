// Labels and helpers for BACK's inventory rows (InventoryDTO) and AdjustmentReason enum.
// `direction`: DAMAGE/LOSS/EXPIRED always take stock out, OTHER lets the user pick, COUNT sends the counted quantity instead.
export const ADJUSTMENT_REASON_META = {
  COUNT: { label: 'انبارگردانی', direction: 'count' },
  DAMAGE: { label: 'خراب یا آسیب‌دیده', direction: 'decrease' },
  LOSS: { label: 'گم‌شده یا سرقت', direction: 'decrease' },
  EXPIRED: { label: 'تاریخ گذشته', direction: 'decrease' },
  OTHER: { label: 'سایر', direction: 'either' },
}

// Same low-stock condition as BACK's dashboard: available (onHand - reserved) at or below the reorder point
export const isLowStock = (row) => row.rop != null && (row.availableQuantity ?? 0) <= row.rop

export const stockStatusMeta = (row) => {
  if ((row.availableQuantity ?? 0) <= 0) return { label: 'ناموجود', color: 'error' }
  if (isLowStock(row)) return { label: 'کم‌موجود', color: 'warning' }
  return { label: 'موجود', color: 'success' }
}

// Quantity typed on a Persian or Arabic keyboard -> non-negative integer, or null when it isn't one
export const parseQuantity = (value) => {
  const latin = String(value ?? '')
    .trim()
    .replace(/[۰-۹]/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))
    .replace(/[٠-٩]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'.indexOf(digit))
  if (!/^\d+$/.test(latin)) return null
  const quantity = Number(latin)
  return Number.isSafeInteger(quantity) ? quantity : null
}
