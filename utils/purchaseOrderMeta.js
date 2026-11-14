// Labels/colors for BACK's PurchaseOrderStatus. Flow: DRAFT → ORDERED → PARTIALLY_RECEIVED → RECEIVED; CLOSED after a partial
// receipt; CANCELLED before any receipt. Colors are Nuxt UI tokens. Amounts are Rial (utils/money.js).
export const PO_STATUS_META = {
  DRAFT: { label: 'پیش‌نویس', color: 'neutral' },
  ORDERED: { label: 'ثبت‌شده', color: 'info' },
  PARTIALLY_RECEIVED: { label: 'دریافت ناقص', color: 'warning' },
  RECEIVED: { label: 'دریافت کامل', color: 'success' },
  CLOSED: { label: 'بسته‌شده', color: 'neutral' },
  CANCELLED: { label: 'لغوشده', color: 'error' },
}
