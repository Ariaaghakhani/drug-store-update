// BACK answers 400 `payment.return-origin.not-allowed` when `returnOrigin` isn't one of the store's registered domains.
// That is a deployment/configuration problem, not something the customer can fix, so say so plainly.
export const RETURN_ORIGIN_NOT_ALLOWED = 'payment.return-origin.not-allowed'

export const paymentErrorMessage = (error, fallback) => {
  const data = error?.response?.data
  const haystack = `${data?.errorCode ?? ''} ${data?.message ?? ''}`
  if (haystack.includes(RETURN_ORIGIN_NOT_ALLOWED)) {
    return 'پیکربندی دامنه فروشگاه ناقص است؛ این دامنه برای پرداخت ثبت نشده است. لطفاً با پشتیبانی تماس بگیرید.'
  }
  return data?.message ?? fallback
}
