import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cartStore"

const ProductInfo = ({ product }) => {
  const addToCart = useCartStore((state) => state.addToCart)
  const [quantity, setQuantity] = useState(1)

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0

  const handleAddToCart = () => {
    addToCart({ ...product, quantity })
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <div>
        <h1 className="text-2xl font-bold leading-tight text-zinc-900 sm:text-3xl lg:text-4xl">
          {product.name}
        </h1>
      </div>

        <div className='flex items-center gap-2'>
           <p className="text-2xl font-bold tracking-tight text-zinc-900">
              ₹{product.price.toLocaleString()}
            </p>
          
           {product.originalPrice && product.originalPrice > product.price && (
           <p className="text-sm text-zinc-400 line-through">
               ₹{product.originalPrice.toLocaleString()}
            </p>
             )}

           <span className=" rounded-xl bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 shadow-sm backdrop-blur-sm">
              {discountPercent}%OFF
           </span>

       </div>
      <p className="text-sm leading-6 text-zinc-600 sm:text-base">
        {product.description}
      </p>

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-zinc-700">Quantity</span>

        <div className="flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1.5">
          <button
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            className="px-2 text-lg"
          >
            -
          </button>

          <span className="min-w-8 text-center text-sm font-semibold">
            {quantity}
          </span>

          <button
            onClick={() => setQuantity((prev) => prev + 1)}
            className="px-2 text-lg"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:flex-1" onClick={handleAddToCart}>
          Add to Cart
        </Button>

        <Button variant="outline" className="w-full sm:flex-1">
          Buy Now
        </Button>
      </div>

      <div className="rounded-xl bg-zinc-100 p-4 text-sm text-zinc-600">
        Free delivery within 5–7 business days.
      </div>
    </div>
  )
}

export default ProductInfo