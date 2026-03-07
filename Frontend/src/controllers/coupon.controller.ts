import { Coupon } from "../models/coupon.model";
import { couponService } from "../services/coupon.service";

export const couponController = {
  async getList(): Promise<{ ok: boolean; data?: Coupon[]; message?: string }> {
    try {
      const res = await couponService.getList();
      if (res.success && res.data) return { ok: true, data: res.data };
      return { ok: false, message: res.message };
    } catch (e: any) {
      return { ok: false, message: e.message || "Lỗi kết nối" };
    }
  },
};
