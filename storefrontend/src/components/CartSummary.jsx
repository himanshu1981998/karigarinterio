import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cartStore"

export function CartSummary() {
  const items = useCartStore((state) => state.items)
  const totalPrice = useCartStore((state) => state.totalPrice)
  const closeCart = useCartStore((state) => state.closeCart)

  if (items.length === 0) return null

  return (
    <div className="border-t p-4">
      <div className="flex items-center justify-between text-base font-medium">
        <span>Subtotal</span>
        <span>₹{totalPrice()}</span>
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        Shipping calculated at checkout
      </p>

      <div className="mt-4">
        <Button className="w-full" asChild>
          <Link to="/checkout" onClick={closeCart}>
            Checkout
          </Link>
        </Button>
      </div>

      <div className="mt-3 text-center">
        <Link
          to="/"
          onClick={closeCart}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Continue Shopping →
        </Link>
      </div>
    </div>
  )
}