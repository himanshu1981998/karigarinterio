import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { useCartStore } from '@/store/cartStore'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from "react"

const getProductImages = (product) => {
  const sourceImages = Array.isArray(product.images) ? product.images : []
  const normalizedImages = sourceImages
    .map((img) => ({
      src: typeof img === "string" ? img : img?.image || img?.src || "",
      isPrimary: Boolean(img?.is_primary || img?.isPrimary),
    }))
    .filter((img) => img.src)

  const primaryFromImages = normalizedImages.find((img) => img.isPrimary)?.src
  const primaryImage = primaryFromImages || product.primary_image || normalizedImages[0]?.src || ""
  const uniqueImages = []

  if (primaryImage) {
    uniqueImages.push(primaryImage)
  }

  normalizedImages.forEach((img) => {
    if (img.src && !uniqueImages.includes(img.src)) {
      uniqueImages.push(img.src)
    }
  })

  if (product.primary_image && !uniqueImages.includes(product.primary_image)) {
    uniqueImages.push(product.primary_image)
  }

  return uniqueImages
}

const CategoryBadge = ({ name }) => {
  if (!name) return null

  return (
    <span className="absolute left-2 top-2 rounded-full border border-white/60 bg-white/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-stone-700 shadow-sm backdrop-blur-sm sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-[11px]">
      {name}
    </span>
  )
}

const DesktopProductMedia = ({ images, product }) => {
  const primaryImage = images[0]
  const secondaryImage = images[1]

  if (!primaryImage) {
    return (
      <div className="ki-image-surface flex aspect-[4/5] w-full items-center justify-center text-xs font-medium text-stone-400 sm:text-sm">
        No Image
      </div>
    )
  }

  return (
    <div className="group/media ki-image-surface relative aspect-[4/5] overflow-hidden">
      <img
        src={primaryImage}
        alt={product.name}
        className={`h-full w-full object-cover transition duration-700 ease-out ${
          secondaryImage
            ? "group-hover/media:scale-[1.025]"
            : "group-hover/media:scale-[1.045]"
        }`}
      />

      {secondaryImage && (
        <img
          src={secondaryImage}
          alt={`${product.name} alternate view`}
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-700 ease-out group-hover/media:scale-[1.025] group-hover/media:opacity-100"
        />
      )}

      <CategoryBadge name={product.category?.name} />
    </div>
  )
}

const MobileProductMedia = ({ images, product }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showDots, setShowDots] = useState(false)
  const scrollRef = useRef(null)
  const pointerStartX = useRef(0)
  const didSwipe = useRef(false)
  const hideDotsTimer = useRef(null)

  const revealDots = () => {
    if (images.length <= 1) return
    window.clearTimeout(hideDotsTimer.current)
    setShowDots(true)
  }

  const hideDotsSoon = () => {
    if (images.length <= 1) return
    window.clearTimeout(hideDotsTimer.current)
    hideDotsTimer.current = window.setTimeout(() => {
      setShowDots(false)
    }, 900)
  }

  useEffect(() => {
    return () => window.clearTimeout(hideDotsTimer.current)
  }, [])

  const handlePointerDown = (event) => {
    pointerStartX.current = event.clientX
    didSwipe.current = false
    revealDots()
  }

  const handlePointerMove = (event) => {
    if (Math.abs(event.clientX - pointerStartX.current) > 8) {
      didSwipe.current = true
      revealDots()
    }
  }

  const handlePointerUp = () => {
    hideDotsSoon()
  }

  const handleClickCapture = (event) => {
    if (!didSwipe.current) return

    event.preventDefault()
    event.stopPropagation()
    window.setTimeout(() => {
      didSwipe.current = false
    }, 0)
  }

  const handleScroll = (event) => {
    const element = event.currentTarget
    const nextIndex = Math.round(element.scrollLeft / element.clientWidth)
    setActiveIndex(Math.min(Math.max(nextIndex, 0), images.length - 1))
    revealDots()
    hideDotsSoon()
  }

  if (!images.length) {
    return (
      <div className="ki-image-surface flex aspect-[4/5] w-full items-center justify-center text-xs font-medium text-stone-400">
        No Image
      </div>
    )
  }

  return (
    <div
      className="ki-image-surface relative aspect-[4/5] overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClickCapture={handleClickCapture}
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth scrollbar-hide"
      >
        {images.map((image, index) => (
          <img
            key={`${product.id || product.slug}-image-${index}`}
            src={image}
            alt={index === 0 ? product.name : `${product.name} view ${index + 1}`}
            className="h-full w-full shrink-0 snap-center object-cover"
            draggable="false"
          />
        ))}
      </div>

      <CategoryBadge name={product.category?.name} />

      {images.length > 1 && (
        <div
          className={`pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/25 px-1.5 py-1 backdrop-blur-sm transition-all duration-300 ${
            showDots
              ? "translate-y-0 opacity-100"
              : "translate-y-1 opacity-0"
          }`}
        >
          {images.map((image, index) => (
            <span
              key={`${image}-${index}`}
              className={`h-1.5 rounded-full transition-all ${
                activeIndex === index ? "w-3 bg-white" : "w-1.5 bg-white/55"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const ProductCard = ({product}) => {
  const addToCart = useCartStore((state) => state.addToCart)
  const triggerCartBump=useCartStore((state)=>state.triggerCartBump)
  const price = Number(product.price || 0)
  const originalPrice = Number(product.original_price || 0)
  const hasMrp = originalPrice > price
  const productImages = useMemo(() => getProductImages(product), [product])


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
    
    <Card className="group relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-xl border border-stone-200/80 bg-white p-0 shadow-[0_12px_30px_rgba(41,34,25,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_18px_42px_rgba(41,34,25,0.12)] sm:min-h-[430px]">
       <Link to={`/product/${product.slug}`}>
      {/* Image */}
      <div className="sm:hidden">
        <MobileProductMedia images={productImages} product={product} />
      </div>
      <div className="hidden sm:block">
        <DesktopProductMedia images={productImages} product={product} />
      </div>

      {/* Content */}
      <CardContent className="flex grow flex-col justify-between gap-2 p-3 sm:gap-3 sm:p-5">
        <h3 className="line-clamp-2 min-h-[2.4rem] text-sm font-semibold leading-snug text-stone-950 transition-colors group-hover:text-primary sm:min-h-[2.75rem] sm:text-base">
          {product.name}
        </h3>
        
       
       <div className='flex flex-wrap items-center gap-1.5 sm:gap-2'>

           <p className="text-base font-bold tracking-tight text-stone-950 sm:text-xl">
              ₹{price.toLocaleString()}
            </p>
          
           {hasMrp && (
           <p className="text-xs text-stone-400 line-through sm:text-sm">
               ₹{originalPrice.toLocaleString()}
            </p>
             )}

            {product.discount_percentage>0&&(
              <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 ring-1 ring-red-100 sm:px-2 sm:text-xs">
              {product.discount_percentage}%OFF
              </span>
             )}   

       </div>

      </CardContent>
         </Link>
      {/* Button */}
      <CardFooter className="mt-auto p-3 pt-0 sm:p-5 sm:pt-0">
        <Button className="h-9 w-full rounded-full text-xs sm:h-10 sm:text-sm" onClick={handleAddToCart}>
          Add to Basket
        </Button>
      </CardFooter>

    </Card>
   
  )
  
}

export default ProductCard
