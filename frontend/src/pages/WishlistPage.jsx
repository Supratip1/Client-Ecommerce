import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchWishlist, removeFromWishlist } from "../redux/slice/wishlistSlice";
import { addToCart } from "../redux/slice/cartSlice";
import LazyImage from "../components/Common/LazyImage";
import { FaHeart, FaShoppingCart, FaTrash, FaArrowLeft, FaStar } from "react-icons/fa";
import { toast } from "sonner";

const WishlistPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products: wishlistProducts, loading } = useSelector((state) => state.wishlist);
  const { user, guestId } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, user]);

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));
    toast.success("Removed from wishlist", { duration: 1000 });
  };

  const handleAddToCart = (product) => {
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
            className={`text-sm ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to view your wishlist</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-2">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="text-center py-12">
            <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Save items you love for later</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="relative">
                  <div className="aspect-square overflow-hidden">
                    <LazyImage
                      src={product.images[0]?.url || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Remove from wishlist button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveFromWishlist(product._id);
                    }}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-90 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 z-10"
                  >
                    <FaTrash className="text-sm" />
                  </button>

                  {/* Stock status */}
                  {product.countInStock <= 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Out of Stock
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    {renderStars(Math.round(product.rating || 0))}
                    <span className="text-sm text-gray-600">
                      ({product.numReviews || 0})
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    {product.discountPrice ? (
                      <>
                        <span className="font-semibold text-gray-900">
                          ${product.discountPrice}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ${product.price}
                        </span>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                          {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold text-gray-900">
                        ${product.price}
                      </span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/product/${product._id}`)}
                      className="flex-1 py-2 px-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.countInStock <= 0}
                      className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                        product.countInStock <= 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <FaShoppingCart className="text-xs" />
                        <span>Add to Cart</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
