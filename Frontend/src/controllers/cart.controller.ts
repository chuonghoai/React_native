import { cartService } from "@/src/services/cart.service";

type CartResult = 
  | { ok: true; message: string }
  | { ok: false; message: string };

export const cartController = {
  async addToCart(productId: number, quantity: number = 1): Promise<CartResult> {
    try {
      const res = await cartService.addToCart(productId, quantity);
      
      if (res.success) {
        console.log("Add to cart success:", res);
        return { ok: true, message: res.message || "Đã thêm vào giỏ hàng" };
      }

      console.log("Add to cart failed:", res);
      return { ok: false, message: res.message || "Không thể thêm vào giỏ" };

    } catch (e: any) {
      console.log("Add to cart error:", e);
      return { ok: false, message: e.message || "Lỗi kết nối" };
    }
  },
};