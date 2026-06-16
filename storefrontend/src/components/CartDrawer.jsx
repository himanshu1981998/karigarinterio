import { ShoppingBag } from "lucide-react"
import { Skeleton } from "boneyard-js/react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCartStore } from "@/store/cartStore"
import { CartItem } from "./CartItem"
import { CartSummary } from "./CartSummary"
import { CartItemsSkeleton } from "@/components/skeletons/BoneyardSkeletons"
import { cartItemFixture } from "@/components/skeletons/fixtures"

export function CartDrawer() {
  const items = useCartStore((state) => state.items)
  const isCartOpen = useCartStore((state) => state.isCartOpen)
  const closeCart = useCartStore((state) => state.closeCart)
  const totalItems = useCartStore((state) => state.totalItems())
  const loading = useCartStore((state) => state.loading)

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex w-full flex-col gap-0 bg-zinc-100 p-0 sm:max-w-[420px] rounded-l-2xl overflow-hidden shadow-xl">

        {/* HEADER */}
        <SheetHeader className="border-b bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            
            <SheetTitle className="flex items-center gap-2 text-lg font-bold">
              <ShoppingBag className="h-5 w-5" />
              Your Cart ({totalItems})
            </SheetTitle>

          </div>
        </SheetHeader>

        {/* EMPTY STATE */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center px-6">
            <ShoppingBag className="h-10 w-10 text-zinc-300" />
            <h3 className="mt-3 font-semibold">Your cart is empty</h3>
            <p className="text-sm text-zinc-500">
              Add some items to get started
            </p>
          </div>
        ) : (
          <>
            {/* ITEMS */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              <Skeleton
                name="cart-drawer"
                loading={loading}
                fallback={<CartItemsSkeleton />}
                fixture={
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <CartItem
                        key={`cart-fixture-${index}`}
                        item={{ ...cartItemFixture, id: `cart-fixture-${index}` }}
                      />
                    ))}
                  </div>
                }
              >
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
                
              ))}
                </Skeleton>
            </div>

            {/* SUMMARY */}
            <CartSummary />
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
