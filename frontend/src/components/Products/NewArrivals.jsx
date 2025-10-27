import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import LazyImage from "../Common/LazyImage";
import API_ENDPOINTS from "../../config/api";

const NewArrivals = () => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [newArrivals, setNewArrivals] = useState([]);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const response = await axios.get(
          `${backendUrl}/api/products/new-arrivals`
        );
        setNewArrivals(response.data || []);
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
        // Set empty array as fallback to prevent map error
        setNewArrivals([]);
      }
    };
    fetchNewArrivals();
  }, []);

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

  //updtae scroll buttons
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
  }, [newArrivals]);

  return (
    <section className="[y-16 px-4 lg:px-0">
      <div className="container mx-auto text-center mb-10 relative">
        <h2 className="text-3xl font-bold mb-4">Explore New Arrivals</h2>
        <p className="text-lg text-gray-600 mb-8">
          Discover the latest styles off the runway, freshly added to keep your
          wardrobe on the cutting edge of fashion.
        </p>

        {/* scroll buttons */}
        <div className="absolute right-0 bottom-[-30px] flex space-x-2">
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
      {/* scrollable content */}
      {newArrivals && newArrivals.length > 0 ? (
        <div
          ref={scrollRef}
          className={`container mx-auto overflow-x-auto flex space-x-6 relative scrollbar-hide ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          {newArrivals.map((product) => (
            <div
              key={product._id}
              className="min-w-[100%] sm:min-w-[50%] lg:min-w-[30%] relative"
            >
            <LazyImage
              src={product.images[0]?.url || 'https://via.placeholder.com/400x500?text=Product+Image'}
              alt={product.images[0]?.altText || product.name}
              className="w-full h-[500px] object-cover rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 ease-out hover:scale-105"
              draggable="false"
              onError={() => {
                console.log('Image failed to load:', product.images[0]?.url);
              }}
            />
              <div className="absolute bottom-0 left-0 right-0 bg-opacity-45 backdrop-blur-md text-white p-4 rounded-b-lg">
                <Link to={`/product/${product._id}`} className="bloxk">
                  <h4 className="font-medium">{product.name}</h4>
                  <p className="mt-1">${product.price}</p>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="container mx-auto text-center py-8">
          <p className="text-gray-500">No new arrivals available at the moment.</p>
        </div>
      )}
    </section>
  );
};

export default NewArrivals;
