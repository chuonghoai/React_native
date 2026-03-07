package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.backend.dto.ApiResponse;
import com.example.backend.service.CouponService;

@RestController
@RequestMapping("/coupons")
@CrossOrigin
public class CouponController {
    @Autowired private CouponService couponService;

    @GetMapping
    public ApiResponse getCoupons() {
        return couponService.getAvailableCoupons();
    }
}