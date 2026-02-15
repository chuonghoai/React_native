import { ApiResponse } from "@/src/models/api.model";
import { Order, OrderRequest } from "@/src/models/order.model";
import { ENDPOINTS } from "@/src/services/api/endpoints";
import { http } from "@/src/services/api/http";

export const orderService = {
  createOrder(payload: OrderRequest) {
    return http.post<ApiResponse<Order>>(ENDPOINTS.CREATE_ORDER, payload);
  },

  getHistory() {
    return http.get<ApiResponse<Order[]>>(ENDPOINTS.GET_ORDERS_HISTORY);
  },

  cancelOrder(orderId: number) {
    return http.post<ApiResponse>(`${ENDPOINTS.CANCEL_ORDER}/${orderId}`);
  }
};