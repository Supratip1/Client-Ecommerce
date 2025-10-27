import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import LazyImage from '../Common/LazyImage';

const ProductCarousel = ({ products, loading, error, title, description }) => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const scroll = (direction) => {
    const scrollAmount = direction === "left" ? -500 : 500;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Update scroll buttons
  const updateScrollButtons = () => {
    const container = scrollRef.current;

    if (container) {
      const leftScroll = container.scrollLeft;
      const rightScrollable =
        container.scrollWidth > leftScroll + container.clientWidth;
      setCanScrollLeft(leftScroll > 0);
      setCanScrollRight(rightScrollable);
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButtons);
      updateScrollButtons();
      return () => container.removeEventListener("scroll", updateScrollButtons);
    }
  }, [products]);

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <section className="py-16 px-4 lg:px-0">
      <div className="container mx-auto text-center mb-10 relative">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-lg text-gray-600 mb-8">
          {description}
        </p>

        {/* scroll buttons - only show on mobile */}
        <div className="absolute right-0 bottom-[-30px] flex space-x-2 md:hidden">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full border border-gray-200 ${
              canScrollLeft
                ? "bg-white text-black"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            <FiChevronLeft className="text-2xl" />
          </button>
          <button
            onClick={() => scroll("right")}
            className={`p-2 rounded-full border border-gray-200 ${
              canScrollRight
                ? "bg-white text-black"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            <FiChevronRight className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Desktop Grid View */}
      <div className="hidden md:block container mx-auto">
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
      </div>

      {/* Mobile Carousel View */}
      {products && products.length > 0 ? (
        <div
          ref={scrollRef}
          className={`md:hidden container mx-auto overflow-x-auto flex space-x-6 relative scrollbar-hide ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          {products.map((product, index) => (
            <div
              key={product._id}
              className="min-w-[100%] sm:min-w-[50%] lg:min-w-[30%] relative"
            >
              <Link to={`/product/${product._id}`} className='block group'>
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
            </div>
          ))}
        </div>
      ) : (
        <div className="container mx-auto text-center py-8">
          <p className="text-gray-500">No products available at the moment.</p>
        </div>
      )}
    </section>
  );
};

export default ProductCarousel;
