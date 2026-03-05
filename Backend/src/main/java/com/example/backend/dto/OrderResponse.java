package com.example.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.example.backend.enums.OrderStatus;
import com.example.backend.enums.PaymentMethod;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponse {
    private Long id;
    private LocalDateTime orderDate;
    private Double totalPrice;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private String shippingAddress;
    private String shippingPhone;
    private List<OrderItemResponse> orderItems;
}