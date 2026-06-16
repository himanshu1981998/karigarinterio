import { useEffect, useMemo, useState } from "react"
import ProductGrid from "@/components/ProductGrid"
import { fetchProducts } from "@/lib/productApi.js"
import HomeCategories from "@/components/HomeCategories"
import CustomBespokeSection from "@/components/CustomBespokeSection"
import FeaturedCarousel from "@/components/FeaturedCarousel"
import Footer from "@/components/Footer"
import { Skeleton } from "boneyard-js/react"
import {
  FeaturedCarouselFixture,
  FeaturedCarouselSkeleton,
  ProductGridFixture,
  ProductGridSkeleton,
} from "@/components/skeletons/BoneyardSkeletons"
import { productGridFixture } from "@/components/skeletons/fixtures"

const Home = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [featuredLoading, setFeaturedLoading] = useState(true)


  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts()
        setProducts(data.results||[])
      } catch (error) {
        console.error("Failed to load products:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

 

  useEffect(() => {

    const loadFeaturedProducts = async () => {

      try {

        const data = await fetchProducts({ featured: true, pageSize: 6 })

        setFeaturedProducts(Array.isArray(data) ? data : data.results || [])

      } catch (error) {

        console.error("Failed to load featured products:", error)

      } finally {
        setFeaturedLoading(false)
      }

    }

    loadFeaturedProducts()

  }, [])

  const carouselProducts = useMemo(() => {
    if (featuredProducts.length > 0) {
      return featuredProducts
    }

    return products.slice(0, 3)
  }, [featuredProducts, products])

  

return (
  <div>
    <Skeleton
      name="home-featured-carousel"
      loading={loading && featuredLoading}
      fallback={<FeaturedCarouselSkeleton />}
      fixture={<FeaturedCarouselFixture />}
    >
      <FeaturedCarousel
        products={
          loading && carouselProducts.length === 0
            ? productGridFixture.slice(0, 3)
            : carouselProducts
        }
      />
    </Skeleton>

    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <HomeCategories />

      <CustomBespokeSection />

      {products.length === 0 && !loading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-500 shadow-sm">
          No products available.
        </div>
      ) : (
        <Skeleton
          name="home-product-grid"
          loading={loading}
          fallback={<ProductGridSkeleton />}
          fixture={<ProductGridFixture />}
        >
          <ProductGrid products={loading ? productGridFixture : products} />
        </Skeleton>
      )}
    </div>

  </div>
)
}

export default Home
