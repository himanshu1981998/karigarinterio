import React from 'react'
import ProductCard from './ProductCard';


const ProductGrid = ({products=[]}) => {
  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-5 @md:grid-cols-2 @xl:grid-cols-3 @6xl:grid-cols-4 @md:gap-6 @6xl:gap-7">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default ProductGrid
