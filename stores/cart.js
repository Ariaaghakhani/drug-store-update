import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    isOpen: false,
  }),

  getters: {
    itemCount: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    },

    subtotal: (state) => {
      return state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      )
    },

    total: (state) => {
      const subtotal = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      )
      const shipping = subtotal > 50 ? 0 : 5.99
      return subtotal + shipping
    },

    hasItems: (state) => state.items.length > 0,
  },

  actions: {
    loadCartItems() {
      if (this.items.length === 0) {
        const saved = localStorage.getItem('cart')
        if (saved) {
          try {
            this.items = JSON.parse(saved)
          } catch (e) {
            console.error('Failed to load cart from storage', e)
          }
        }
      }
    },

    addItem(product) {
      const existingItem = this.items.find((item) => item.id === product.id)
      let quantityAdded

      if (existingItem) {
        // Item already exists, just add 1 more
        existingItem.quantity += 1
        quantityAdded = 1
      } else {
        // New item: add with minimum order quantity
        quantityAdded =
          product.minOrderQuantity && product.minOrderQuantity > 1
            ? Number(product.minOrderQuantity)
            : 1

        this.items.push({
          ...product,
          quantity: quantityAdded,
        })
      }

      // Open cart dropdown when item is added
      this.isOpen = true

      // Save to localStorage
      this.saveToStorage()

      // Return quantity added for toast message
      return quantityAdded
    },

    removeItem(productId) {
      const index = this.items.findIndex((item) => item.id === productId)
      if (index > -1) {
        this.items.splice(index, 1)
      }
      this.saveToStorage()
    },

    updateQuantity(productId, quantity) {
      const item = this.items.find((item) => item.id === productId)
      if (item) {
        if (quantity <= 0) {
          this.removeItem(productId)
        } else {
          item.quantity = Number(quantity)
        }
      }
      this.saveToStorage()
    },

    incrementQuantity(productId) {
      const item = this.items.find((item) => item.id === productId)
      if (item) {
        item.quantity++
        this.saveToStorage()
      }
    },

    decrementQuantity(productId) {
      const item = this.items.find((item) => item.id === productId)
      if (item) {
        if (item.quantity > 1) {
          item.quantity--
          this.saveToStorage()
        } else {
          this.removeItem(productId)
        }
      }
    },

    clearCart() {
      this.items = []
      this.saveToStorage()
    },

    toggleCart() {
      this.isOpen = !this.isOpen
    },

    openCart() {
      this.isOpen = true
    },

    closeCart() {
      this.isOpen = false
    },

    // Manual persistence methods
    saveToStorage() {
      if (import.meta.client) {
        localStorage.setItem('cart', JSON.stringify(this.items))
      }
    },

    loadFromStorage() {
      if (import.meta.client) {
        const saved = localStorage.getItem('cart')
        if (saved) {
          try {
            this.items = JSON.parse(saved)
          } catch (e) {
            console.error('Failed to load cart from storage', e)
          }
        }
      }
    },
  },
})
