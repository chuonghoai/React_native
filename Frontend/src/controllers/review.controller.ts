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
    }
};