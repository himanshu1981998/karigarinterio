import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cartStore"

export function CartItem({ item }) {
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const increaseQuantity = useCartStore((state) => state.increaseQuantity)
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity)

  const savedAmount =
  item.originalPrice && item.originalPrice > item.price
    ? (item.originalPrice - item.price) * item.quantity
    : 0

  const discountPercent =
     item.originalPrice && item.originalPrice > item.price
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
        : 0

  return (
    <div className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">
            No image
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="line-clamp-3 text-sm font-medium leading-5 text-zinc-900">
              {item.name}
            </h4>

         <div className="mt-1.5">
           {item.originalPrice && item.originalPrice > item.price && (
           <p className="text-xs text-zinc-400 line-through">
               ₹{item.originalPrice.toLocaleString()}
            </p>
             )}

         <div className="flex items-center gap-2">
           <p className="text-lg font-bold text-zinc-900">
               ₹{item.price.toLocaleString()}
                </p>

             {discountPercent > 0 && (
              <span className="text-xs font-semibold text-green-600">
                 ({discountPercent}% OFF)
              </span>
              )}
             </div>


              </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-zinc-500 hover:text-red-500"
            onClick={() => removeFromCart(item.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="mt-2 flex justify-end">
          <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1">
            <button
              onClick={() => decreaseQuantity(item.id)}
              className="text-base font-medium leading-none text-zinc-700"
            >
              -
            </button>

            <span className="min-w-4 text-center text-xs font-semibold text-zinc-900">
              {item.quantity}
            </span>

            <button
              onClick={() => increaseQuantity(item.id)}
              className="text-base font-medium leading-none text-zinc-700"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}