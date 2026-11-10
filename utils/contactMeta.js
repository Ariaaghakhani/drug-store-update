// Labels/colors for the contact-message admin: BACK's ContactMessageStatus. Colors are Nuxt UI tokens.
import { metaOf } from '~/utils/enumMeta.js'
import { normalizeIranianMobile } from '~/utils/validations.js'

export const CONTACT_STATUS_META = {
  NEW: { label: 'جدید', color: 'primary' },
  READ: { label: 'خوانده‌شده', color: 'neutral' },
  REPLIED: { label: 'پاسخ داده شد', color: 'success' },
  CLOSED: { label: 'بسته', color: 'neutral' },
}

export const contactStatusMeta = (status) => metaOf(CONTACT_STATUS_META, status)

// A typed SMS recipient → 09… (Persian digits, spaces, +98 / 0098 / 98 and a bare 9… are accepted, as on BACK),
// or null when it is not an Iranian mobile
export const normalizeNotifyPhone = (value) => {
  let phone = normalizeIranianMobile(value)
  if (/^9\d{9}$/.test(phone)) phone = `0${phone}`
  return /^09\d{9}$/.test(phone) ? phone : null
}
