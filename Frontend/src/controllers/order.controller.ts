import { CashFlowStat, Order, OrderRequest } from "@/src/models/order.model";
import { orderService } from "@/src/services/order.service";

type BaseResult =
  | { ok: true; data?: any; message?: string }
  | { ok: false; message: string };
type OrderListResult =
  | { ok: true; data: Order[] }
  | { ok: false; message: string };

export const orderController = {
  async create(payload: OrderRequest): Promise<BaseResult> {
    try {
      const res = await orderService.createOrder(payload);
      if (res.success) return { ok: true, data: res.data };
      return { ok: false, message: res.message || "Lỗi đặt hàng" };
    } catch (e: any) {
      return { ok: false, message: e.message || "Lỗi kết nối" };
    }
  },

  async getHistory(): Promise<OrderListResult> {
    try {
      const res = await orderService.getHistory();
      if (res.success && res.data) return { ok: true, data: res.data };
      return { ok: false, message: res.message || "Lỗi tải lịch sử đơn hàng" };
    } catch (e: any) {
      return { ok: false, message: e.message || "Lỗi kết nối" };
    }
  },

  async cancel(orderId: number): Promise<BaseResult> {
    try {
      const res = await orderService.cancelOrder(orderId);
      if (res.success) return { ok: true, message: res.message };
      return { ok: false, message: res.message || "Không thể hủy đơn" };
    } catch (e: any) {
      return { ok: false, message: e.message || "Lỗi kết nối" };
    }
  },

  async getStatistics(): Promise<{
    ok: boolean;
    data?: CashFlowStat[];
    message?: string;
  }> {
    try {
      const res = await orderService.getStatistics();
      if (res.success && res.data) return { ok: true, data: res.data };
      return { ok: false, message: res.message };
    } catch (e: any) {
      return { ok: false, message: e.message || "Lỗi kết nối" };
    }
  },
};
