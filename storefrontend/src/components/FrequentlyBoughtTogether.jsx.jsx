import { useEffect, useState } from "react"
import ProductCard from "@/components/ProductCard"
import { fetchProducts } from "@/lib/productApi"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const FrequentlyBoughtTogether= ({ currentProduct }) => {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const loadRelatedProducts = async () => {
      try {
        if (!currentProduct?.category?.slug) return

        const data = await fetchProducts({
          category: currentProduct.category.slug,
        })

        const filtered = data.results
          .filter((item) => item.slug !== currentProduct.slug)
          .slice(0, 10)

        setProducts(filtered)
      } catch (error) {
        console.error("Failed to fetch related products:", error)
      }
    }

    loadRelatedProducts()
  }, [currentProduct])

  if (products.length === 0) return null

  return (
    <section className="mt-12">
      
      {/* Heading */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900">
          Frequently Bought Together
        </h2>
      </div>

      {/* Carousel */}
      <Carousel className="w-full">
        
        <CarouselContent className="-ml-3">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="pl-3 basis-[75%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Arrows (desktop feel) */}
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />

      </Carousel>
    </section>
  )
}

export default FrequentlyBoughtTogether