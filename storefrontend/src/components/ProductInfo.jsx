import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cartStore"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useCheckoutStore } from "@/store/checkoutStore"

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
    <div className="space-y-5 lg:space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
          {product.name}
        </h1>

        {product.sku && (
          <p className="mt-1 text-sm text-zinc-500">{product.sku}</p>
        )}
      </div>

      {/* Price */}
      <div className="flex items-center gap-2">
        <p className="text-xl font-bold">
          ₹{price.toLocaleString()}
        </p>

        {hasMrp && (
          <p className="text-sm line-through text-zinc-400">
            ₹{originalPrice.toLocaleString()}
          </p>
        )}

        {product.discount_percentage > 0 && (
          <span className="rounded-xl bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
            {product.discount_percentage}% OFF
          </span>
        )}
      </div>

      {/* Description */}
      {product.short_description && (
        <p className="text-sm text-zinc-600">
          {product.short_description}
        </p>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        
        {!cartItem ? (
          <Button
            className="h-11 w-full rounded-full sm:flex-1"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        ) : (
          <div className="flex h-11 w-full items-center justify-between rounded-full border px-4 sm:flex-1">
            
            <button
              onClick={() => decreaseQuantity(cartItem.id)}
              className="text-lg"
            >
              -
            </button>

            <span className="text-sm font-semibold">
              {cartItem.quantity}
            </span>

            <button
              onClick={() => increaseQuantity(cartItem.id)}
              className="text-lg"
            >
              +
            </button>

          </div>
        )}

        <Button
          variant="outline"
          className="h-11 w-full rounded-full sm:flex-1"
          onClick={handleBuyNow}
        >
          Buy Now
        </Button>

      </div>
    </div>
  )
}

export default ProductInfo
