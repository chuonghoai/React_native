import { Product } from "../models/product.model";
import { favoriteService } from "../services/favorite.service";

export const favoriteController = {
    async toggle(productId: number) {
        try {
            const res = await favoriteService.toggle(productId);
            if (res.success) return { ok: true, isFavorite: res.data };
            return { ok: false, message: res.message };
        } catch (e: any) {
            return { ok: false, message: e.message || "Lỗi hệ thống" };
        }
    },
    
    async getList(): Promise<{ ok: boolean; data?: Product[]; message?: string }> {
        try {
            const res = await favoriteService.getFavorites();
            if (res.success && res.data) return { ok: true, data: res.data };
            return { ok: false, message: res.message || "Lỗi tải danh sách" };
        } catch (e: any) {
            return { ok: false, message: e.message || "Lỗi kết nối" };
        }
    }
};