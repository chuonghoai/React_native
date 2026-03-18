package com.example.backend.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.controller.AuthController;
import com.example.backend.dto.ApiResponse;
import com.example.backend.entities.Coupon;
import com.example.backend.repositories.CouponRepository;

@Service
public class CouponService {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired private CouponRepository couponRepository;

    public ApiResponse getAvailableCoupons() {
        List<Coupon> coupons = couponRepository.findActiveCoupons();
        logger.info("Lay danh sach ma giam gia");
        return ApiResponse.success("Lấy danh sách mã giảm giá thành công", coupons);
    }
}