package com.example.backend.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.backend.dto.ApiResponse;
import com.example.backend.entities.Coupon;
import com.example.backend.repositories.CouponRepository;

@Service
public class CouponService {
    @Autowired private CouponRepository couponRepository;

    public ApiResponse getAvailableCoupons() {
        List<Coupon> coupons = couponRepository.findActiveCoupons();
        System.out.println("Lay danh sach ma giam gia");
        return ApiResponse.success("Lấy danh sách mã giảm giá thành công", coupons);
    }
}