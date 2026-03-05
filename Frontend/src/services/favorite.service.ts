import { ApiResponse } from "../models/api.model";
import { Product } from "../models/product.model";
import { ENDPOINTS } from "./api/endpoints";
import { http } from "./api/http";

export const favoriteService = {
    toggle(productId: number) {
        return http.post<ApiResponse<boolean>>(`${ENDPOINTS.TOGGLE_FAVORITE}/${productId}`);
    },
    getFavorites() {
        return http.get<ApiResponse<Product[]>>(ENDPOINTS.GET_FAVORITES);
    }
};