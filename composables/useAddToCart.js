// Add a ProductCard-shaped product to the cart from a list/grid and toast the result.
// A card with several variants can't be added until a variant is picked, so it opens the product page instead.
import { useCartStore } from '~/stores/cart'

export const useAddToCart = () => {
  const cartStore = useCartStore()
  const toast = useAppToast()

  const addToCart = (card) => {
    if (!card) return
    if (card.hasVariants) {
      navigateTo(`/medications/${card.linkId}`)
      return
    }

    const quantityAdded = cartStore.addItem(toCartItem(card))
    if (quantityAdded > 1) {
      toast.success('به سبد خرید اضافه شد', `${card.nameFa} - ${quantityAdded} عدد (حداقل سفارش)`)
    } else {
      toast.success('به سبد خرید اضافه شد', card.nameFa || 'محصول')
    }
  }

  return { addToCart }
}
