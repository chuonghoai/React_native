import { Review } from "../models/review.model";
import { ENDPOINTS } from "../services/api/endpoints";
import { http } from "../services/api/http";
import { reviewService } from "../services/review.service";

export const reviewController = {
    async add(productId: number, rating: number, comment: string) {
        try {
            const res = await reviewService.addReview(productId, rating, comment);
            if (res.success) return { ok: true, message: res.message };
            return { ok: false, message: res.message || "Lỗi đánh giá" };
        } catch (e: any) {
            return { ok: false, message: e.message || "Lỗi kết nối" };
        }
    },

    async getProductReviews(productId: number, page = 0, size = 10) {
        try {
            const res = await http.get<any>(`${ENDPOINTS.GET_PRODUCT_REVIEWS}/${productId}?page=${page}&size=${size}`);
            if (res.success && res.data) return { ok: true, data: res.data.content as Review[] };
            return { ok: false, message: res.message || "Lỗi tải bình luận" };
        } catch (e: any) {
            return { ok: false, message: e.message || "Lỗi kết nối" };
        }
    }
};