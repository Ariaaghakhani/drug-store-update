// Maps the storefront search/home/related card (StorefrontGoodsDTO, or a GoodsDocument from POST api/elastic/search —
// same fields) to the `product` shape ProductCard renders.
//
// `id` is the sellable goods id (a variant's own id); `linkId` is where the product page lives: `groupId` is the model
// for a product with variants, or the goods itself for a simple one. A card with several variants can't be added to the
// cart before a variant is picked, so it sends the shopper to the product page instead (`hasVariants`).
export const toProductCard = (dto, { badge = null } = {}) => {
  const hasVariants = Number(dto.variantCount) > 1
  const discountPercent = Number(dto.activeDiscountPercent) || 0
  const onSale = !hasVariants && discountPercent > 0

  return {
    id: dto.id,
    linkId: dto.groupId ?? dto.id,
    nameFa: dto.nameFa,
    nameEn: dto.nameEn || '',
    brandTitle: dto.brand || '',
    image: dto.imageUrl || null,
    // a model shows its cheapest variant ("از …"); a simple product shows the price after the active discount
    price: hasVariants ? Number(dto.minPrice ?? dto.price) : Number(dto.finalPrice ?? dto.price),
    originalPrice: onSale ? Number(dto.price) : null,
    discountPercent: onSale ? Math.round(discountPercent) : null,
    hasVariants,
    rating: dto.ratingAverage || 0,
    reviewCount: dto.reviewCount || 0,
    inStock: Number(dto.quantityOnHand) > 0,
    expiryLabel: dto.expiryLabel || '',
    daysToExpiry: dto.daysToExpiry ?? null,
    badge,
  }
}

// What the cart needs from a (non-variant) card.
export const toCartItem = (card) => ({
  id: card.id,
  nameFa: card.nameFa,
  nameEn: card.nameEn,
  price: card.price,
  image: card.image,
  minOrderQuantity: 1,
})

// GoodsInfoDTO sections accept simple HTML from the store. They're shown as plain text (never v-html): block breaks
// become newlines and every other tag is dropped.
export const htmlToText = (html) =>
  String(html ?? '')
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/\s*(p|div|li|h[1-6])\s*>/gi, '\n')
    .replace(/<\s*li[^>]*>/gi, '• ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

// GoodsAttributeValueDTO → the text shown in the specs table; null when the attribute has no value
export const attributeValueText = (attribute) => {
  if (attribute.optionValues?.length) return attribute.optionValues.join('، ')
  if (attribute.booleanValue != null) return attribute.booleanValue ? 'دارد' : 'ندارد'
  if (attribute.number != null) {
    const number = Number(attribute.number).toLocaleString('fa-IR')
    return attribute.unit ? `${number} ${attribute.unit}` : number
  }
  return attribute.text || null
}

// "قرمز، L" — a variant's axis values as one label
export const variantLabel = (variant) =>
  (variant.axes ?? []).map((axis) => axis.optionValue).filter(Boolean).join('، ') || variant.nameFa || variant.goodCode

// Category icon from the name (BACK has no icon field); the keyword → icon table is DESIGN_SYSTEM.md's category list.
const CATEGORY_ICONS = [
  ['مسکن', 'i-heroicons-heart'],
  ['ویتامین', 'i-heroicons-beaker'],
  ['مکمل', 'i-heroicons-beaker'],
  ['قلب', 'mdi:heart-pulse'],
  ['گوارش', 'i-heroicons-sparkles'],
  ['پوست', 'i-heroicons-user'],
  ['مو', 'i-heroicons-user'],
  ['اعصاب', 'mdi:brain'],
  ['روان', 'mdi:brain'],
  ['تنفس', 'mdi:lungs'],
  ['کودک', 'mdi:baby-face-outline'],
  ['زنان', 'mdi:gender-female'],
  ['دیابت', 'mdi:water'],
  ['آنتی', 'i-heroicons-shield-check'],
  ['چشم', 'i-heroicons-eye'],
]
export const categoryIcon = (name) =>
  CATEGORY_ICONS.find(([keyword]) => String(name ?? '').includes(keyword))?.[1] ?? 'i-heroicons-squares-2x2'

// Home section keys (HomeSection enum) → the "view all" link on that section's header. A null link hides the button.
export const HOME_SECTION_LINKS = {
  TIMED_OFFER: '/medications?timedOffer=true&sort=ENDING_SOON',
  MOST_DISCOUNTED: '/medications?onSale=true&sort=MOST_DISCOUNTED',
  SPECIAL: null,
  BEST_SELLING: null,
  NEWEST: '/medications?sort=NEWEST',
  POPULAR: '/medications?sort=POPULAR',
  MOST_VIEWED: '/medications?sort=MOST_VIEWED',
  NEAR_EXPIRY: '/near-expiry',
}

export const SORT_OPTIONS = [
  { label: 'مرتبط‌ترین', value: 'RELEVANCE' },
  { label: 'جدیدترین', value: 'NEWEST' },
  { label: 'ارزان‌ترین', value: 'CHEAPEST' },
  { label: 'گران‌ترین', value: 'MOST_EXPENSIVE' },
  { label: 'بیشترین تخفیف', value: 'MOST_DISCOUNTED' },
  { label: 'محبوب‌ترین', value: 'POPULAR' },
  { label: 'پربازدیدترین', value: 'MOST_VIEWED' },
  { label: 'زودتر تمام‌شدن تخفیف', value: 'ENDING_SOON' },
]
