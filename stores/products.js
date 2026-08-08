import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProductsStore = defineStore('products', () => {
  const products = ref([
    { id: 1, nameFa: 'آموکسی‌سیلین ۵۰۰ میلی‌گرم', nameEn: 'Amoxicillin 500mg', brandTitle: 'ایران داروک', category: 'آنتی‌بیوتیک', price: 185000, inStock: true, isPrescriptionRequired: true },
    { id: 2, nameFa: 'ویتامین D3 هزار IU', nameEn: 'Vitamin D3 1000 IU', brandTitle: 'زاگرس فارمد', category: 'ویتامین و مکمل', price: 125000, inStock: true, isPrescriptionRequired: false },
    { id: 3, nameFa: 'قرص بروفن ۴۰۰ میلی‌گرم', nameEn: 'Ibuprofen 400mg', brandTitle: 'داروپخش', category: 'مسکن و ضد درد', price: 48000, inStock: false, isPrescriptionRequired: false },
    { id: 4, nameFa: 'متفورمین ۵۰۰ میلی‌گرم', nameEn: 'Metformin 500mg', brandTitle: 'امین', category: 'دیابت', price: 67000, inStock: true, isPrescriptionRequired: true, expiryDate: '2024-09-01' },
    { id: 5, nameFa: 'لوراتادین ۱۰ میلی‌گرم', nameEn: 'Loratadine 10mg', brandTitle: 'البرز دارو', category: 'تنفسی', price: 38000, inStock: true, isPrescriptionRequired: false },
    { id: 6, nameFa: 'امگا ۳ ۱۰۰۰ میلی‌گرم', nameEn: 'Omega-3 1000mg', brandTitle: 'رازی', category: 'ویتامین و مکمل', price: 210000, inStock: false, isPrescriptionRequired: false },
    { id: 7, nameFa: 'آتورواستاتین ۲۰ میلی‌گرم', nameEn: 'Atorvastatin 20mg', brandTitle: 'پارس دارو', category: 'قلب و عروق', price: 95000, inStock: true, isPrescriptionRequired: true, expiryDate: '2024-08-15' },
    { id: 8, nameFa: 'ویتامین C ۵۰۰ میلی‌گرم', nameEn: 'Vitamin C 500mg', brandTitle: 'داملران', category: 'ویتامین و مکمل', price: 56000, inStock: true, isPrescriptionRequired: false, discountPercent: 10 },
  ])

  const categoryItems = [
    { label: 'همه دسته‌ها', value: 'all' },
    { label: 'مسکن و ضد درد', value: 'مسکن و ضد درد' },
    { label: 'ویتامین و مکمل', value: 'ویتامین و مکمل' },
    { label: 'آنتی‌بیوتیک', value: 'آنتی‌بیوتیک' },
    { label: 'قلب و عروق', value: 'قلب و عروق' },
    { label: 'دیابت', value: 'دیابت' },
    { label: 'تنفسی', value: 'تنفسی' },
  ]

  const getById = (id) => products.value.find((p) => String(p.id) === String(id))

  const addProduct = (data) => {
    const id = Date.now()
    products.value.unshift({ id, ...data })
    return id
  }

  const updateProduct = (updated) => {
    const idx = products.value.findIndex((p) => String(p.id) === String(updated.id))
    if (idx !== -1) products.value[idx] = updated
  }

  const removeProduct = (id) => {
    products.value = products.value.filter((p) => String(p.id) !== String(id))
  }

  return { products, categoryItems, getById, addProduct, updateProduct, removeProduct }
})