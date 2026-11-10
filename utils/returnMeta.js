// Labels/colors for BACK's order-return enums (ReturnStatus / ReturnMethod / ReturnReason). Colors are Nuxt UI tokens.
// Reason and method labels also come back as `reasonLabel` / `returnMethodLabel` on OrderReturnDTO; these maps are the
// fallback for filter menus and for a missing label.
export const RETURN_STATUS_META = {
  REQUESTED: { label: 'در انتظار بررسی', color: 'warning' },
  APPROVED: { label: 'تأیید شده', color: 'info' },
  REJECTED: { label: 'رد شده', color: 'error' },
  CANCELLED: { label: 'لغو شده', color: 'neutral' },
  RECEIVED: { label: 'کالا دریافت شد', color: 'info' },
  COMPLETED: { label: 'تکمیل شده', color: 'success' },
}

export const RETURN_METHOD_LABELS = {
  CUSTOMER_SENDS: 'ارسال توسط مشتری',
  STORE_PICKUP: 'دریافت با پیک فروشگاه',
  CUSTOMER_BRINGS: 'تحویل حضوری در فروشگاه',
}

export const RETURN_REASON_LABELS = {
  WRONG_ITEM: 'کالای ارسالی با سفارش مغایرت دارد',
  NOT_AS_DESCRIBED: 'مشخصات کالا با صفحه‌ی محصول نمی‌خواند',
  DAMAGED_IN_TRANSIT: 'کالا در بسته‌بندی یا حمل آسیب دیده است',
  DEFECTIVE: 'کالا ایراد فیزیکی یا عملکردی دارد',
  EXPIRED: 'کالا منقضی است یا انقضایش با اعلام‌شده نمی‌خواند',
  HIDDEN_DEFECT: 'ایرادی که هنگام تحویل دیده نمی‌شد',
  CHANGE_OF_MIND: 'انصراف از خرید',
}

export const returnStatusMeta = (status) =>
  RETURN_STATUS_META[status] ?? { label: status ?? '', color: 'neutral' }

export const returnMethodLabel = (method) => RETURN_METHOD_LABELS[method] ?? method ?? ''

export const returnReasonLabel = (reason) => RETURN_REASON_LABELS[reason] ?? reason ?? ''
