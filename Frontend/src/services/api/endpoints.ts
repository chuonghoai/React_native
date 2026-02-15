export const ENDPOINTS = {
  // Auth
  LOGIN: "/api/auth/login",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  RESET_PASSWORD: "/api/auth/reset-password",
  REGISTER: "/api/auth/register",
  VERIFY_OTP: "/api/auth/verify-otp",
  LOGOUT: "/api/auth/logout",

  // User profile
  GET_ME: "/api/auth/me/get",
  UPDATE_PROFILE: "/api/user/update-profile",
  CHANGE_PASSWORD: "/api/user/change-password",
  REQUEST_CHANGE_EMAIL: "/api/user/request-change-email",
  VERIFY_CHANGE_EMAIL: "/api/user/verify-change-email",
  
  // Products
  GET_PRODUCTS: "/products",
  SEARCH_PRODUCTS: "/products/search", 
  FILTER_PRODUCTS: "/products/category",
  GET_BEST_SELLERS: "/products/best-sellers",
  GET_DISCOUNT_PRODUCTS: "/vouchers",

  // Cart
  GET_CART: "/api/cart",
  ADD_TO_CART: "/api/cart/add",
  REMOVE_FROM_CART: "/api/cart/remove",
  UPDATE_CART: "/api/cart/update",

  // Orders
  CREATE_ORDER: "/api/orders/create",
  GET_ORDERS_HISTORY: "/api/orders/history",
  CANCEL_ORDER: "/api/orders/cancel",
} as const;
