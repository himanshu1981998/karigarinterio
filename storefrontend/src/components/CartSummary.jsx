import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cartStore"
import { useAuthStore } from "@/store/authStore"
import { useAuthModalStore } from "@/store/authModalStore"
import { useNavigate } from "react-router-dom"

export function CartSummary() {
  const navigate = useNavigate()

  const items = useCartStore((state) => state.items)
  const closeCart = useCartStore((state) => state.closeCart)

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const openLoginModal = useAuthModalStore((state) => state.openLoginModal)

  const isCartEmpty = items.length === 0

  // HANDLE BOTH CART TYPES
  const totalOriginalPrice = items.reduce((total, item) => {
    const product = item.product || item
    const price =
      product?.original_price || product?.originalPrice || product?.price || 0

    return total + Number(price) * item.quantity
  }, 0)

  const totalPrice = items.reduce((total, item) => {
    if (item.line_total) {
      return total + Number(item.line_total) // backend cart
    }

    const product = item.product || item
    return total + Number(product.price) * item.quantity // guest cart
  }, 0)

  const savedAmount = totalOriginalPrice - totalPrice

 const handleCheckout = () => {
  if (isCartEmpty) return

  if (!isLoggedIn) {
    
    closeCart()

    setTimeout(() => {
      openLoginModal("/checkout")
    }, 150)

    return
  }

  closeCart()

  setTimeout(() => {
    navigate("/checkout")
  }, 150)
}

  if (isCartEmpty) return null

  return (
    <div className="sticky bottom-0 rounded-t-2xl border-t bg-white px-3 pb-3 pt-3 shadow-[0_-6px_20px_rgba(0,0,0,0.05)]">
      
      {/* SAVINGS */}
      {savedAmount > 0 && (
        <div className="mb-3 rounded-full bg-green-600 px-3 py-1.5 text-center text-xs font-semibold text-white">
          ₹{savedAmount.toLocaleString()} Saved so far!
        </div>
      )}

      {/* TOTAL */}
      <div className="mb-2.5 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500">
            Estimated Total
          </p>

          <div className="flex items-center gap-2">
            {totalOriginalPrice > totalPrice && (
              <span className="text-sm text-zinc-400 line-through">
                ₹{totalOriginalPrice.toLocaleString()}
              </span>
            )}

            <p className="text-2xl font-bold text-zinc-900">
              ₹{totalPrice.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* BUTTON */}
      <Button
        className="h-12 w-full rounded-3xl text-sm font-semibold bg-[#8B5E3C] text-white hover:bg-[#7A5234]"
        onClick={handleCheckout}
        disabled={isCartEmpty}
      >
        {isLoggedIn ? "Checkout" : "Login to Checkout"}
      </Button>
    </div>
  )
}
