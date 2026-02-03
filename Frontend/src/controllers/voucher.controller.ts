import { ProductDiscount } from "../models/voucher.model";
import { voucherService } from "../services/voucher.service";

type VoucherResult = 
  | { ok: true; data: ProductDiscount[] }
  | { ok: false; message: string };

export const voucherController = {
    async getList(page = 0, size = 10): Promise<VoucherResult> {
        try {
            const res = await voucherService.getDiscountProducts(page, size);
            
            if (res.success && res.data && res.data.content) {
                return { ok: true, data: res.data.content };
            }

            return { ok: false, message: res.message || "Không tải được danh sách khuyến mãi" };
        } catch (e: any) {
            return { ok: false, message: e.message || "Lỗi kết nối server" };
        }
    }
}