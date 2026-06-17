import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cartStore"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useCheckoutStore } from "@/store/checkoutStore"
import { PackageCheck, ShieldCheck, Truck } from "lucide-react"

const ProductInfo = ({ product }) => {
  const quantity = 1
  const navigate = useNavigate()
  const price = Number(product.price || 0)
  const originalPrice = Number(product.original_price || 0)
  const hasMrp = originalPrice > price

  const addToCart = useCartStore((state) => state.addToCart)
  const increaseQuantity = useCartStore((state) => state.increaseQuantity)
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity)
  const triggerCartBump = useCartStore((state) => state.triggerCartBump)
  const cartItems = useCartStore((state) => state.items)

  const startBuyNow = useCheckoutStore((state) => state.startBuyNow)

  // FIXED: handle both cart types
  const cartItem = cartItems.find(
    (item) => (item.product?.id || item.id) === product.id
  )

  // BUILD BUY NOW ITEM
  const buildCheckoutItem = (qty) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.price),
    originalPrice: product.original_price
      ? Number(product.original_price)
      : null,
    image: product.images?.[0]?.image || "",
    quantity: qty,
  })

  // ADD TO CART
  const handleAddToCart = () => {
    addToCart(product) // FIXED
    triggerCartBump()

    toast.success("Added to cart", {
      description: `${product.name} added in your cart`,
      position: "bottom-center",
    })
  }

  //  BUY NOW
  const handleBuyNow = () => {
    const qty = cartItem ? cartItem.quantity : quantity
    const buyNowProduct = buildCheckoutItem(qty)

    startBuyNow(buyNowProduct)
    navigate("/checkout")
  }

  return (
    <div className="ki-panel rounded-2xl p-5 backdrop-blur sm:p-6 lg:p-7">
      
      {/* Title */}
      <div>
        {product.category?.name && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
            {product.category.name}
          </p>
        )}

        <h1 className="font-display text-3xl font-bold leading-tight text-stone-950 sm:text-4xl lg:text-[2.75rem]">
          {product.name}
        </h1>

        {product.sku && (
          <p className="mt-2 text-sm font-medium text-stone-500">SKU: {product.sku}</p>
        )}
      </div>

      {/* Price */}
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <p className="text-3xl font-bold tracking-tight text-stone-950">
          ₹{price.toLocaleString()}
        </p>

        {hasMrp && (
          <p className="mb-1 text-sm line-through text-stone-400">
            ₹{originalPrice.toLocaleString()}
          </p>
        )}

        {product.discount_percentage > 0 && (
          <span className="mb-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-100">
            {product.discount_percentage}% OFF
          </span>
        )}
      </div>

      {/* Description */}
      {product.short_description && (
        <p className="mt-5 text-sm leading-7 text-stone-600 sm:text-base">
          {product.short_description}
        </p>
      )}

      <div className="mt-6 grid gap-2 rounded-2xl border border-stone-200 bg-stone-50/70 p-3 text-sm text-stone-600">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" />
          <span>Delivery and installation support available</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Secure checkout with COD and online payment</span>
        </div>
        <div className="flex items-center gap-2">
          <PackageCheck className="h-4 w-4 text-primary" />
          <span>Built for everyday home use</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        
        {!cartItem ? (
          <Button
            className="h-12 w-full rounded-full sm:flex-1"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        ) : (
          <div className="flex h-12 w-full items-center justify-between rounded-full border border-stone-300 bg-white px-4 shadow-sm sm:flex-1">
            
            <button
              onClick={() => decreaseQuantity(cartItem.id)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold text-stone-700 transition hover:bg-stone-100"
            >
              -
            </button>

            <span className="text-sm font-semibold">
              {cartItem.quantity}
            </span>

            <button
              onClick={() => increaseQuantity(cartItem.id)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold text-stone-700 transition hover:bg-stone-100"
            >
              +
            </button>

          </div>
        )}

        <Button
          variant="outline"
          className="h-12 w-full rounded-full bg-white sm:flex-1"
          onClick={handleBuyNow}
        >
          Buy Now
        </Button>

      </div>
    </div>
  )
}

export default ProductInfo
