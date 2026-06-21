export interface Product {
  id: string | number
  nameFa: string
  nameEn?: string
  brandTitle?: string
  category?: string
  price: number
  originalPrice?: number
  discountPercent?: number
  rating?: number
  reviewCount?: number
  inStock: boolean
  badge?: string
  isPrescriptionRequired?: boolean
  minOrderQuantity?: number
  expiryDate?: string
}