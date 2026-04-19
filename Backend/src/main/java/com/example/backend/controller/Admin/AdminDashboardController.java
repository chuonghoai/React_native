package com.example.backend.controller.Admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ApiResponse;
import com.example.backend.service.Admin.AdminDashboardService;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin
public class AdminDashboardController {

    @Autowired
    private AdminDashboardService adminDashboardService;

    @GetMapping("/order-stats")
    public ApiResponse getOrderStatistics() {
        return adminDashboardService.getOrderStats();
    }

    @GetMapping("/revenue")
    public ApiResponse getRevenueByMonth(
            @RequestParam int month, 
            @RequestParam int year) {
        return adminDashboardService.getRevenueByMonth(month, year);
    }

    @GetMapping("/low-stock")
    public ApiResponse getLowStockWarning(@RequestParam(defaultValue = "10") Long threshold) {
        return adminDashboardService.getLowStockProducts(threshold);
    }

    @GetMapping("/total-users")
    public ApiResponse getTotalUsers() {
        return adminDashboardService.getTotalUsers();
    }
}