import ProductCard from "@/components/ProductCard"

const RelatedProducts = () => {

  const products = [
    { id: 1, name: "Chair", price: 2299 },
    { id: 2, name: "Table", price: 4599 },
    { id: 3, name: "Lamp", price: 999 },
    { id: 4, name: "Sofa", price: 12999 },
  ]

  return (
    <section>
      <h2 className="mb-6 text-2xl font-semibold">
        You may also like
      </h2>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

export default RelatedProducts