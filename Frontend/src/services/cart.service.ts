import { ApiResponse } from "@/src/models/api.model";
import { CartRequest } from "@/src/models/cart.model";
import { ENDPOINTS } from "@/src/services/api/endpoints";
import { http } from "@/src/services/api/http";

export const cartService = {
  addToCart(productId: number, quantity: number) {
    const payload: CartRequest = { productId, quantity };
    return http.post<ApiResponse>(ENDPOINTS.ADD_TO_CART, payload);
  },

  getCart() {
    return http.get<ApiResponse>(ENDPOINTS.GET_CART);
  },
};