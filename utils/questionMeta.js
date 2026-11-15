// Labels/colors for BACK's GoodsQuestionStatus (a customer's own question, MyGoodsQuestionDTO.status). Colors are Nuxt UI tokens.
export const QUESTION_STATUS_META = {
  PENDING: { label: 'در انتظار پاسخ فروشگاه', color: 'warning' },
  ANSWERED: { label: 'پاسخ داده شد', color: 'success' },
  REJECTED: { label: 'رد شده', color: 'error' },
}

export const questionStatusMeta = (status) =>
  QUESTION_STATUS_META[status] ?? { label: status ?? '', color: 'neutral' }
