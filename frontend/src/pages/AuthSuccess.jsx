import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { mergeCart, fetchCart } from "../redux/slice/cartSlice";
import { googleLogin } from "../redux/slice/authSlice";

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        // First, complete the login
        dispatch(googleLogin({ user, token })).then(async () => {
          // Wait a bit for state to update
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Get the latest cart state after login
          const currentGuestId = localStorage.getItem("guestId");
          const localCart = localStorage.getItem("cart");
          
          // Merge guest cart into user cart if there's a guest cart
          if (localCart) {
            try {
              const guestCart = JSON.parse(localCart);
              if (guestCart?.products?.length > 0 && currentGuestId) {
                await dispatch(mergeCart({ guestId: currentGuestId, user }));
              }
            } catch (e) {
              console.log("No guest cart to merge:", e);
            }
          }
          
          // Now fetch the user's cart after merge
          await dispatch(fetchCart({ userId: user._id, guestId: null }));
          
          navigate("/");
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/login?error=authentication_failed");
      }
    } else {
      navigate("/login?error=authentication_failed");
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
