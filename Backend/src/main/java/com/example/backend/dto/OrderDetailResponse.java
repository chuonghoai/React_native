package com.example.backend.dto;

import com.example.backend.enums.OrderStatus;
import com.example.backend.enums.PaymentMethod;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderDetailResponse {
    private Long id;
    private Double totalPrice;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private LocalDateTime orderDate;
    private String shippingAddress;
    private String shippingPhone;
    private String buyerName;
    private String buyerEmail;

    private List<OrderItemResponse> items;
}