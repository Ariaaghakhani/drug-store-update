// Labels/colors for the SMS account and campaign screens: BACK's SmsCampaignStatus, SmsRecipientStatus,
// SmsCampaignAudience, SmsCampaignKind and SmsAccountProblem. Colors are Nuxt UI tokens. Unknown values fall back
// to the raw value (utils/enumMeta.js), so a new BACK enum never breaks a screen.
import { labelOf, metaOf } from '~/utils/enumMeta.js'

// QUEUED → SENDING → DONE; CANCELLED ends a campaign early
export const SMS_CAMPAIGN_STATUS_META = {
  QUEUED: { label: 'در صف', color: 'info' },
  SENDING: { label: 'در حال ارسال', color: 'warning' },
  DONE: { label: 'پایان یافته', color: 'success' },
  CANCELLED: { label: 'لغو شده', color: 'neutral' },
}

// SENT means the SMS service accepted the message, not that the phone received it
export const SMS_RECIPIENT_STATUS_META = {
  PENDING: { label: 'در انتظار', color: 'info' },
  SENT: { label: 'ارسال شد', color: 'success' },
  FAILED: { label: 'ناموفق', color: 'error' },
  CANCELLED: { label: 'لغو شده', color: 'neutral' },
}

export const SMS_AUDIENCE_LABELS = {
  STORE_CUSTOMERS: 'مشتریان باشگاه',
  ONLINE_CUSTOMERS: 'مشتریان سایت',
  ALL: 'همه',
}

export const SMS_KIND_LABELS = {
  MANUAL: 'دستی',
  BIRTHDAY: 'تبریک تولد',
}

// Short fallback for `problemMessage` (BACK sends the full translated text next to `problem`)
export const SMS_PROBLEM_LABELS = {
  INVALID_KEY: 'کلید API معتبر نیست',
  ACCOUNT_DISABLED: 'حساب کاوه‌نگار غیرفعال شده است',
  NO_CREDIT: 'اعتبار حساب تمام شده است',
  INVALID_SENDER: 'خط فرستنده معتبر نیست',
  IP_NOT_ALLOWED: 'IP سرور در حساب مجاز نیست',
  TRIAL_ACCOUNT: 'حساب آزمایشی است',
}

export const campaignStatusMeta = (status) => metaOf(SMS_CAMPAIGN_STATUS_META, status)
export const recipientStatusMeta = (status) => metaOf(SMS_RECIPIENT_STATUS_META, status)
export const audienceLabel = (audience) => labelOf(SMS_AUDIENCE_LABELS, audience)
export const kindLabel = (kind) => labelOf(SMS_KIND_LABELS, kind)

// A trial account only reaches its owner's number: a notice, the rest stop sending
export const problemColor = (problem) => (problem === 'TRIAL_ACCOUNT' ? 'warning' : 'error')

// The scheduler sends only QUEUED and SENDING campaigns; only those can be cancelled and are worth polling
export const isCampaignActive = (status) => status === 'QUEUED' || status === 'SENDING'

// SmsCampaignMessageRequest.message ≤ 500, SmsCampaignRequest.title ≤ 100
export const SMS_MESSAGE_MAX = 500
export const SMS_TITLE_MAX = 100

// The placeholder BACK replaces with the chosen discount code
export const DISCOUNT_PLACEHOLDER = '{discountCode}'

// 0..100, whole percent of `part` out of `total` (0 when there is no total)
export const percentOf = (part, total) => {
  const whole = Number(total)
  if (!whole) return 0
  return Math.min(100, Math.max(0, Math.round((Number(part ?? 0) / whole) * 100)))
}

// BACK's quota period «1405/07» → Persian digits with a two-digit month
export const smsPeriodText = (period) => {
  const month = new Intl.NumberFormat('fa-IR', { minimumIntegerDigits: 2, useGrouping: false })
  const year = new Intl.NumberFormat('fa-IR', { useGrouping: false })
  const [y, m] = String(period ?? '').split('/')
  if (!y || m === undefined) return '—'
  return `${year.format(Number(y))}/${month.format(Number(m))}`
}
