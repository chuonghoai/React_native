import { ApiResponse } from "../models/api.model";
import { ENDPOINTS } from "./api/endpoints";
import { http } from "./api/http";

export const reviewService = {
    addReview(productId: number, rating: number, comment: string) {
        return http.post<ApiResponse>(ENDPOINTS.ADD_REVIEW, { productId, rating, comment });
    }
};