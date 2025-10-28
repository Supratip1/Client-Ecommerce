import React, { useEffect, useRef, useState } from "react";
import { FaFilter, FaTimes, FaChevronDown, FaChevronUp, FaStar, FaHeart, FaShoppingCart } from "react-icons/fa";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsByFilters } from "../redux/slice/productsSlice";
import { addToWishlist, removeFromWishlist, fetchWishlist } from "../redux/slice/wishlistSlice";
import { addToCart } from "../redux/slice/cartSlice";
import LazyImage from "../components/Common/LazyImage";
import { toast } from "sonner";

const CollectionPage = () => {
  const { collection } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const { products: wishlistProducts } = useSelector((state) => state.wishlist);
  const { user, guestId } = useSelector((state) => state.auth);
  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [expandedFilters, setExpandedFilters] = useState({
    category: true,
    gender: true,
    color: true,
    size: true,
    price: true,
    rating: true,
    brand: false,
    material: false,
  });

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, user]);

  useEffect(() => {
    const queryParams = Object.fromEntries([...searchParams]);
    dispatch(fetchProductsByFilters({ collection, ...queryParams, sortBy }));
  }, [collection, dispatch, searchParams, sortBy]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClickOutside = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleWishlistToggle = (productId) => {
    if (!user) {
      toast.error("Please login to add items to wishlist", { duration: 2000 });
      return;
    }

    const isInWishlist = wishlistProducts.some(p => p._id === productId);
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(productId));
      toast.success("Removed from wishlist", { duration: 1000 });
    } else {
      dispatch(addToWishlist(productId));
      toast.success("Added to wishlist", { duration: 1000 });
    }
  };

  const handleQuickAddToCart = (product) => {
    if (product.countInStock <= 0) {
      toast.error("This product is out of stock", { duration: 2000 });
      return;
    }

    dispatch(
      addToCart({
        productId: product._id,
        quantity: 1,
        size: product.sizes[0] || "M",
        color: product.colors[0] || "Black",
        guestId,
        userId: user?._id,
      })
    ).then(() => {
      toast.success("Added to cart!", { duration: 1000 });
    });
  };

  const renderStars = (rating) => {
  return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`text-xs ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const toggleFilter = (filterName) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const FilterSection = ({ title, children, filterName }) => (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={() => toggleFilter(filterName)}
        className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
      >
        <span>{title}</span>
        {expandedFilters[filterName] ? (
          <FaChevronUp className="text-gray-500" />
        ) : (
          <FaChevronDown className="text-gray-500" />
        )}
      </button>
      {expandedFilters[filterName] && children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {collection === "all" ? "All Products" : collection?.charAt(0).toUpperCase() + collection?.slice(1)}
          </h1>
          <p className="text-gray-600">
            Discover our premium collection of fashion items
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Advanced Filter Sidebar */}
          {/* Mobile overlay/backdrop */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
              onClick={toggleSidebar}
            />
          )}
      <div
        ref={sidebarRef}
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } fixed inset-y-0 left-0 z-50 w-5/6 max-w-xs bg-white shadow-xl overflow-y-auto transition-transform duration-300 lg:static lg:translate-x-0 lg:w-72`}
          >
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={toggleSidebar}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Category Filter */}
              <FilterSection title="Category" filterName="category">
                <div className="space-y-2">
                  {["Top Wear", "Bottom Wear", "Accessories"].map((category) => (
                    <label key={category} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        className="w-4 h-4 text-gray-600 focus:ring-gray-500 border-gray-300"
                      />
                      <span className="text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Gender Filter */}
              <FilterSection title="Gender" filterName="gender">
                <div className="space-y-2">
                  {["Men", "Women", "Unisex"].map((gender) => (
                    <label key={gender} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        className="w-4 h-4 text-gray-600 focus:ring-gray-500 border-gray-300"
                      />
                      <span className="text-gray-700">{gender}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Color Filter */}
              <FilterSection title="Color" filterName="color">
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: "Black", value: "#000000" },
                    { name: "White", value: "#FFFFFF" },
                    { name: "Red", value: "#EF4444" },
                    { name: "Blue", value: "#3B82F6" },
                    { name: "Green", value: "#10B981" },
                    { name: "Yellow", value: "#F59E0B" },
                    { name: "Gray", value: "#6B7280" },
                    { name: "Pink", value: "#EC4899" },
                  ].map((color) => (
                    <button
                      key={color.name}
                      className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                        false ? "ring-2 ring-gray-900" : "border-gray-200"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Size Filter */}
              <FilterSection title="Size" filterName="size">
                <div className="grid grid-cols-3 gap-2">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                    <label key={size} className="flex items-center justify-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="size"
                        value={size}
                        className="sr-only"
                      />
                      <div className="w-full py-2 px-3 text-center border border-gray-300 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors">
                        {size}
                      </div>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Price Range */}
              <FilterSection title="Price Range" filterName="price">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    Price range: $0 - $200
                  </div>
                </div>
              </FilterSection>

              {/* Rating Filter */}
              <FilterSection title="Customer Rating" filterName="rating">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="rating"
                        value={rating}
                        className="w-4 h-4 text-gray-600 focus:ring-gray-500 border-gray-300"
                      />
                      <div className="flex items-center space-x-2">
                        {renderStars(rating)}
                        <span className="text-gray-700">& up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Clear Filters */}
              <button className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 sticky top-0 z-20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                {/* Results Count */}
                <div className="text-gray-600">
                  Showing {products.length} products
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* View Mode Toggle */}
                  <div className="hidden sm:flex border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 ${viewMode === "grid" ? "bg-gray-900 text-white" : "text-gray-600"}`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 ${viewMode === "list" ? "bg-gray-900 text-white" : "text-gray-600"}`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="default">Sort by: Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                  </select>

                  {/* Mobile Filter Button */}
                  <button
                    onClick={toggleSidebar}
                    className="lg:hidden flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <FaFilter />
                    <span>Filters</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid/List */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 text-lg">Error: {error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
      </div>
            ) : (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
                : "space-y-4"
              }>
                {products.map((product) => {
                  const isOutOfStock = product.countInStock <= 0;
                  const isInWishlist = wishlistProducts.some(p => p._id === product._id);
                  
                  return viewMode === "grid" ? (
                    // Grid View
                    <div
                      key={product._id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      <div className="relative">
                        <div className="aspect-[3/4] sm:aspect-square overflow-hidden">
                          <LazyImage
                            src={product.images[0]?.url || '/placeholder.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
        </div>

                        {/* Quick Actions */}
                        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleWishlistToggle(product._id); }}
                            className={`p-2 rounded-full shadow-lg transition-colors ${
                              isInWishlist 
                                ? "bg-red-500 text-white" 
                                : "bg-white text-gray-600 hover:text-red-500"
                            }`}
                          >
                            <FaHeart className={`text-sm ${isInWishlist ? "fill-current" : ""}`} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleQuickAddToCart(product); }}
                            disabled={isOutOfStock}
                            className={`p-2 rounded-full shadow-lg transition-colors ${
                              isOutOfStock 
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                                : "bg-white text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            <FaShoppingCart className="text-sm" />
                          </button>
                        </div>

                        {/* Stock Badge */}
                        {isOutOfStock && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                            Out of Stock
                          </div>
                        )}

                        {/* Discount Badge */}
                        {product.discountPrice && (
                          <div className="absolute bottom-3 left-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                            {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                          </div>
                        )}
                      </div>

                      <div className="p-3 sm:p-4">
                        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        
                        {/* Rating */}
                        <div className="flex items-center space-x-2 mb-2">
                          {renderStars(Math.round(product.rating || 0))}
                          <span className="text-sm text-gray-600">
                            ({product.numReviews || 0})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                          {product.discountPrice ? (
                            <>
                              <span className="font-semibold text-gray-900">
                                ${product.discountPrice}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                ${product.price}
                              </span>
                            </>
                          ) : (
                            <span className="font-semibold text-gray-900">
                              ${product.price}
                            </span>
                          )}
                        </div>

                        {/* Stock Status */}
                        <div className="text-xs text-gray-500">
                          {isOutOfStock ? "Out of Stock" : `${product.countInStock} in stock`}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // List View
                    <div
                      key={product._id}
                      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      <div className="flex space-x-4">
                        <div className="w-24 h-24 flex-shrink-0">
                          <LazyImage
                            src={product.images[0]?.url || '/placeholder.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {product.name}
                          </h3>
                          <div className="flex items-center space-x-2 mb-2">
                            {renderStars(Math.round(product.rating || 0))}
                            <span className="text-sm text-gray-600">
                              ({product.numReviews || 0})
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            {product.discountPrice ? (
                              <>
                                <span className="font-semibold text-gray-900">
                                  ${product.discountPrice}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  ${product.price}
                                </span>
                              </>
                            ) : (
                              <span className="font-semibold text-gray-900">
                                ${product.price}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {isOutOfStock ? "Out of Stock" : `${product.countInStock} in stock`}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => handleWishlistToggle(product._id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isInWishlist 
                                ? "bg-red-500 text-white" 
                                : "bg-gray-100 text-gray-600 hover:text-red-500"
                            }`}
                          >
                            <FaHeart className={`text-sm ${isInWishlist ? "fill-current" : ""}`} />
                          </button>
                          <button
                            onClick={() => handleQuickAddToCart(product)}
                            disabled={isOutOfStock}
                            className={`p-2 rounded-lg transition-colors ${
                              isOutOfStock 
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                                : "bg-gray-100 text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            <FaShoppingCart className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;