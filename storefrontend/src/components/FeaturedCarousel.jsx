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
    <section className="relative w-full overflow-hidden bg-[#0d0d10]">
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

        <CarouselPrevious className="left-3 z-20 h-10 w-10 border-white/10 bg-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/15 hover:text-white sm:left-5 lg:left-6" />
        <CarouselNext className="right-3 z-20 h-10 w-10 border-white/10 bg-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/15 hover:text-white sm:right-5 lg:right-6" />
      </Carousel>

      {count > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 backdrop-blur-md">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`rounded-full transition-all duration-300 ${
                current === index
                  ? "h-2.5 w-7 bg-white shadow-[0_0_18px_rgba(255,255,255,0.35)]"
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
    <div className="flex h-[340px] flex-col md:h-[430px] md:flex-row lg:h-[500px] xl:h-[540px]">
      <div className="relative h-[210px] w-full overflow-hidden md:h-full md:w-[62%]">
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.name || "Featured product"}
            className={`h-full w-full object-cover transition-transform duration-[4000ms] ease-out ${
              isActive ? "scale-[1.035]" : "scale-100"
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-400">
            No image
          </div>
        )}

        <div className="absolute inset-0 hidden bg-gradient-to-r from-black/0 via-black/0 to-black/75 md:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent md:hidden" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.1)_100%)]" />

        <div className="absolute inset-y-0 right-0 hidden w-32 bg-gradient-to-l from-black/50 via-black/20 to-transparent md:block" />
      </div>

      <div className="relative flex w-full items-center bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_28%),linear-gradient(135deg,#111218_0%,#171820_45%,#101116_100%)] px-6 py-7 md:w-[38%] md:px-10 lg:px-14 xl:px-16">
        <div className="max-w-xl">
          {product.category?.name && (
            <span className="inline-flex rounded-full border border-amber-200/10 bg-amber-300/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-amber-100/90">
              {product.category.name}
            </span>
          )}

          <h2 className="mt-5 line-clamp-3 text-[1.75rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-[2.15rem] lg:text-[2.75rem] xl:text-[3rem]">
            {product.name}
          </h2>

          {(product.short_description || product.description) && (
            <p className="mt-4 line-clamp-3 max-w-lg text-sm leading-7 text-zinc-300/95 sm:text-base lg:text-[1.02rem]">
              {product.short_description || product.description}
            </p>
          )}

          <div className="mt-7 flex items-end gap-3">
            <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[2.2rem]">
              {formatPrice(product.price)}
            </p>

            {product.original_price &&
              Number(product.original_price) > Number(product.price) && (
                <span className="mb-1 text-sm text-zinc-400 line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
          </div>

          <div className="mt-8">
            <Link
              to={`/product/${product.slug}`}
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white px-6 text-sm font-semibold text-zinc-900 shadow-[0_12px_30px_rgba(255,255,255,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-100"
            >
              Shop Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-8 left-0 h-24 w-24 rounded-full bg-amber-200/5 blur-3xl" />
          <div className="absolute inset-y-0 left-0 w-px bg-white/8" />
        </div>
      </div>
    </div>
  )
}

export default FeaturedCarousel