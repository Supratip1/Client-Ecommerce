
import React from 'react'
import ProductCard from './ProductCard'
import SkeletonCard from '../Common/SkeletonCard'

const ProductGrid = ({products, loading, error}) => {
  if(loading){
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }
  if(error){
    return <p>Error: {error}</p>
  }
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}

export default ProductGrid
