// Labels/colors for BACK's prescription enums (PrescriptionStatus, PrescriptionPaymentStatus, PrescriptionDeliveryMethod,
// PrescriptionPaymentMethod, InsuranceKind). Colors are Nuxt UI tokens. Unknown values fall back to the raw value, neutral.

export const PRESCRIPTION_STATUS_META = {
  SUBMITTED: { label: 'در انتظار بررسی', color: 'warning' },
  AVAILABLE: { label: 'موجود', color: 'success' },
  PARTIALLY_AVAILABLE: { label: 'بخشی موجود', color: 'info' },
  UNAVAILABLE: { label: 'ناموجود', color: 'error' },
  INVALID: { label: 'نامعتبر', color: 'error' },
  CONFIRMED: { label: 'تأیید شده', color: 'info' },
  READY: { label: 'آماده‌ی تحویل', color: 'success' },
  SHIPPED: { label: 'ارسال شد', color: 'info' },
  DELIVERED: { label: 'تحویل شد', color: 'success' },
  CANCELLED: { label: 'لغو شده', color: 'neutral' },
}

export const PAYMENT_STATUS_META = {
  UNPAID: { label: 'پرداخت نشده', color: 'neutral' },
  AWAITING_RECEIPT: { label: 'منتظر رسید', color: 'warning' },
  RECEIPT_SUBMITTED: { label: 'رسید ارسال شد', color: 'info' },
  RECEIPT_REJECTED: { label: 'رسید رد شد', color: 'error' },
  PAID: { label: 'پرداخت شد', color: 'success' },
}

export const DELIVERY_METHOD_LABELS = {
  PICKUP: 'مراجعه‌ی حضوری',
  STORE_COURIER: 'پیک داروخانه',
  CUSTOMER_COURIER: 'پیک خودم',
}

export const PAYMENT_METHOD_LABELS = {
  ON_DELIVERY: 'پرداخت هنگام تحویل',
  CARD_TO_CARD: 'کارت به کارت',
}

export const INSURANCE_KIND_LABELS = {
  BASIC: 'پایه',
  SUPPLEMENTARY: 'تکمیلی',
}

// Statuses in which the customer may cancel (BACK PrescriptionStatus.canCancel)
export const CUSTOMER_CANCELLABLE = ['SUBMITTED', 'AVAILABLE', 'PARTIALLY_AVAILABLE']

const metaFrom = (map, value) => map[value] ?? { label: value ?? '', color: 'neutral' }

export const prescriptionStatusMeta = (status) => metaFrom(PRESCRIPTION_STATUS_META, status)
export const paymentStatusMeta = (status) => metaFrom(PAYMENT_STATUS_META, status)
export const deliveryMethodLabel = (method) => DELIVERY_METHOD_LABELS[method] ?? method ?? ''
export const paymentMethodLabel = (method) => PAYMENT_METHOD_LABELS[method] ?? method ?? ''
export const insuranceKindLabel = (kind) => INSURANCE_KIND_LABELS[kind] ?? kind ?? ''
