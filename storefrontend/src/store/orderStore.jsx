import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [],

      placeOrder: (orderData, cartItems, totalAmount) => {
        const timestamp=Date.now()
        const newOrder = {
          id: timestamp,
          orderNumber: `OID-${timestamp}`,
          items: cartItems,
          totalAmount,
          customer: orderData,
          status: "Processing",
          createdAt: new Date().toISOString(),
        }

        set({
          orders: [newOrder, ...get().orders],
        })

        return newOrder
      },
    }),
    {
      name: "order-storage",
    }
  )
)