import { useParams } from "react-router-dom"
import ProductImageGallery from "../components/ProductImageGallery"
import ProductInfo from "../components/ProductInfo"
import RelatedProducts from "../components/RelatedProducts"
import ProductTabs from "../components/ProductTabs"
import products from "@/data/products"


const ProductPage = () => {
const { slug } = useParams()
const product=products.find((p)=>p.slug===slug)

if (!product) {
    return <h2>Product not found</h2>
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6  sm:px-6 lg:px-8 lg:py-10">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 ">
        <ProductImageGallery images={product.images} />
        <ProductInfo product={product} />
      </div>



      {/* RELATED PRODUCTS */}
      <RelatedProducts />
    </div>
  )
}

export default ProductPage