import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import ProductImageGallery from "../components/ProductImageGallery"
import ProductInfo from "../components/ProductInfo"
import ProductDetailsPanel from "../components/ProductDetailsPanel"
import FrequentlyBoughtTogether from "@/components/FrequentlyBoughtTogether.jsx"
import { fetchProductDetail } from "@/lib/productApi"
import { Skeleton } from "boneyard-js/react"
import { ProductDetailSkeleton } from "@/components/skeletons/BoneyardSkeletons"
import { productFixture } from "@/components/skeletons/fixtures"
import { isBoneyardBuild } from "@/lib/boneyardBuild"

const ProductDetailContent = ({ product, showRecommendations = true }) => {
  const galleryImages =
    product.images?.map((img) => img.image).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-6 flex flex-wrap gap-1 text-sm text-zinc-500">
          <Link to="/" className="hover:text-zinc-700 hover:underline">
            Home
          </Link>

          <span>/</span>

          <Link to="/products" className="hover:text-zinc-700 hover:underline">
            Products
          </Link>

          {product?.category?.slug && (
            <>
              <span>/</span>
              <Link
                to={`/products?category=${product.category.slug}`}
                className="hover:text-zinc-700 hover:underline"
              >
                {product.category.name}
              </Link>
            </>
          )}

          <span>/</span>

          <span className="font-medium text-zinc-900">
            {product?.name}
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_420px] xl:grid-cols-[minmax(0,1.15fr)_440px] xl:gap-12">
          <div>
            <ProductImageGallery images={galleryImages} />
          </div>

          <div className="space-y-8 lg:sticky lg:top-24 lg:h-fit">
            <ProductInfo product={product} />
            <ProductDetailsPanel product={product} />
          </div>
        </div>

        {showRecommendations && (
          <div className="mt-14">
            <FrequentlyBoughtTogether currentProduct={product} />
          </div>
        )}
      </div>
    </div>
  )
}

const ProductDetailPage = () => {
  const { slug } = useParams()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const isSkeletonCapture = isBoneyardBuild()

  useEffect(() => {
    let isMounted = true

    const loadProduct = async () => {
      try {
        setLoading(true)
        setError("")

        const data = await fetchProductDetail(slug)

        if (isMounted) {
          setProduct(data)
        }
      } catch (err) {
        console.error("Failed to fetch product detail:", err)

        if (isMounted) {
          setError(err.response?.data?.detail || "Failed to load product")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (slug) {
      loadProduct()
      window.scrollTo({ top: 0, behavior: "smooth" }) // 🔥 UX improvement
    }

    return () => {
      isMounted = false
    }
  }, [slug])

  if (loading || isSkeletonCapture) {
    return (
      <Skeleton
        name="product-detail"
        loading={loading || isSkeletonCapture}
        fallback={<ProductDetailSkeleton />}
        fixture={<ProductDetailContent product={productFixture} showRecommendations={false} />}
      >
        <ProductDetailContent product={productFixture} showRecommendations={false} />
      </Skeleton>
    )
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-2xl border bg-white p-10 text-center text-zinc-500 shadow-sm">
          <p className="text-lg font-medium">
            {error || "Product not found"}
          </p>

          <Link
            to="/products"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            Back to products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <Skeleton
      name="product-detail"
      loading={false}
      fallback={<ProductDetailSkeleton />}
      fixture={<ProductDetailContent product={productFixture} showRecommendations={false} />}
    >
      <ProductDetailContent product={product} />
    </Skeleton>
)
}

export default ProductDetailPage
