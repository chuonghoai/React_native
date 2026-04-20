package com.example.backend.controller.Admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
}