import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cartStore"

export function CartItem({ item }) {
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const increaseQuantity = useCartStore((state) => state.increaseQuantity)
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity)

  return (
    <div className="flex gap-4 rounded-lg border p-3">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-100">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-400">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-zinc-900">{item.name}</h4>
            <p className="mt-1 text-sm text-zinc-500">₹{item.price}</p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-red-500"
            onClick={() => removeFromCart(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => decreaseQuantity(item.id)}
          >
            -
          </Button>

          <span className="min-w-6 text-center text-sm font-medium">
            {item.quantity}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => increaseQuantity(item.id)}
          >
            +
          </Button>
        </div>
      </div>
    </div>
  )
}