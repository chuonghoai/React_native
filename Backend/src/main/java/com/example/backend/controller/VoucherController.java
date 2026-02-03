package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ApiResponse;
import com.example.backend.service.VoucherService;

@RestController
@RequestMapping("/vouchers")
@CrossOrigin
public class VoucherController {

    @Autowired
    private VoucherService voucherService;

@GetMapping
    public ApiResponse getDiscountedProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "priceAfterDiscount") String sortBy,
            @RequestParam(defaultValue = "asc") String order
    ) {
        try {
            return voucherService.getDiscountedProducts(page, size, sortBy, order);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi: " + e.getMessage());
        }
    }
}