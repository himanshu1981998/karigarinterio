import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cartStore"

const ProductInfo = ({ product }) => {
  const addToCart = useCartStore((state) => state.addToCart)

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) /
      product.originalPrice) *
      100
  )

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-3xl font-bold text-zinc-900">
        {product.name}
      </h1>

      {/* Price */}
      <div className="space-y-1">
        <p className="text-sm text-zinc-400 line-through">
          ₹{product.originalPrice}
        </p>

        <div className="flex items-center gap-3">
          <p className="text-3xl font-bold text-zinc-900">
            ₹{product.price}
          </p>

          <span className="text-sm font-semibold text-green-600">
            ({discountPercent}% OFF)
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-zinc-600 leading-relaxed">
        {product.description}
      </p>

      {/* Quantity */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Quantity</span>

        <div className="flex items-center rounded-full border px-3 py-1">
          <button className="px-2">-</button>
          <span className="px-3 text-sm">1</span>
          <button className="px-2">+</button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <Button
          className="flex-1"
          onClick={() => addToCart(product)}
        >
          Add to Cart
        </Button>

        <Button
          variant="outline"
          className="flex-1"
        >
          Buy Now
        </Button>
      </div>

      {/* Delivery info */}
      <div className="rounded-xl bg-zinc-100 p-4 text-sm text-zinc-600">
        Free delivery within 5–7 days.
      </div>
    </div>
  )
}

export default ProductInfo