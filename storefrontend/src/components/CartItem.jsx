import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cartStore"

export function CartItem({ item }) {
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const increaseQuantity = useCartStore((state) => state.increaseQuantity)
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity)

  // HANDLE BOTH STRUCTURES
  const product = item.product || item

  const price = Number(product?.price || 0)
  const originalPrice = Number(product?.original_price || product?.originalPrice || 0)
  const hasMrp = originalPrice > price

  const discountPercent =
    hasMrp
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0

  return (
    <div className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
      
      {/* IMAGE */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
        {product?.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-400">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        
        {/* TITLE + REMOVE */}
        <div className="flex justify-between gap-2">
          <div>
            <h4 className="text-sm font-medium text-zinc-900 line-clamp-2">
              {product?.name}
            </h4>

            <div className="mt-1">

              {/* ORIGINAL PRICE */}
              {hasMrp && (
                <p className="text-xs text-zinc-400 line-through">
                  ₹{originalPrice.toLocaleString()}
                </p>
              )}

              {/* CURRENT PRICE */}
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-zinc-900">
                  ₹{Number(price).toLocaleString()}
                </p>

                {discountPercent > 0 && (
                  <span className="text-xs text-green-600 font-semibold">
                    ({discountPercent}% OFF)
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-500 hover:text-red-500"
            onClick={() => removeFromCart(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* QUANTITY */}
        <div className="mt-2 flex justify-end">
          <div className="flex items-center gap-3 rounded-full border bg-zinc-100 px-3 py-1">
            
            <button
              onClick={() => decreaseQuantity(item.id)}
              className="text-lg"
            >
              -
            </button>

            <span className="text-sm font-semibold">
              {item.quantity}
            </span>

            <button
              onClick={() => increaseQuantity(item.id)}
              className="text-lg"
            >
              +
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}
