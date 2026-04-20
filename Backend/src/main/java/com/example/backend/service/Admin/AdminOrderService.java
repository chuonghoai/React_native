package com.example.backend.service.Admin;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.OrderResponse;
import com.example.backend.entities.Order;
import com.example.backend.enums.OrderStatus;
import com.example.backend.repositories.OrderRepository;

@Service
public class AdminOrderService {

    @Autowired
    private OrderRepository orderRepository;

    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderDate(order.getOrderDate());
        response.setTotalPrice(order.getTotalPrice());
        response.setStatus(order.getStatus());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setShippingAddress(order.getShippingAddress());
        response.setShippingPhone(order.getShippingPhone());
        return response;
    }

    public ApiResponse getOrdersByStatus(String statusStr) {
        List<Order> orders;

        if ("ALL".equalsIgnoreCase(statusStr)) {
            orders = orderRepository.findAllByOrderByOrderDateDesc();
        } else {
            try {
                OrderStatus statusEnum = OrderStatus.valueOf(statusStr.toUpperCase());
                orders = orderRepository.findByStatusOrderByOrderDateDesc(statusEnum);
            } catch (IllegalArgumentException e) {
                return ApiResponse.error("Trạng thái đơn hàng không hợp lệ: " + statusStr);
            }
        }

        List<OrderResponse> responseList = orders.stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());

        return ApiResponse.success("Lấy danh sách đơn hàng thành công", responseList);
    }
}