package com.example.backend.controller.Admin;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ApiResponse;
import com.example.backend.service.Admin.AdminOrderService;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin
public class AdminOrderController {

    @Autowired
    private AdminOrderService adminOrderService;

    @GetMapping("/{status}")
    public ApiResponse getOrdersByStatus(@PathVariable String status) {
        return adminOrderService.getOrdersByStatus(status);
    }

    @PatchMapping("/{orderId}/status")
    public ApiResponse updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> requestBody) {

        String newStatus = requestBody.get("status");

        if (newStatus == null || newStatus.trim().isEmpty()) {
            return ApiResponse.error("Trạng thái mới (status) không được để trống");
        }

        return adminOrderService.updateOrderStatus(orderId, newStatus);
    }
}