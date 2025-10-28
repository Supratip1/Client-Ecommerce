import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductDetails,
  fetchSimilarProducts,
} from "../../redux/slice/productsSlice";
import { fetchReviews, createReview } from "../../redux/slice/reviewSlice";
import { addToCart } from "../../redux/slice/cartSlice";
import { addToWishlist, removeFromWishlist, fetchWishlist } from "../../redux/slice/wishlistSlice";
import LazyImage from "../Common/LazyImage";
import ProductCard from "./ProductCard";
import {
  FaStar,
  FaHeart,
  FaShareAlt,
  FaTruck,
  FaShieldAlt,
  FaUndo,
  FaChevronLeft,
  FaChevronRight,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";

const ProductDetails = ({ productId }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedProduct, loading, error, similarProducts } = useSelector(
    (state) => state.products
  );
  const { reviews, loading: reviewsLoading, page: reviewsPage, pages: reviewsPages, total: reviewsTotal, limit: reviewsLimit } = useSelector((state) => state.reviews);
  const { products: wishlistProducts } = useSelector((state) => state.wishlist);
  const { user, guestId } = useSelector((state) => state.auth);

  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  const productFetchId = productId || id;

  useEffect(() => {
    if (productFetchId) {
      dispatch(fetchProductDetails(productFetchId));
      dispatch(fetchSimilarProducts({ id: productFetchId }));
      dispatch(fetchReviews({ productId: productFetchId, page: 1, limit: 10 }));
      if (user) {
        dispatch(fetchWishlist());
      }
    }
  }, [dispatch, productFetchId, user]);

  useEffect(() => {
    if (selectedProduct?.images?.length > 0) {
      setMainImage(selectedProduct.images[0].url);
    }
  }, [selectedProduct]);

  const handleQuantityChange = (action) => {
    if (!selectedProduct) return;
    
    if (action === "plus") {
      setQuantity((prev) => {
        const maxStock = selectedProduct?.countInStock || 999;
        return Math.min(prev + 1, maxStock);
      });
    }
    if (action === "minus" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    if (!selectedSize || !selectedColor) {
      toast.error("Please select a size and color before adding to cart.", {
        duration: 2000,
      });
      return;
    }

    if (selectedProduct.countInStock <= 0) {
      toast.error("This product is currently out of stock.", {
        duration: 2000,
      });
      return;
    }

    if (quantity > selectedProduct.countInStock) {
      toast.error(`Only ${selectedProduct.countInStock} items available in stock.`, {
        duration: 2000,
      });
      return;
    }

    setIsButtonDisabled(true);

    dispatch(
      addToCart({
        productId: productFetchId,
        quantity,
        size: selectedSize,
        color: selectedColor,
        guestId,
        userId: user?._id,
      })
    )
      .then(() => {
        toast.success("Product Added to the Cart!", {
          duration: 1000,
        });
      })
      .catch((error) => {
        toast.error(error.payload?.message || "Failed to add product to cart", {
          duration: 2000,
        });
      })
      .finally(() => {
        setIsButtonDisabled(false);
      });
  };

  const handleWishlistToggle = () => {
    if (!user) {
      toast.error("Please login to add items to wishlist", {
        duration: 2000,
      });
      return;
    }

    const isInWishlist = wishlistProducts.some(p => p._id === productFetchId);
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(productFetchId));
      toast.success("Removed from wishlist", { duration: 1000 });
    } else {
      dispatch(addToWishlist(productFetchId));
      toast.success("Added to wishlist", { duration: 1000 });
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to submit a review", { duration: 2000 });
      return;
    }

    dispatch(createReview({
      productId: productFetchId,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    })).then(() => {
      toast.success("Review submitted successfully!", { duration: 2000 });
      setReviewForm({ rating: 5, comment: "" });
      setShowReviewForm(false);
    });
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onRatingChange(star) : undefined}
            className={`${
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
            } transition-transform`}
          >
            <FaStar
              className={`text-lg ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getStockStatus = () => {
    if (!selectedProduct) return { text: "Loading...", color: "text-gray-600", bg: "bg-gray-50" };
    
    if (selectedProduct.countInStock <= 0) {
      return { text: "Out of Stock", color: "text-red-600", bg: "bg-red-50" };
    } else if (selectedProduct.countInStock <= 5) {
      return { text: `Only ${selectedProduct.countInStock} left in stock`, color: "text-orange-600", bg: "bg-orange-50" };
    } else if (selectedProduct.countInStock <= 20) {
      return { text: `${selectedProduct.countInStock} in stock`, color: "text-green-600", bg: "bg-green-50" };
    } else {
      return { text: "In Stock", color: "text-green-600", bg: "bg-green-50" };
    }
  };

  const stockStatus = getStockStatus();
  const isInWishlist = wishlistProducts.some(p => p._id === productFetchId);
  const averageRating = reviews && reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  // Early return if no product data
  if (!selectedProduct && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Go Home
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {selectedProduct && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <button onClick={() => navigate(-1)} className="hover:text-gray-900">
                ← Back
              </button>
              <span>/</span>
              <span>{selectedProduct.category}</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">{selectedProduct.name}</span>
            </div>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
                <LazyImage
                  src={mainImage}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-2">
                {selectedProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setMainImage(image.url)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      mainImage === image.url
                        ? "border-gray-900"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <LazyImage
                      src={image.url}
                      alt={`${selectedProduct.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title and Rating */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedProduct.name}
              </h1>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    {renderStars(Math.round(averageRating))}
                    <span className="text-sm text-gray-600">
                      ({reviewsTotal || 0} reviews)
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                    {stockStatus.text}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  {selectedProduct.discountPrice ? (
                    <>
                      <span className="text-3xl font-bold text-gray-900">
                        ${selectedProduct.discountPrice}
                      </span>
                      <span className="text-xl text-gray-500 line-through">
                        ${selectedProduct.price}
                      </span>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                        {Math.round(((selectedProduct.price - selectedProduct.discountPrice) / selectedProduct.price) * 100)}% OFF
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">
                      ${selectedProduct.price}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">Inclusive of all taxes</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                {selectedProduct.description}
              </p>
              </div>

              {/* Color Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Color</h3>
                <div className="flex space-x-3">
                  {selectedProduct.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? "border-gray-900 scale-110"
                          : "border-gray-300 hover:border-gray-500"
                      }`}
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Size</h3>
                <div className="flex space-x-3">
                  {selectedProduct.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                        selectedSize === size
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-300 text-gray-700 hover:border-gray-500"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange("minus")}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <FaMinus className="text-sm" />
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange("plus")}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <FaPlus className="text-sm" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    Max: {selectedProduct.countInStock}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={isButtonDisabled || selectedProduct.countInStock <= 0}
                    className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                      selectedProduct.countInStock <= 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : isButtonDisabled
                        ? "bg-gray-600 text-white cursor-not-allowed"
                        : "bg-gray-900 text-white hover:bg-gray-800 hover:scale-105"
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <FaShoppingCart />
                      <span>
                        {selectedProduct.countInStock <= 0
                          ? "OUT OF STOCK"
                          : isButtonDisabled
                          ? "Adding..."
                          : "ADD TO CART"}
                      </span>
                    </div>
                  </button>
                  
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isInWishlist
                        ? "border-red-500 bg-red-50 text-red-600"
                        : "border-gray-300 text-gray-600 hover:border-gray-500"
                    }`}
                  >
                    <FaHeart className={`text-xl ${isInWishlist ? "fill-current" : ""}`} />
                  </button>
                </div>

                <button
                  onClick={async () => {
                    const shareData = {
                      title: selectedProduct?.name || 'Product',
                      text: selectedProduct?.description?.slice(0, 120) || 'Check out this product',
                      url: window.location.href,
                    };
                    try {
                      if (navigator.share) {
                        await navigator.share(shareData);
                      } else {
                        await navigator.clipboard.writeText(shareData.url);
                        toast.success('Link copied to clipboard', { duration: 1500 });
                      }
                    } catch (err) {
                      console.error(err);
                      toast.error('Unable to share. Try copying the link.', { duration: 1500 });
                    }
                  }}
                  className="w-full py-3 px-6 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <FaShareAlt />
                    <span>Share</span>
                  </div>
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <FaTruck className="text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Free Shipping</p>
                    <p className="text-sm text-gray-600">On orders over $50</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FaShieldAlt className="text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Secure Payment</p>
                    <p className="text-sm text-gray-600">100% secure</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FaUndo className="text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Easy Returns</p>
                    <p className="text-sm text-gray-600">30-day return</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: "description", label: "Description" },
                  { id: "reviews", label: `Reviews (${reviewsTotal || 0})` },
                  { id: "specifications", label: "Specifications" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-gray-900 text-gray-900"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "description" && (
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {selectedProduct.description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center space-x-2">
                          <FaCheck className="text-green-500 text-sm" />
                          <span>Premium quality materials</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <FaCheck className="text-green-500 text-sm" />
                          <span>Comfortable fit</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <FaCheck className="text-green-500 text-sm" />
                          <span>Easy care instructions</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Care Instructions</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Machine wash cold</li>
                        <li>• Tumble dry low</li>
                        <li>• Do not bleach</li>
                        <li>• Iron on low heat</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  {/* Review Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Reviews</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-gray-900">
                              {averageRating.toFixed(1)}
                            </div>
                            {renderStars(Math.round(averageRating))}
                            <p className="text-sm text-gray-600 mt-1">
                              Based on {reviewsTotal || 0} reviews
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="w-full py-3 px-6 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                      >
                        Write a Review
                      </button>
                    </div>
                  </div>

                  {/* Review Form */}
                  {showReviewForm && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Write Your Review</h4>
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating
                          </label>
                          {renderStars(reviewForm.rating, true, (rating) =>
                            setReviewForm({ ...reviewForm, rating })
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Review
                          </label>
                          <textarea
                            value={reviewForm.comment}
                            onChange={(e) =>
                              setReviewForm({ ...reviewForm, comment: e.target.value })
                            }
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            placeholder="Share your experience with this product..."
                            required
                          />
                        </div>
                        <div className="flex space-x-4">
                          <button
                            type="submit"
                            className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                          >
                            Submit Review
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowReviewForm(false)}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {reviewsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                      </div>
                    ) : reviews && reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {review.user?.name?.charAt(0) || "U"}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium text-gray-900">
                                  {review.user?.name || "Anonymous"}
                                </span>
                                {renderStars(review.rating)}
                                <span className="text-sm text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                      </div>
                    )}
                  </div>

                  {/* Pagination */}
                  {reviewsPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 pt-4">
                      <button
                        disabled={reviewsPage <= 1}
                        onClick={() => dispatch(fetchReviews({ productId: productFetchId, page: reviewsPage - 1, limit: reviewsLimit }))}
                        className={`px-3 py-1 rounded border ${reviewsPage <= 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">Page {reviewsPage} of {reviewsPages}</span>
                      <button
                        disabled={reviewsPage >= reviewsPages}
                        onClick={() => dispatch(fetchReviews({ productId: productFetchId, page: reviewsPage + 1, limit: reviewsLimit }))}
                        className={`px-3 py-1 rounded border ${reviewsPage >= reviewsPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Product Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-700">Brand</span>
                        <span className="text-gray-900">{selectedProduct.brand || "N/A"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-700">Material</span>
                        <span className="text-gray-900">{selectedProduct.material || "N/A"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-700">Gender</span>
                        <span className="text-gray-900">{selectedProduct.gender || "N/A"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-700">SKU</span>
                        <span className="text-gray-900">{selectedProduct.sku}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-700">Category</span>
                        <span className="text-gray-900">{selectedProduct.category}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-700">Collection</span>
                        <span className="text-gray-900">{selectedProduct.collections}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-700">Available Sizes</span>
                        <span className="text-gray-900">{selectedProduct.sizes.join(", ")}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-700">Available Colors</span>
                        <span className="text-gray-900">{selectedProduct.colors.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Similar Products */}
          {similarProducts && similarProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">You may also like</h2>
              {/* Desktop grid */}
              <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Mobile swipe carousel */}
              <div className="md:hidden overflow-x-auto flex space-x-4 -mx-4 px-4 scrollbar-hide">
                {similarProducts.map((product) => (
                  <div key={product._id} className="min-w-[100%] sm:min-w-[50%] lg:min-w-[30%]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetails;