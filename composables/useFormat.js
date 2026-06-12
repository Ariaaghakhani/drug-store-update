export const useFormat = () => {
  const formatCount = (n) => Number(n).toLocaleString('fa-IR')

  const formatPrice = (amount) => Number(amount).toLocaleString('fa-IR') + ' تومان'

  const formatThousands = (amount) => {
    const thousands = Math.round(Number(amount) / 1000)
    return thousands.toLocaleString('fa-IR') + ' هزار تومان'
  }

  const formatDays = (n) => Number(n).toLocaleString('fa-IR') + ' روز'

  return { formatCount, formatPrice, formatThousands, formatDays }
}