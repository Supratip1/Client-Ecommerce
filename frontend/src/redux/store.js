import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import productReducer from "./slice/productsSlice";
import cartReducer from "./slice/cartSlice";
import checkoutReducer from "./slice/checkoutSlice";
import orderReducer from "./slice/orderSlice";
import adminReducer from "./slice/adminSlice"
import adminProductReducer from "./slice/adminProductSlice"
import adminOrderReducer from "./slice/adminOrderSlice"
import analyticsReducer from "./slice/analyticsSlice";
import reviewReducer from "./slice/reviewSlice";
import wishlistReducer from "./slice/wishlistSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    checkout: checkoutReducer,
    order: orderReducer,
    admin: adminReducer,
    adminProducts: adminProductReducer,
    adminOrders: adminOrderReducer,
    analytics: analyticsReducer,
    reviews: reviewReducer,
    wishlist: wishlistReducer,
  },
});

export default store;
