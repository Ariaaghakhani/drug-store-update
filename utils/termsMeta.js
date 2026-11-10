// Labels/colors for the store's terms versions (BACK's TermsType and TermsStatus). Colors are Nuxt UI tokens.
import { metaOf } from '~/utils/enumMeta.js'

export const TERMS_TYPE_LABELS = {
  TERMS_OF_USE: 'قوانین استفاده',
  PRIVACY_POLICY: 'حریم خصوصی',
  REFUND_POLICY: 'شرایط بازپرداخت',
}

export const TERMS_STATUS_META = {
  DRAFT: { label: 'پیش‌نویس', color: 'neutral' },
  PUBLISHED: { label: 'منتشرشده', color: 'success' },
  ARCHIVED: { label: 'بایگانی', color: 'warning' },
}

export const termsTypeLabel = (type) => TERMS_TYPE_LABELS[type] ?? type ?? ''
export const termsStatusMeta = (status) => metaOf(TERMS_STATUS_META, status)

// BACK's TermsAcceptance.AcceptanceSource: where the user accepted a version (the user page's acceptance history)
export const TERMS_ACCEPTANCE_SOURCE_LABELS = {
  REGISTRATION: 'ثبت‌نام',
  CHECKOUT: 'ثبت سفارش',
  PROMPT: 'پنجره‌ی قوانین جدید',
  PANEL_LOGIN: 'ورود به پنل',
}

export const acceptanceSourceLabel = (source) => TERMS_ACCEPTANCE_SOURCE_LABELS[source] ?? source ?? ''
