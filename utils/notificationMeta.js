// Icon + icon-tile classes for BACK's NotificationType enum (UserNotificationDTO.type).
export const NOTIFICATION_TYPE_META = {
  ORDER: { label: 'سفارش', icon: 'i-heroicons-shopping-bag', tile: 'bg-brand-50 dark:bg-brand-900/20 text-brand-500 dark:text-brand-400' },
  ORDER_RETURN: { label: 'مرجوعی', icon: 'i-heroicons-arrow-uturn-left', tile: 'bg-warning/10 dark:bg-warning/20 text-warning' },
  TICKET: { label: 'پشتیبانی', icon: 'i-heroicons-lifebuoy', tile: 'bg-info/10 dark:bg-info/20 text-info' },
  PRESCRIPTION: { label: 'نسخه', icon: 'i-heroicons-document-text', tile: 'bg-warning/10 dark:bg-warning/20 text-warning' },
  WALLET: { label: 'کیف پول', icon: 'i-heroicons-wallet', tile: 'bg-success/10 dark:bg-success/20 text-success' },
  STOCK_ALERT: { label: 'موجود شد', icon: 'i-heroicons-bell-alert', tile: 'bg-success/10 dark:bg-success/20 text-success' },
  LOW_STOCK: { label: 'کمبود موجودی', icon: 'i-heroicons-archive-box-x-mark', tile: 'bg-error/10 dark:bg-error/20 text-error' },
}

export const notificationTypeMeta = (type) =>
  NOTIFICATION_TYPE_META[type] ?? {
    label: '',
    icon: 'i-heroicons-bell',
    tile: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  }

// "۵ دقیقه پیش" style relative time for recent items, falling back to a Persian date after a week
export const notificationTime = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (minutes < 1) return 'همین حالا'
  if (minutes < 60) return `${minutes.toLocaleString('fa-IR')} دقیقه پیش`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours.toLocaleString('fa-IR')} ساعت پیش`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days.toLocaleString('fa-IR')} روز پیش`
  return date.toLocaleDateString('fa-IR')
}
