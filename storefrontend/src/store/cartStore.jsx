import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen:false,
      cartBump:false,
      isLoggedIn:false,
      openCart: ()=>set({isCartOpen:true}),
      closeCart: ()=>set({isCartOpen:false}),
      
      logIn:()=>set({isLoggedIn:true}),
      logOut:()=>set({isLoggedIn:false}),

       triggerCartBump: () => {
        set({ cartBump: true })
        setTimeout(() => set({ cartBump: false }), 300)
      },

      addToCart: (product) =>
        set((state) => {
          const existing = state.items.find((item) => item.id === product.id)

          if (existing) {
             if (existing.quantity >= product.stock) return state
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            }
          }

          return {
            items: [...state.items, { ...product, quantity: 1 }],
          }
        }),

      removeFromCart: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      increaseQuantity: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        })),

      decreaseQuantity: (id) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === id
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),

      clearCart: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
    }),
    {
      name: "cart-storage",
    }
  )
)