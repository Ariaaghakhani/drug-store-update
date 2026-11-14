// Store settings helpers for the settings editor (SYSTEM_SETTINGS): group order, source badges and per-type value checks.
// Values are checked here first, then BACK re-checks them on save (its messages win when they come back).
import { toLatinDigits } from '~/utils/jalali.js'
import { normalizeNotifyPhone } from '~/utils/contactMeta.js'

// Order of the group select. Groups BACK adds later follow after these, labelled by BACK's groupLabel.
export const SETTING_GROUP_ORDER = [
  'SECURITY', 'PASSWORD', 'SMS', 'SUPPORT', 'ORDER', 'PAYMENT', 'PRESCRIPTION',
  'STORE_PROFILE', 'STOREFRONT', 'STOREFRONT_FEATURES', 'REPORT', 'SEARCH', 'BACKUP',
]

// Groups whose values change the public store profile (ordering, storefront features, store type).
export const PROFILE_SETTING_GROUPS = ['STOREFRONT_FEATURES', 'STORE_PROFILE', 'ORDER']

// SettingSource → StatusBadge meta
export const SOURCE_META = {
  OWN: { label: 'مقدار فروشگاه', color: 'primary' },
  PLATFORM: { label: 'پیش‌فرض پلتفرم', color: 'neutral' },
  DEFAULT: { label: 'پیش‌فرض', color: 'neutral' },
}

const fail = (error) => ({ value: null, error })
const ok = (value) => ({ value, error: '' })
const toFa = (n) => Number(n).toLocaleString('fa-IR')

// Mobiles separated by commas (Persian or Latin comma). Each goes through normalizeNotifyPhone (09xxxxxxxxx).
// Empty text is an empty list, which is allowed. Result value is the list joined by ','.
export const parseMobileList = (text, max) => {
  const raw = toLatinDigits(text).split(/[,،]/).map((part) => part.trim()).filter(Boolean)
  const phones = []
  for (const part of raw) {
    const phone = normalizeNotifyPhone(part)
    if (!phone) return fail(`شماره نامعتبر: ${part}`)
    if (!phones.includes(phone)) phones.push(phone)
  }
  if (max && phones.length > max) return fail(`حداکثر ${toFa(max)} شماره`)
  return ok(phones.join(','))
}

// 16 digits; spaces and dashes are dropped (the control digit is checked by BACK).
export const parseCardNumber = (text) => {
  const digits = toLatinDigits(text).replace(/[\s-]/g, '')
  if (digits === '') return ok('')
  if (!/^\d{16}$/.test(digits)) return fail('شماره کارت باید ۱۶ رقم باشد')
  return ok(digits)
}

const isHttpUrl = (text) => {
  try {
    const url = new URL(text)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// Checks one raw draft against the setting's TYPE and range. Returns {value, error}; value is what to send.
export const validateSettingValue = (setting, raw) => {
  const text = String(raw ?? '')
  switch (setting.type) {
    case 'INTEGER': {
      const digits = toLatinDigits(text).trim()
      if (!/^-?\d+$/.test(digits)) return fail('فقط عدد صحیح وارد کنید')
      const n = Number(digits)
      if ((setting.min != null && n < setting.min) || (setting.max != null && n > setting.max)) {
        return fail(`عدد باید بین ${toFa(setting.min)} و ${toFa(setting.max)} باشد`)
      }
      return ok(String(n))
    }
    case 'TEXT': {
      const value = text.trim()
      if (setting.max && value.length > setting.max) return fail(`حداکثر ${toFa(setting.max)} کاراکتر`)
      return ok(value)
    }
    case 'URL': {
      const value = text.trim()
      if (value === '') return ok('')
      if (setting.max && value.length > setting.max) return fail(`حداکثر ${toFa(setting.max)} کاراکتر`)
      if (!isHttpUrl(value)) return fail('آدرس کامل با http:// یا https:// وارد کنید')
      return ok(value)
    }
    case 'MOBILE_LIST':
      return parseMobileList(text, setting.max)
    case 'CARD_NUMBER':
      return parseCardNumber(text)
    default:
      return ok(text)
  }
}

// Short hint under a field, per TYPE («بین min و max», «حداکثر …»). Empty string for types with no hint.
export const settingHelp = (setting) => {
  switch (setting.type) {
    case 'INTEGER':
      return setting.min != null && setting.max != null
        ? `بین ${toFa(setting.min)} و ${toFa(setting.max)}`
        : ''
    case 'TEXT':
      return setting.max ? `حداکثر ${toFa(setting.max)} کاراکتر` : ''
    case 'URL':
      return 'آدرس کامل با http:// یا https://'
    case 'MOBILE_LIST':
      return setting.max
        ? `شماره‌ها را با ، جدا کنید، حداکثر ${toFa(setting.max)} شماره`
        : 'شماره‌ها را با ، جدا کنید'
    case 'CARD_NUMBER':
      return '۱۶ رقم، بدون فاصله یا خط تیره'
    default:
      return ''
  }
}

// StoreType (BACK StoreType enum) → label and template defaults for the four storefront flags. Picking a type
// prefills the switches with these; the store can still change each one before saving.
export const STORE_TYPE_ORDER = ['PHARMACY', 'SUPERMARKET', 'CLOTHING', 'ELECTRONICS', 'GENERAL']

export const STORE_TYPE_META = {
  PHARMACY: { label: 'داروخانه', batchRequired: true, expiryRequired: true, prescriptionEnabled: true, variantsEnabled: false },
  SUPERMARKET: { label: 'سوپرمارکت', batchRequired: false, expiryRequired: true, prescriptionEnabled: false, variantsEnabled: false },
  CLOTHING: { label: 'پوشاک', batchRequired: false, expiryRequired: false, prescriptionEnabled: false, variantsEnabled: true },
  ELECTRONICS: { label: 'لوازم الکترونیکی', batchRequired: false, expiryRequired: false, prescriptionEnabled: false, variantsEnabled: true },
  GENERAL: { label: 'فروشگاه عمومی', batchRequired: false, expiryRequired: false, prescriptionEnabled: false, variantsEnabled: true },
}

// The four flags a store type sends with it, in the order the switches show them.
export const STORE_FLAG_ROWS = [
  { key: 'batchRequired', label: 'بچ‌بندی اجباری', help: 'هر ردیف موجودی و رسید خرید بچ دارد' },
  { key: 'expiryRequired', label: 'تاریخ انقضای اجباری', help: 'هر بچ تاریخ انقضا دارد' },
  { key: 'prescriptionEnabled', label: 'کالای نیازمند نسخه', help: 'کالا می‌تواند «نیاز به نسخه» باشد' },
  { key: 'variantsEnabled', label: 'تنوع کالا', help: 'رنگ، سایز و مانند آن' },
]
