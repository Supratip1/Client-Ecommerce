// API Configuration
// Use localhost for local development, Vercel URL for production
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3000' 
  : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000');

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/users/login`,
  REGISTER: `${API_BASE_URL}/api/users/register`,
  GOOGLE_AUTH: `${API_BASE_URL}/api/auth/google`,
  
  // Products
  PRODUCTS: `${API_BASE_URL}/api/products`,
  PRODUCT_BY_ID: (id) => `${API_BASE_URL}/api/products/${id}`,
  SIMILAR_PRODUCTS: (id) => `${API_BASE_URL}/api/products/similar/${id}`,
  BEST_SELLER: `${API_BASE_URL}/api/products/best-seller`,
  UPLOAD: `${API_BASE_URL}/api/upload`,
  
  // Cart
  CART: `${API_BASE_URL}/api/cart`,
  CART_MERGE: `${API_BASE_URL}/api/cart/merge`,
  
  // Checkout
  CHECKOUT: `${API_BASE_URL}/api/checkout`,
  CHECKOUT_PAY: (id) => `${API_BASE_URL}/api/checkout/${id}/pay`,
  CHECKOUT_FINALIZE: (id) => `${API_BASE_URL}/api/checkout/${id}/finalize`,
  
  // Orders
  MY_ORDERS: `${API_BASE_URL}/api/orders/my-orders`,
  ORDER_BY_ID: (id) => `${API_BASE_URL}/api/orders/${id}`,
  
  // Stripe
  CREATE_PAYMENT_INTENT: `${API_BASE_URL}/api/stripe/create-payment-intent`,
  CONFIRM_PAYMENT: `${API_BASE_URL}/api/stripe/confirm-payment`,
  
  // Admin
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_USER_BY_ID: (id) => `${API_BASE_URL}/api/admin/users/${id}`,
  ADMIN_ORDERS: `${API_BASE_URL}/api/admin/orders`,
  ADMIN_ORDER_BY_ID: (id) => `${API_BASE_URL}/api/admin/orders/${id}`,
  
  // Proxy
  GOOGLE_AVATAR_PROXY: (avatar) => `${API_BASE_URL}/api/proxy/google-avatar/${encodeURIComponent(avatar)}`
};

export default API_ENDPOINTS;

