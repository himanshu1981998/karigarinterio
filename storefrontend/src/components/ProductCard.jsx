import React from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import { useCartStore } from '@/store/cartStore'
import { Link } from 'react-router-dom'
const ProductCard = ({product}) => {
       const addToCart = useCartStore((state) => state.addToCart)
       const triggerCartBump=useCartStore((state)=>state.triggerCartBump)

       const handleAddToCart = () => {
       addToCart(product)
       triggerCartBump()

          toast.success("Added to cart", {
                 description: `${product.name} added in your cart`,
                 position:"bottom-center",
                 duration: 2000

                 })

       
  }

    const discountPercentage =
     product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0

  return (
    
    <Card className="group relative flex h-full flex-col overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-sm ring-1 ring-zinc-950/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-950/10">
       <Link to={`/product/${product.slug}`}>
      {/* Image */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-50 aspect-[4/5]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />

        {/* Category */}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur-sm">
          {product.category}
        </span>
      </div>

      {/* Content */}
      <CardContent className="flex grow flex-col justify-between gap-2 p-5">
        <h3 className="line-clamp-2 text-base font-semibold leading-tight text-zinc-900 transition-colors group-hover:text-zinc-600">
          {product.name}
        </h3>
        
       
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
              {discountPercentage}%OFF
           </span>

       </div>

      </CardContent>
         </Link>
      {/* Button */}
      <CardFooter className="mt-auto p-5 pt-0">
        <Button className="w-full rounded-xl" onClick={handleAddToCart}>
          Add to Basket
        </Button>
      </CardFooter>

    </Card>
   
  )
  
}

export default ProductCard