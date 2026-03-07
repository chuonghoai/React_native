import { ApiResponse } from "../models/api.model";
import { Coupon } from "../models/coupon.model";
import { ENDPOINTS } from "./api/endpoints";
import { http } from "./api/http";

export const couponService = {
  getList() {
    return http.get<ApiResponse<Coupon[]>>(ENDPOINTS.GET_COUPONS);
  },
};
