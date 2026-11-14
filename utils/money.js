// Money helpers for staff screens. CONV A: BACK stores every amount in Rial (ریال). Staff screens show the number
// exactly as sent, never convert. Customer and storefront screens keep useFormat().formatPrice («تومان»).
import { toLatinDigits } from '~/utils/jalali.js'

export const MONEY_UNIT = 'ریال'

// 1234567 → "۱٬۲۳۴٬۵۶۷ ریال". null/'' → '—'.
export const formatMoney = (v) => {
  if (v === null || v === undefined || v === '') return '—'
  return Number(v).toLocaleString('fa-IR') + ' ' + MONEY_UNIT
}

// Persian, Arabic or Latin digits with separators (, ٬ or spaces) → non-negative integer, or null when invalid.
export const parseMoney = (text) => {
  const digits = toLatinDigits(text).replace(/[,٬\s]/g, '')
  return /^\d+$/.test(digits) ? Number(digits) : null
}

// "قیمت" → "قیمت (ریال)"
export const moneyLabel = (label) => `${label} (${MONEY_UNIT})`
