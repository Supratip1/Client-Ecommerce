import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StripeButton from "./StripeButton";
import { useDispatch, useSelector } from "react-redux";
import { createCheckout } from "../../redux/slice/checkoutSlice";
import axios from "axios";

// Use localhost for local development, Vercel URL for production
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3000' 
  : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000');

const CheckOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart, loading, error } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [checkoutId, setCheckoutId] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [shippingAddress, setShippingaAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  //Ensure that cart is loaded before proceeding
  useEffect(() => {
    if (!cart || !cart.products || cart.products.length === 0) {
      navigate("/");
    }
  }, [cart, navigate]);

  const handleCreateCheckout = async (e) => {
    e.preventDefault();
    if (cart && cart.products.length > 0) {
      const res = await dispatch(
        createCheckout({
          checkoutItems: cart.products,
          shippingAddress,
          paymentMethod: "Stripe",
          totalPrice: cart.totalPrice,
        })
      );
      if (res.payload && res.payload._id) {
        setCheckoutId(res.payload._id); // Set checkout ID if checkout was successfull
      }
    }
  };

  const handlePaymentSuccess = async (stripeResponse) => {
    // Prevent duplicate processing
    if (isProcessingPayment) {
      console.log('Payment already being processed, skipping duplicate call');
      return;
    }
    
    setIsProcessingPayment(true);
    try {
      console.log('Payment success handler called with:', stripeResponse);
      
      // Payment and order are already created by StripeButton
      // Just navigate to confirmation
      console.log('Order already created by StripeButton, navigating to confirmation');
      
      // Small delay to ensure order is saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      navigate("/order-confirmation");
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleFinalizeCheckout = async (checkoutId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/checkout/${checkoutId}/finalize`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      navigate("/order-confirmation");
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <p>Loading cart ...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!cart || !cart.products || cart.products.length === 0) {
    return <p>Your cart is empty</p>;
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6 tracking-tighter">
      {/* left section */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl uppercase mb-6">Checkout</h2>
        <form onSubmit={handleCreateCheckout}>
          <h3 className="text-lg mb-4">Contact Details</h3>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={user ? user.email : ""}
              className="w-full p-2 border rounded"
              disabled
            />
          </div>
          <h3 className="text-lg mb-4">Delivery</h3>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">First Name</label>
              <input
                type="text"
                value={shippingAddress.firstName}
                onChange={(e) =>
                  setShippingaAddress({
                    ...shippingAddress,
                    firstName: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Last Name</label>
              <input
                type="text"
                value={shippingAddress.lastName}
                onChange={(e) =>
                  setShippingaAddress({
                    ...shippingAddress,
                    lastName: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Address</label>
            <input
              type="text"
              value={shippingAddress.address}
              onChange={(e) =>
                setShippingaAddress({
                  ...shippingAddress,
                  address: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">City</label>
              <input
                type="text"
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingaAddress({
                    ...shippingAddress,
                    city: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Postal Code</label>
              <input
                type="text"
                value={shippingAddress.postalCode}
                onChange={(e) =>
                  setShippingaAddress({
                    ...shippingAddress,
                    postalCode: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Country</label>
            <input
              type="text"
              value={shippingAddress.country}
              onChange={(e) =>
                setShippingaAddress({
                  ...shippingAddress,
                  country: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Phone</label>
            <input
              type="tel"
              value={shippingAddress.phone}
              onChange={(e) =>
                setShippingaAddress({
                  ...shippingAddress,
                  phone: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mt-6">
            {!checkoutId ? (
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded"
              >
                Continue to Payment
              </button>
            ) : null}
          </div>
        </form>
        {checkoutId && (
          <div className="mt-6">
            <h3 className="text-lg mb-4">Pay with Stripe</h3>
            {/* Stripe component */}
            <StripeButton
              amount={cart.totalPrice}
              onSuccess={handlePaymentSuccess}
              onError={(err) => alert("Payment failed. Try again.")}
              items={cart.products}
              shippingAddress={shippingAddress}
            />
          </div>
        )}
      </div>
      {/* RIght section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg mb-4">Order Summary</h3>
        <div className="border-t py-4 mb-4">
          {cart.products.map((product, index) => (
            <div
              key={index}
              className="flex items-start justify-between py-3 border-b"
            >
              <div className="flex items-start">
                <img
                  src={product.image || "/placeholder.jpg"}
                  alt={product.name}
                  className="w-20 h-24 object-cover mr-4"
                />
                <div>
                  <h3 className="text-md font-medium">{product.name}</h3>
                  <p className="text-gray-500 text-sm">Size: {product.size}</p>
                  <p className="text-gray-500 text-sm">Color: {product.color}</p>
                  <p className="text-gray-500 text-sm">Quantity: {product.quantity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">${product.price?.toLocaleString()} each</p>
                <p className="text-lg font-semibold">${(product.price * product.quantity)?.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3 border-t pt-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Subtotal</p>
            <p className="font-medium">${cart.totalPrice?.toLocaleString()}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Shipping</p>
            <p className="font-medium text-green-600">Free</p>
          </div>
          <div className="flex justify-between items-center text-lg font-semibold border-t pt-3">
            <p>Total</p>
            <p>${cart.totalPrice?.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;

