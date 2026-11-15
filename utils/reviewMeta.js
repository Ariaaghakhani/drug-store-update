// Labels/colors for BACK's GoodsReviewStatus (a customer's own review, MyGoodsReviewDTO.status). Colors are Nuxt UI tokens.
export const REVIEW_STATUS_META = {
  PENDING: { label: 'در انتظار تأیید فروشگاه', color: 'warning' },
  APPROVED: { label: 'منتشر شده', color: 'success' },
  REJECTED: { label: 'رد شده', color: 'error' },
}

export const reviewStatusMeta = (status) =>
  REVIEW_STATUS_META[status] ?? { label: status ?? '', color: 'neutral' }
