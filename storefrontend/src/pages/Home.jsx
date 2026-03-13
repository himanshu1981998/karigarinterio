import React from 'react'
import { Button } from '@/components/ui/button'
import ProductGrid from '@/components/ProductGrid'
const Home = () => {

  const products = [
  {
    id: 1,
    name: "Brass Arc Floor Lamp",
    price: 449,
    category: "Lighting",
    image: "/lamp.jpg",
  },
  {
    id: 2,
    name: "Carrara Marble Coffee Table",
    price: 899,
    category: "Tables",
    image: "/table.jpg",
  },
]

  return (
        <div className="max-w-7xl mx-auto px-6 py-10">
      <ProductGrid products={products} />
    </div>
  )
}

export default Home