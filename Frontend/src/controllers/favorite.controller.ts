import { ENDPOINTS } from "../services/api/endpoints";
import { http } from "../services/api/http";

export const favoriteController = {
    async toggle(productId: number) {
        try {
            const res = await http.post<any>(`${ENDPOINTS.TOGGLE_FAVORITE}/${productId}`);
            if (res.success) return { ok: true, isFavorite: res.data };
            return { ok: false, message: res.message };
        } catch (e: any) {
            return { ok: false, message: e.message || "Lỗi hệ thống" };
        }
    }
};