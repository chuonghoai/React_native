import { ApiResponse } from "@/src/models/api.model";
import { Cart, CartRequest } from "@/src/models/cart.model";
import { ENDPOINTS } from "@/src/services/api/endpoints";
import { http } from "@/src/services/api/http";

export const cartService = {
  addToCart(productId: number, quantity: number) {
    const payload: CartRequest = { productId, quantity };
    return http.post<ApiResponse>(ENDPOINTS.ADD_TO_CART, payload);
  },

  getCart() {
    return http.get<ApiResponse<Cart>>(ENDPOINTS.GET_CART);
  },

  updateQuantity(productId: number, quantity: number) {
    const payload: CartRequest = { productId, quantity };
    return http.post<ApiResponse>(ENDPOINTS.UPDATE_CART, payload);
  },

  removeFromCart(productId: number) {
    const payload: CartRequest = { productId, quantity: 0 };
    return http.post<ApiResponse>(ENDPOINTS.REMOVE_FROM_CART, payload);
  },
};