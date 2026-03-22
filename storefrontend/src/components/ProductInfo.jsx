import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cartStore"
import { toast} from "sonner"
import ProductTabs from "./ProductTabs"
const ProductInfo = ({ product }) => {
const addToCart = useCartStore((state) => state.addToCart)
const triggerCartBump=useCartStore((state)=>state.triggerCartBump)
const cartItems = useCartStore((state) => state.items)
const increaseQuantity = useCartStore((state) => state.increaseQuantity)
const decreaseQuantity = useCartStore((state) => state.decreaseQuantity)

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0
    
   const cartItem=cartItems.find((item)=>item.id===product.id)

      const handleAddToCart = () => {
       addToCart(product)
       triggerCartBump()

          toast.success("Added to cart", {
                 description: `${product.name} added in your cart`,
                 position:"bottom-center",
                 duration: 2000

                 })

       
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <div>
        <h1 className="text-2xl font-bold leading-tight text-zinc-900 sm:text-3xl lg:text-4xl">
          {product.name}
        </h1>
      </div>

        <div className='flex items-center gap-2'>
           <p className="text-xl font-bold tracking-tight text-zinc-900">
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

<div className="flex flex-col gap-3 sm:flex-row">
  {!cartItem ? (
    <Button
      className="h-11 w-full rounded-full sm:flex-1"
      onClick={handleAddToCart}
    >
      Add to Cart
    </Button>
        ) : (
    <div className="flex h-11 w-full items-center justify-between rounded-full border border-zinc-200 bg-white px-4 shadow-sm sm:flex-1">
      <button
        onClick={() => decreaseQuantity(product.id)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-medium text-zinc-700 transition hover:bg-zinc-100"
      >
        -
      </button>

      <span className="text-sm font-semibold text-zinc-900">
        {cartItem.quantity}
      </span>

      <button
        onClick={() => increaseQuantity(product.id)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-medium text-zinc-700 transition hover:bg-zinc-100"
      >
        +
      </button>
    </div>
  )}

  <Button
    variant="outline"
    className="h-11 w-full rounded-full sm:flex-1"
  >
    Buy Now
  </Button>
</div>

      <div className="rounded-xl bg-zinc-100 p-4 text-sm text-zinc-600">
        Free delivery within 5–7 business days.
      </div>
      <ProductTabs product={product}/>
    </div>
  )
}

export default ProductInfo