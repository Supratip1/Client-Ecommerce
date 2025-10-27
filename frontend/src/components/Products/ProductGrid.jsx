
import React from 'react'
import { Link } from 'react-router-dom'
import LazyImage from '../Common/LazyImage'

const ProductGrid = ({products, loading, error}) => {
  if(loading){
    return <p>Loading...</p>
  }
  if(error){
    return <p>Error: {error}</p>
  }
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
      {products.map((product, index) => (
        <Link key={index} to={`/product/${product._id}`} className='block group'>
            <div className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 ease-out group-hover:scale-105">
                <div className="w-full h-96 mb-4 overflow-hidden rounded-xl">
                    <LazyImage 
                      src={product.images[0]?.url || 'https://via.placeholder.com/300x400?text=Product+Image'} 
                      alt={product.images[0]?.altText || product.name} 
                      className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out'
                      onError={() => {
                        console.log('Image failed to load:', product.images[0]?.url);
                      }}
                    />
                </div>
                <h3 className='text-sm mb-3 font-medium group-hover:text-blue-600 transition-colors duration-300 leading-tight'>{product.name}</h3>
                <p className='text-gray-500 font-medium text-sm tracking-tighter group-hover:text-gray-700 transition-colors duration-300'>
                    ${product.price}
                </p>
            </div>
        </Link>
      ))}
    </div>
  )
}

export default ProductGrid
