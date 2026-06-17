import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { useCartStore } from '@/store/cartStore'
import { Link } from 'react-router-dom'
const ProductCard = ({product}) => {
  const addToCart = useCartStore((state) => state.addToCart)
  const triggerCartBump=useCartStore((state)=>state.triggerCartBump)
  const price = Number(product.price || 0)
  const originalPrice = Number(product.original_price || 0)
  const hasMrp = originalPrice > price


       const handleAddToCart = () => {
       addToCart(product,1)
       triggerCartBump()

          toast.success("Added to cart", {
                 description: `${product.name} added in your cart`,
                 position:"bottom-center",
                 duration: 2000

                 })

       
  }



 

  return (
    
    <Card className="group relative flex h-full min-h-[430px] flex-col overflow-hidden rounded-xl border border-stone-200/80 bg-white p-0 shadow-[0_12px_30px_rgba(41,34,25,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_18px_42px_rgba(41,34,25,0.12)]">
       <Link to={`/product/${product.slug}`}>
      {/* Image */}
      <div className="ki-image-surface relative aspect-[4/5] overflow-hidden">
        {product.primary_image?(
        <img
          src={product.primary_image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
        />):
           <div className='flex h-full w-full items-center justify-center text-sm font-medium text-stone-400'>No Image</div>
        }

        {/* Category */}
        <span className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-700 shadow-sm backdrop-blur-sm">
          {product.category?.name}
        </span>
      </div>

      {/* Content */}
      <CardContent className="flex grow flex-col justify-between gap-3 p-5">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug text-stone-950 transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        
       
       <div className='flex flex-wrap items-center gap-2'>

           <p className="text-xl font-bold tracking-tight text-stone-950">
              ₹{price.toLocaleString()}
            </p>
          
           {hasMrp && (
           <p className="text-sm text-stone-400 line-through">
               ₹{originalPrice.toLocaleString()}
            </p>
             )}

            {product.discount_percentage>0&&(
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 ring-1 ring-red-100">
              {product.discount_percentage}%OFF
              </span>
             )}   

       </div>

      </CardContent>
         </Link>
      {/* Button */}
      <CardFooter className="mt-auto p-5 pt-0">
        <Button className="h-10 w-full rounded-full" onClick={handleAddToCart}>
          Add to Basket
        </Button>
      </CardFooter>

    </Card>
   
  )
  
}

export default ProductCard
