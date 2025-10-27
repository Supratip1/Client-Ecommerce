import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../redux/slice/cartSlice";


const OrderConfirmationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {checkout} = useSelector((state) => state.checkout);

  //CLear the cart when the order is confirm
  useEffect(() => {
    if(checkout && checkout._id){
      dispatch(clearCart());
      localStorage.removeItem("cart");
    }else{
      navigate("/my-orders")
    }
  }, [checkout, dispatch, navigate])

  const calculateEstimatedDelivery = (createdAt) => {
    const orderDate = new Date(createdAt);
    // Add 7-10 business days (excluding weekends)
    let businessDaysAdded = 0;
    let currentDate = new Date(orderDate);
    
    while (businessDaysAdded < 8) { // 8 business days
      currentDate.setDate(currentDate.getDate() + 1);
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        businessDaysAdded++;
      }
    }
    
    return currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg px-2">
            Thank you for your purchase. We'll send you a confirmation email shortly.
          </p>
        </div>

        {checkout && (
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-6 sm:mb-8">
              {/* Order Id and Date */}
              <div className="w-full sm:w-auto">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 break-all sm:break-normal">
                  Order ID: {checkout._id}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Order date: {new Date(checkout.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              {/* Estimated Delivery */}
              <div className="text-left sm:text-right w-full sm:w-auto">
                <p className="text-sm text-gray-500 mb-1">Estimated Delivery</p>
                <p className="text-base sm:text-lg font-semibold text-green-600">
                  {calculateEstimatedDelivery(checkout.createdAt)}
                </p>
              </div>
            </div>
            {/* Ordered Items */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Ordered Items</h3>
              <div className="space-y-3 sm:space-y-4">
                {checkout.checkoutItems.map((item) => (
                  <div key={item.productId} className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg mr-3 sm:mr-4"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        {item.color} | Size: {item.size}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-base sm:text-lg font-semibold text-gray-900">${item.price}</p>
                      <p className="text-xs sm:text-sm text-gray-500">each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Delivery Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-200">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 font-medium">Payment Method</p>
                  <p className="text-gray-600">{checkout.paymentMethod || 'Stripe'}</p>
                  <p className="text-gray-700 font-medium mt-2">Total Amount</p>
                  <p className="text-lg font-semibold text-gray-900">${checkout.totalPrice}</p>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Delivery Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 font-medium">Shipping Address</p>
                  <p className="text-gray-600">
                    {checkout.shippingAddress.address}
                  </p>
                  <p className="text-gray-600">
                    {checkout.shippingAddress.city}, {checkout.shippingAddress.postalCode}
                  </p>
                  <p className="text-gray-600">
                    {checkout.shippingAddress.country}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
