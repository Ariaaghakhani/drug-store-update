// Labels/colors for the store customer club (BACK `StoreCustomerSource`, marketing SMS switch). Colors are Nuxt UI tokens.
export const STORE_CUSTOMER_SOURCE_META = {
  IN_STORE: { label: 'ثبت در فروشگاه', color: 'info' },
  IMPORT: { label: 'فایل اکسل', color: 'neutral' },
}

export const storeCustomerSourceMeta = (source) =>
  STORE_CUSTOMER_SOURCE_META[source] ?? { label: source ?? '—', color: 'neutral' }

// Badge for the marketing SMS flag: true = receives campaign SMS, false = opted out
export const marketingSmsMeta = (enabled) =>
  enabled
    ? { label: 'دریافت می‌کند', color: 'success' }
    : { label: 'لغو کرده', color: 'neutral' }
