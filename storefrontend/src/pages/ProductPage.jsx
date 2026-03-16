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
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductImageGallery images={product.images} />
        <ProductInfo product={product} />
      </div>

     {/* PRODUCT DESCRIPTION TABS */}
      <ProductTabs product={product} />

      {/* RELATED PRODUCTS */}
      <RelatedProducts />
    </div>
  )
}

export default ProductPage