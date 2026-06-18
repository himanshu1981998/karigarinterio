import React from 'react'
import ProductCard from './ProductCard';


const ProductGrid = ({products=[]}) => {
  return (
    <div className="@container">
      <div className="grid grid-cols-2 gap-3 @md:gap-5 @xl:grid-cols-3 @6xl:grid-cols-4 @6xl:gap-7">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default ProductGrid
