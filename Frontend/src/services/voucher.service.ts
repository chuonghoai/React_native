import { ApiResponse } from "../models/api.model";
import { ENDPOINTS } from "./api/endpoints";
import { http } from "./api/http";

export const voucherService = {
    getDiscountProducts(page = 0, size = 10, sortBy = 'id', order = 'asc' ) {
        const url = `${ENDPOINTS.GET_DISCOUNT_PRODUCTS}?page=${page}&size=${size}&sortBy=${sortBy}&order=${order}`;
        return http.get<ApiResponse<any>>(url);
    },
};