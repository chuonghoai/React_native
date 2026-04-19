package com.example.backend.service.Admin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dto.ApiResponse;
import com.example.backend.entities.Product;
import com.example.backend.repositories.OrderRepository;
import com.example.backend.repositories.ProductRepository;
import com.example.backend.repositories.UserRepository;

@Service
public class AdminDashboardService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;

    public ApiResponse getOrderStats() {
        List<Object[]> stats = orderRepository.countOrdersByStatus();
        Map<String, Long> result = new HashMap<>();
        
        for (Object[] stat : stats) {
            String status = stat[0].toString();
            Long count = (Long) stat[1];
            result.put(status, count);
        }
        return ApiResponse.success("Thống kê đơn hàng thành công", result);
    }

    public ApiResponse getRevenueByMonth(int month, int year) {
        Double revenue = orderRepository.calculateRevenueByMonth(month, year);
        if (revenue == null) {
            revenue = 0.0;
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("month", month);
        result.put("year", year);
        result.put("revenue", revenue);
        
        return ApiResponse.success("Thống kê doanh thu thành công", result);
    }

    public ApiResponse getLowStockProducts(Long threshold) {
        List<Product> lowStockProducts = productRepository.findLowStockProducts(threshold);
        return ApiResponse.success("Lấy danh sách cảnh báo hết hàng thành công", lowStockProducts);
    }

    public ApiResponse getTotalUsers() {
        long totalClients = userRepository.countByRole("CLIENT");
        Map<String, Long> result = new HashMap<>();
        result.put("totalUsers", totalClients);
        
        return ApiResponse.success("Đếm tổng user thành công", result);
    }
}