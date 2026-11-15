// Labels and helpers for BACK's shipping methods (ShippingMethodType, ShippingCoverage) and the request mapping.
// The admin list, the form modal and the rate/slot fields all read from here.

export const SHIPPING_TYPE_META = {
  POST: { label: 'پست', icon: 'i-heroicons-envelope' },
  CARRIER: { label: 'تیپاکس / شرکت حمل', icon: 'i-heroicons-truck' },
  STORE_COURIER: { label: 'پیک فروشگاه', icon: 'i-heroicons-map-pin' },
  CUSTOMER_COURIER: { label: 'پیک مشتری', icon: 'i-heroicons-user' },
  PICKUP: { label: 'تحویل حضوری', icon: 'i-heroicons-building-storefront' },
}

export const COVERAGE_LABELS = {
  ALL: 'همه‌جا',
  LISTED: 'فقط مقصدهای تعرفه‌دار',
}

// Types that charge a cost and can carry a per-destination rate table.
export const typeHasCost = (type) => ['POST', 'CARRIER', 'STORE_COURIER'].includes(type)

// Types that take a delivery or visit time slot (pickup hours).
export const typeHasSlots = (type) => ['STORE_COURIER', 'CUSTOMER_COURIER', 'PICKUP'].includes(type)

// Types where the customer collects or meets the courier: no shipping cost is kept for them.
export const isPickupType = (type) => ['PICKUP', 'CUSTOMER_COURIER'].includes(type)

// Turns a stored DTO into a ShippingMethodRequest body: drops the read-only fields and keeps only the rate key fields.
export const toShippingRequest = (dto) => {
  const body = { ...dto }
  delete body.id
  delete body.deliveryMethod
  delete body.createdAt
  body.rates = (dto.rates ?? []).map((rate) => ({
    provinceId: rate.provinceId,
    cityId: rate.cityId ?? null,
    cost: rate.cost,
  }))
  return body
}
