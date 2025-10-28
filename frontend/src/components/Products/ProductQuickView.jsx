import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/slice/cartSlice";
import { toast } from "sonner";

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

const ProductQuickView = ({ product, onClose }) => {
  const dispatch = useDispatch();
  const { user, guestId } = useSelector((state) => state.auth);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || "");
  const [adding, setAdding] = useState(false);

  const hasDiscount = product?.discountPrice && product?.discountPrice < product?.price;
  const discountPct = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white w-full max-w-3xl rounded-2xl p-4 sm:p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img src={product?.images?.[0]?.url} alt={product?.name} className="w-full rounded-xl object-cover" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{product?.name}</h3>
            <div className="flex items-center space-x-2 mb-2">
              {renderStars(product?.rating)}
              <span className="text-xs text-gray-600">({product?.numReviews || 0})</span>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              {hasDiscount ? (
                <>
                  <span className="text-2xl font-bold text-gray-900">${product.discountPrice}</span>
                  <span className="text-gray-500 line-through">${product.price}</span>
                  <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-xs font-medium">{discountPct}% OFF</span>
                </>
              ) : (
                <span className="text-2xl font-bold text-gray-900">${product.price}</span>
              )}
            </div>
            <p className="text-gray-700 text-sm mb-4 line-clamp-4">{product?.description}</p>

            {product?.colors?.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button key={c} className={`w-8 h-8 rounded-full border-2 ${selectedColor === c ? "border-gray-900" : "border-gray-300"}`} onClick={() => setSelectedColor(c)} style={{ backgroundColor: c.toLowerCase() }} />
                  ))}
                </div>
              </div>
            )}

            {product?.sizes?.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button key={s} className={`px-3 py-1.5 rounded-lg border text-sm ${selectedSize === s ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300"}`} onClick={() => setSelectedSize(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button className="flex-1 py-2 border rounded-lg text-gray-700 hover:bg-gray-50" onClick={onClose}>Close</button>
              <button
                disabled={adding || (product?.countInStock || 0) <= 0}
                onClick={async () => {
                  if (!selectedSize || !selectedColor) {
                    toast.error("Select size and color");
                    return;
                  }
                  try {
                    setAdding(true);
                    await dispatch(
                      addToCart({ productId: product._id, quantity: 1, size: selectedSize, color: selectedColor, guestId, userId: user?._id })
                    ).unwrap();
                    toast.success("Added to cart");
                    onClose();
                  } catch (e) {
                    toast.error("Failed to add to cart");
                  } finally {
                    setAdding(false);
                  }
                }}
                className={`flex-1 py-2 rounded-lg ${adding || (product?.countInStock || 0) <= 0 ? "bg-gray-300 text-gray-600" : "bg-gray-900 text-white hover:bg-gray-800"}`}
              >
                {adding ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;


