import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import LazyImage from "../Common/LazyImage";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/slice/cartSlice";
import { toast } from "sonner";
import ProductQuickView from "./ProductQuickView";

const renderStars = (rating) => {
  const safe = Math.max(0, Math.min(5, Math.round(rating || 0)));
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <FaStar key={i} className={`text-yellow-400 ${i <= safe ? "opacity-100" : "opacity-30"}`} />
      ))}
    </div>
  );
};

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { user, guestId } = useSelector((state) => state.auth);
  const [openQuickAdd, setOpenQuickAdd] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || "");
  const [adding, setAdding] = useState(false);
  const isOutOfStock = (product?.countInStock || 0) <= 0;
  const hasDiscount = product?.discountPrice && product?.discountPrice < product?.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const priceBlock = (
    <div className="flex items-center space-x-2">
      {hasDiscount ? (
        <>
          <span className="font-semibold text-gray-900">${product.discountPrice}</span>
          <span className="text-sm text-gray-500 line-through">${product.price}</span>
          <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-xs font-medium">{discountPct}% OFF</span>
        </>
      ) : (
        <span className="font-semibold text-gray-900">${product.price}</span>
      )}
    </div>
  );

  return (
    <div className="group">
      <Link to={`/product/${product._id}`} className="block">
      <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${isOutOfStock ? "opacity-80" : ""}`}>
        <div className="w-full aspect-[3/4] overflow-hidden rounded-t-xl relative">
          <LazyImage
            src={product?.images?.[0]?.url || "/placeholder.jpg"}
            alt={product?.images?.[0]?.altText || product?.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {isOutOfStock && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">Out of Stock</div>
          )}
          {hasDiscount && (
            <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded text-xs font-medium">-{discountPct}%</div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
          <div className="flex items-center space-x-2 mb-2">
            {renderStars(product.rating)}
            <span className="text-xs text-gray-600">({product.numReviews || 0})</span>
          </div>
          {priceBlock}
          {product.countInStock > 0 && product.countInStock <= 5 && (
            <div className="mt-2 text-xs text-orange-600">Only {product.countInStock} left</div>
          )}
        </div>
      </div>
      </Link>

      {/* Quick Add */}
      <div className="mt-2">
        <button
          disabled={isOutOfStock}
          onClick={() => setOpenQuickAdd(true)}
          className={`w-full py-2 text-sm rounded-lg border transition-colors ${
            isOutOfStock
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : "Quick Add"}
        </button>
      </div>

      {openQuickAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={() => setOpenQuickAdd(false)}>
          <div className="bg-white w-full sm:w-[420px] rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-14 h-14 overflow-hidden rounded-lg">
                <img src={product?.images?.[0]?.url} alt={product?.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{product?.name}</p>
                {priceBlock}
              </div>
            </div>

            {product?.colors?.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`w-8 h-8 rounded-full border-2 ${selectedColor === c ? "border-gray-900" : "border-gray-300"}`}
                      style={{ backgroundColor: c.toLowerCase() }}
                    />
                  ))}
                </div>
              </div>
            )}

            {product?.sizes?.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1.5 rounded-lg border text-sm ${selectedSize === s ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setOpenQuickAdd(false)}
                className="flex-1 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={adding || isOutOfStock}
                onClick={async () => {
                  if (!selectedSize || !selectedColor) {
                    toast.error("Select size and color");
                    return;
                  }
                  try {
                    setAdding(true);
                    await dispatch(
                      addToCart({
                        productId: product._id,
                        quantity: 1,
                        size: selectedSize,
                        color: selectedColor,
                        guestId,
                        userId: user?._id,
                      })
                    ).unwrap();
                    toast.success("Added to cart");
                    setOpenQuickAdd(false);
                  } catch (e) {
                    toast.error("Failed to add to cart");
                  } finally {
                    setAdding(false);
                  }
                }}
                className={`flex-1 py-2 rounded-lg ${
                  adding || isOutOfStock ? "bg-gray-300 text-gray-600" : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {adding ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View trigger for desktop hover */}
      <div className="hidden md:block mt-2">
        <button
          onClick={() => setOpenQuickAdd(true)}
          className="w-full py-2 text-sm rounded-lg border hover:bg-gray-50"
        >
          Quick View
        </button>
      </div>
    </div>
  );
};

export default ProductCard;


