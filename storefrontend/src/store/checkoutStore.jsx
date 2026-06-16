import { create } from "zustand"

export const useCheckoutStore = create((set) => ({
  checkoutType: "cart", // "cart" | "buy_now"
  buyNowItem: null,

  startBuyNow: (item) =>
    set({
      checkoutType: "buy_now",
      buyNowItem: item,
    }),

  useCartCheckout: () =>
    set({
      checkoutType: "cart",
      buyNowItem: null,
    }),

  clearBuyNow: () =>
    set({
      buyNowItem: null,
    }),
}))