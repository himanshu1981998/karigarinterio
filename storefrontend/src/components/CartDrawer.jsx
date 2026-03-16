import { ShoppingBag } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCartStore } from "@/store/cartStore"
import { CartItem } from "./CartItem"
import { CartSummary } from "./CartSummary"

export function CartDrawer() {
  const items = useCartStore((state) => state.items)
  const isCartOpen = useCartStore((state) => state.isCartOpen)
  const closeCart = useCartStore((state) => state.closeCart)

  const totalItems = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  )

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex w-full flex-col gap-0 border-l-0 bg-zinc-100 p-0 sm:max-w-[420px] rounded-l-2xl overflow-hidden shadow-xl">
        <SheetHeader className="sticky top-0 z-20 border-b bg-white px-4 py-3">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold text-zinc-900">
            <ShoppingBag className="h-4 w-4" />
            Your Cart ({totalItems} items)
          </SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-zinc-300" />
            <h3 className="mt-3 text-base font-semibold text-zinc-900">
              Your cart is empty
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Add some items to get started
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-3 py-3">
              <div className="space-y-3">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            <CartSummary />
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}