import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  fetchCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart as clearCartApi,
} from "@/lib/cartApi"

import { useAuthStore } from "@/store/authStore"

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      cartBump: false,
      loading: false,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      triggerCartBump: () => {
        set({ cartBump: true })
        setTimeout(() => set({ cartBump: false }), 300)
      },

      //  ADD TO CART
      addToCart: async (product) => {
        const isLoggedIn = useAuthStore.getState().isLoggedIn

        //  GUEST CART
        if (!isLoggedIn) {
          set((state) => {
            const existing = state.items.find((i) => i.id === product.id)

            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.id === product.id
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
                ),
              }
            }

            return {
              items: [...state.items, { ...product, quantity: 1 }],
            }
          })

          get().triggerCartBump()
          return
        }

        // LOGGED-IN → BACKEND
        try {
          await addCartItem(product.id, 1)
          await get().loadCart()
          get().triggerCartBump()
        } catch (err) {
          console.error("Add to cart failed", err)
        }
      },

      //  LOAD CART (ONLY FOR LOGGED IN)
      loadCart: async () => {
        const isLoggedIn = useAuthStore.getState().isLoggedIn
        if (!isLoggedIn) return

        try {
          set({ loading: true })

          const data = await fetchCart()

          set({
            items: data.items,
          })
        } catch (err) {
          if (err.response?.status === 401) return
          console.error("Load cart failed", err)
        } finally {
          set({ loading: false })
        }
      },

      //  REMOVE ITEM
      removeFromCart: async (id) => {
        const isLoggedIn = useAuthStore.getState().isLoggedIn

        if (!isLoggedIn) {
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
          }))
          return
        }

        try {
          await removeCartItem(id)
          await get().loadCart()
        } catch (err) {
          console.error("Remove failed", err)
        }
      },

      //  INCREASE
      increaseQuantity: async (id) => {
        const isLoggedIn = useAuthStore.getState().isLoggedIn

        if (!isLoggedIn) {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          }))
          return
        }

        try {
          const item = get().items.find((i) => i.id === id)
          await updateCartItem(id, item.quantity + 1)
          await get().loadCart()
        } catch (err) {
          console.error("Increase failed", err)
        }
      },

      // DECREASE
      decreaseQuantity: async (id) => {
        const isLoggedIn = useAuthStore.getState().isLoggedIn

        if (!isLoggedIn) {
          set((state) => ({
            items: state.items
              .map((item) =>
                item.id === id
                  ? { ...item, quantity: item.quantity - 1 }
                  : item
              )
              .filter((item) => item.quantity > 0),
          }))
          return
        }

        try {
          const item = get().items.find((i) => i.id === id)

          if (item.quantity <= 1) {
            await removeCartItem(id)
          } else {
            await updateCartItem(id, item.quantity - 1)
          }

          await get().loadCart()
        } catch (err) {
          console.error("Decrease failed", err)
        }
      },

      //  CLEAR CART
      clearCart: async () => {
        const isLoggedIn = useAuthStore.getState().isLoggedIn

        if (!isLoggedIn) {
          set({ items: [] })
          return
        }

        try {
          await clearCartApi()
          set({ items: [] })
        } catch (err) {
          console.error("Clear cart failed", err)
        }
      },

      //  SYNC GUEST CART AFTER LOGIN
      syncGuestCart: async () => {
        const isLoggedIn = useAuthStore.getState().isLoggedIn
        if (!isLoggedIn) return

        const guestItems = get().items

        if (guestItems.length === 0) return

        try {
          for (const item of guestItems) {
            await addCartItem(item.id, item.quantity)
          }

          // clear guest cart
          set({ items: [] })

          // load backend cart
          await get().loadCart()
        } catch (err) {
          console.error("Cart sync failed", err)
        }
      },

      //  TOTALS
      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, item) =>
            sum +
            (item.line_total
              ? Number(item.line_total)
              : item.price * item.quantity),
          0
        ),
    }),
    {
      name: "cart-storage",
    }
  )
)