import { useCallback, useEffect, useState } from "react"
import Autoplay from "embla-carousel-autoplay"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const formatPrice = (price) => `₹${Number(price || 0).toLocaleString()}`

const FeaturedCarousel = ({ products = [] }) => {
  const [api, setApi] = useState(null)
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) return

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap())
    }

    api.on("select", onSelect)

    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  const scrollTo = useCallback(
    (index) => {
      api?.scrollTo(index)
    },
    [api]
  )

  if (!products.length) return null

  return (
    <section className="relative w-full overflow-hidden bg-stone-950">
      <Carousel
        setApi={setApi}
        opts={{
          loop: true,
          align: "start",
          duration: 32,
        }}
        plugins={[
          Autoplay({
            delay: 3000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {products.map((product, index) => (
            <CarouselItem key={product.id ?? index} className="pl-0">
              <FeaturedSlide product={product} isActive={current === index} />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-3 z-20 h-10 w-10 border-white/15 bg-white/10 text-white shadow-[0_14px_35px_rgba(0,0,0,0.24)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:text-white sm:left-5 lg:left-8" />
        <CarouselNext className="right-3 z-20 h-10 w-10 border-white/15 bg-white/10 text-white shadow-[0_14px_35px_rgba(0,0,0,0.24)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:text-white sm:right-5 lg:right-8" />
      </Carousel>

      {count > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-stone-950/30 px-3 py-2 backdrop-blur-md">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`rounded-full transition-all duration-300 ${
                current === index
                  ? "h-2.5 w-7 bg-white shadow-[0_0_18px_rgba(255,255,255,0.25)]"
                  : "h-2.5 w-2.5 bg-white/35 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function FeaturedSlide({ product, isActive }) {
  const mainImage =
    product.images?.find((img) => img.is_primary)?.image ||
    product.images?.[0]?.image ||
    product.primary_image ||
    ""

  return (
    <div className="relative h-[560px] md:h-[520px] lg:h-[560px]">
      <div className="absolute inset-0">
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.name || "Featured product"}
            className={`h-full w-full object-cover transition-transform duration-[4200ms] ease-out ${
              isActive ? "scale-[1.035]" : "scale-100"
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-stone-900 text-stone-400">
            No image
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/45 to-stone-950/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/58 via-transparent to-stone-950/18" />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-16 pt-20 sm:px-6 md:items-center md:pb-12 lg:px-8">
        <div className="max-w-2xl">
          {product.category?.name && (
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-100 backdrop-blur-md">
              {product.category.name}
            </span>
          )}

          <h2 className="font-display mt-5 line-clamp-3 text-[2.35rem] font-bold leading-[0.98] text-white sm:text-[3.2rem] lg:text-[4.2rem] xl:text-[4.7rem]">
            {product.name}
          </h2>

          {(product.short_description || product.description) && (
            <p className="mt-5 line-clamp-3 max-w-xl text-sm leading-7 text-stone-100/85 sm:text-base lg:text-[1.02rem]">
              {product.short_description || product.description}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-end gap-3">
            <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[2.35rem]">
              {formatPrice(product.price)}
            </p>

            {product.original_price &&
              Number(product.original_price) > Number(product.price) && (
                <span className="mb-1 text-sm text-stone-300/75 line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to={`/product/${product.slug}`}
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white px-7 text-sm font-semibold text-stone-950 shadow-[0_16px_35px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-stone-100"
            >
              Shop Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <span className="text-sm font-medium text-stone-100/80">
              Handcrafted furniture for modern homes
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturedCarousel
