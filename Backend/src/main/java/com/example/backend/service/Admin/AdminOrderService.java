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

import jakarta.transaction.Transactional;

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

    @Transactional
    public ApiResponse updateOrderStatus(Long orderId, String newStatusStr) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));

            OrderStatus newStatus = OrderStatus.valueOf(newStatusStr.toUpperCase());

            if (!isValidStatusTransition(order.getStatus(), newStatus)) {
                return ApiResponse.error("Không thể chuyển trạng thái từ " + order.getStatus() + " sang " + newStatus);
            }

            order.setStatus(newStatus);
            orderRepository.save(order);

            return ApiResponse.success("Cập nhật trạng thái đơn hàng thành công", null);

        } catch (IllegalArgumentException e) {
            return ApiResponse.error("Trạng thái đơn hàng không hợp lệ: " + newStatusStr);
        } catch (RuntimeException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("Có lỗi xảy ra khi cập nhật trạng thái đơn hàng: " + e.getMessage());
        }
    }

    private boolean isValidStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == newStatus)
            return true;

        if (currentStatus == OrderStatus.DELIVERED || currentStatus == OrderStatus.CANCELLED) {
            return false;
        }

        if (currentStatus == OrderStatus.NEW) {
            return newStatus == OrderStatus.CONFIRMED || newStatus == OrderStatus.CANCELLED;
        }

        if (currentStatus == OrderStatus.REQUEST_CANCEL) {
            return newStatus == OrderStatus.CANCELLED || newStatus == OrderStatus.CONFIRMED
                    || newStatus == OrderStatus.PREPARING || newStatus == OrderStatus.SHIPPING;
        }

        return true;
    }
}