package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.OrderRequest;
import com.example.backend.enums.OrderStatus;
import com.example.backend.service.OrderService;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired private OrderService orderService;

    @PostMapping("/create")
    public ApiResponse createOrder(@RequestBody OrderRequest request) {
        try {
            return orderService.createOrder(request);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi đặt hàng: " + e.getMessage());
        }
    }

    @GetMapping("/history")
    public ApiResponse getMyOrders() {
        return orderService.getMyOrders();
    }

    @PostMapping("/cancel/{id}")
    public ApiResponse cancelOrder(@PathVariable Long id) {
        try {
            return orderService.cancelOrder(id);
        } catch (Exception e) {
             return ApiResponse.error("Lỗi: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/status")
    public ApiResponse updateStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        return orderService.updateOrderStatus(id, status);
    }
}