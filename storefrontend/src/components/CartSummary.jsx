import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cartStore"

export function CartSummary() {
  const items = useCartStore((state) => state.items)

  const totalPrice = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.price * item.quantity, 0)
  )

  const totalOriginalPrice = useCartStore((state) =>
    state.items.reduce(
      (total, item) =>
        total + (item.originalPrice ? item.originalPrice : item.price) * item.quantity,
      0
    )
  )

  const savedAmount = totalOriginalPrice - totalPrice

  if (items.length === 0) return null

  return (
    <div className="sticky bottom-0 rounded-t-2xl border-t bg-white px-3 pb-3 pt-3 shadow-[0_-6px_20px_rgba(0,0,0,0.05)]">
      {savedAmount > 0 && (
        <div className="mb-3 rounded-full bg-teal-500 px-3 py-1.5 text-center text-xs font-semibold text-white">
          ₹{savedAmount.toLocaleString()} Saved so far!
        </div>
      )}

      <div className="mb-2.5 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500">Estimated Total</p>

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

      <Button className="h-12 w-full rounded-xl bg-green-500 text-sm font-semibold text-white hover:bg-green-600">
        Checkout
      </Button>
    </div>
  )
}