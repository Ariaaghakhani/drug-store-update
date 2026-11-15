// Discount codes (BACK DiscountType and the derived state of a code). Amounts are Rial, shown with utils/money.js.
import { formatMoney } from '~/utils/money.js'

export const DISCOUNT_TYPE_LABELS = {
  PERCENT: 'درصدی',
  FIXED: 'مبلغ ثابت',
}

// «۱۰٪» + « تا سقف ۵۰٬۰۰۰ ریال» for PERCENT with a cap; formatMoney(value) for FIXED.
export const discountValueText = (discount) => {
  if (discount.type === 'PERCENT') {
    const percent = `${Number(discount.value ?? 0).toLocaleString('fa-IR')}٪`
    return discount.maxDiscountAmount ? `${percent} تا سقف ${formatMoney(discount.maxDiscountAmount)}` : percent
  }
  return formatMoney(discount.value)
}

// First match wins: inactive, scheduled, expired, used up, otherwise active.
export const discountState = (discount, now = new Date()) => {
  if (!discount.active) return { label: 'غیرفعال', color: 'neutral' }
  if (discount.startsAt && new Date(discount.startsAt) > now) return { label: 'زمان‌بندی‌شده', color: 'info' }
  if (discount.endsAt && new Date(discount.endsAt) < now) return { label: 'منقضی', color: 'error' }
  if (discount.usageLimit && (discount.usedCount ?? 0) >= discount.usageLimit) {
    return { label: 'تمام‌شده', color: 'warning' }
  }
  return { label: 'فعال', color: 'success' }
}
