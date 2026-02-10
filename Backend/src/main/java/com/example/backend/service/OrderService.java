package com.example.backend.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.OrderRequest;
import com.example.backend.entities.Cart;
import com.example.backend.entities.CartItem;
import com.example.backend.entities.Order;
import com.example.backend.entities.OrderItem;
import com.example.backend.entities.User;
import com.example.backend.enums.OrderStatus;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.repositories.CartRepository;
import com.example.backend.repositories.OrderRepository;
import com.example.backend.repositories.UserRepository;

@Service
public class OrderService {
    @Autowired private OrderRepository orderRepository;
    @Autowired private CartService cartService;
    @Autowired private CartRepository cartRepository;
    @Autowired private AuthService authService;
    @Autowired private UserRepository userRepository;

    @Transactional
    public ApiResponse createOrder(OrderRequest request) {
        Long userId = authService.getCurrentUserId();
        User user = userRepository.findById(userId).orElseThrow();
        Cart cart = cartService.getMyCart();

        if (cart.getCartItems().isEmpty()) {
            return ApiResponse.error("Giỏ hàng trống");
        }

        double totalPrice = cart.getCartItems().stream()
                .mapToDouble(item -> item.getProduct().getPrice() * item.getQuantity())
                .sum();

        Order order = Order.builder()
                .user(user)
                .orderDate(LocalDateTime.now())
                .status(OrderStatus.NEW)
                .paymentMethod(PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()))
                .shippingAddress(request.getAddress())
                .shippingPhone(request.getPhone())
                .totalPrice(totalPrice)
                .orderItems(new ArrayList<>())
                .build();

        for (CartItem ci : cart.getCartItems()) {
            OrderItem oi = OrderItem.builder()
                    .order(order)
                    .product(ci.getProduct())
                    .quantity(ci.getQuantity())
                    .price(ci.getProduct().getPrice())
                    .build();
            order.getOrderItems().add(oi);
        }

        orderRepository.save(order);

        cart.getCartItems().clear();
        cartRepository.save(cart);

        return ApiResponse.success("Đặt hàng thành công", order);
    }

    public ApiResponse getMyOrders() {
        Long userId = authService.getCurrentUserId();
        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId);
        return ApiResponse.success("Lấy danh sách đơn hàng thành công", orders);
    }

    @Transactional
    public ApiResponse cancelOrder(Long orderId) {
        Long userId = authService.getCurrentUserId();
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!order.getUser().getId().equals(userId)) {
            return ApiResponse.error("Không có quyền truy cập đơn hàng này");
        }

        LocalDateTime now = LocalDateTime.now();
        long minutesElapsed = Duration.between(order.getOrderDate(), now).toMinutes();

        if (order.getStatus() == OrderStatus.NEW) {
            order.setStatus(OrderStatus.CANCELLED);
        } else if (order.getStatus() == OrderStatus.CONFIRMED && minutesElapsed < 30) {
             order.setStatus(OrderStatus.CANCELLED);
        } else if (order.getStatus() == OrderStatus.PREPARING) {
            order.setStatus(OrderStatus.REQUEST_CANCEL);
            orderRepository.save(order);
            return ApiResponse.success("Đã gửi yêu cầu hủy đơn cho Shop", null);
        } else {
             return ApiResponse.error("Không thể hủy đơn hàng ở trạng thái này hoặc đã quá thời gian cho phép");
        }

        orderRepository.save(order);
        return ApiResponse.success("Hủy đơn hàng thành công", null);
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void autoConfirmOrders() {
        List<Order> newOrders = orderRepository.findByStatus(OrderStatus.NEW);
        LocalDateTime now = LocalDateTime.now();

        for (Order order : newOrders) {
            long minutesElapsed = Duration.between(order.getOrderDate(), now).toMinutes();
            if (minutesElapsed >= 30) {
                order.setStatus(OrderStatus.CONFIRMED);
                orderRepository.save(order);
                System.out.println("Auto confirmed order ID: " + order.getId());
            }
        }
    }
}