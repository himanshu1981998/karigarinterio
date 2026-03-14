import { ShoppingBag } from "lucide-react"
import {
  Sheet,
  SheetContent,
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
  const totalItems = useCartStore((state) => state.totalItems)

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-[420px] rounded-l-2xl shadow-xl">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({totalItems()})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <ShoppingBag className="h-12 w-12 text-zinc-300" />
            <h3 className="mt-4 text-lg font-medium">Your cart is empty</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add some items to get started
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto py-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            <CartSummary />
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}