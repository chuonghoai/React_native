import { Cart } from "@/src/models/cart.model";
import { cartService } from "@/src/services/cart.service";

type GetCartResult = 
  | { ok: true; data: Cart }
  | { ok: false; message: string };

type BaseResult = { ok: true } | { ok: false; message: string };

export const cartController = {
  async getMyCart(): Promise<GetCartResult> {
    try {
      const res = await cartService.getCart();
      if (res.success && res.data) {
        return { ok: true, data: res.data };
      }
      return { ok: false, message: res.message || "Lỗi tải giỏ hàng" };
    } catch (e: any) {
      return { ok: false, message: e.message || "Lỗi kết nối" };
    }
  },

  async addToCart(productId: number, quantity: number = 1): Promise<BaseResult> {
    try {
      const res = await cartService.addToCart(productId, quantity);
      if (res.success) return { ok: true };
      return { ok: false, message: res.message };
    } catch (e: any) {
      return { ok: false, message: e.message };
    }
  },

  async updateQuantity(productId: number, quantity: number): Promise<BaseResult> {
    try {
      const res = await cartService.updateQuantity(productId, quantity);
      if (res.success) return { ok: true };
      return { ok: false, message: res.message };
    } catch (e: any) {
      return { ok: false, message: e.message };
    }
  },

  async remove(productId: number): Promise<BaseResult> {
    try {
      const res = await cartService.removeFromCart(productId);
      if (res.success) return { ok: true };
      return { ok: false, message: res.message };
    } catch (e: any) {
      return { ok: false, message: e.message };
    }
  },
};