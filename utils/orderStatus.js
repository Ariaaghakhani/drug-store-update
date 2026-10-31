// Order status labels keyed by BACK's `OrderDTO.statusCode` (same in every store; `statusId` differs per store, so never
// key on it). Note the order status is CANCELLED (two L's) while the payment status is CANCELED (one L).
export const ORDER_STATUS_META = {
  PENDING: { label: 'در انتظار پرداخت', color: 'warning' },
  PAID: { label: 'پرداخت شده', color: 'success' },
  FAILED: { label: 'پرداخت ناموفق', color: 'error' },
  CANCELLED: { label: 'لغو شده', color: 'neutral' },
}

// Persian label by code; unknown codes fall back to BACK's `statusTitle` (the store catalog title, English by default)
export const orderStatusMeta = (order) =>
  ORDER_STATUS_META[order?.statusCode] ?? {
    label: order?.statusTitle || order?.statusCode || '',
    color: 'neutral',
  }
