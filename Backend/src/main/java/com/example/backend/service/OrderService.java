package com.example.backend.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.OrderItemResponse;
import com.example.backend.dto.OrderRequest;
import com.example.backend.dto.OrderResponse;
import com.example.backend.dto.ReviewDto;
import com.example.backend.entities.Cart;
import com.example.backend.entities.CartItem;
import com.example.backend.entities.Order;
import com.example.backend.entities.OrderItem;
import com.example.backend.entities.Review;
import com.example.backend.entities.User;
import com.example.backend.enums.OrderStatus;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.repositories.CartRepository;
import com.example.backend.repositories.OrderRepository;
import com.example.backend.repositories.ReviewRepository;
import com.example.backend.repositories.UserRepository;

@Service
public class OrderService {
    @Autowired private OrderRepository orderRepository;
    @Autowired private CartService cartService;
    @Autowired private CartRepository cartRepository;
    @Autowired private AuthService authService;
    @Autowired private UserRepository userRepository;
    @Autowired private ReviewRepository reviewRepository;

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
        
        List<Review> userReviews = reviewRepository.findByUserId(userId);
        Map<Long, Review> reviewMap = userReviews.stream()
                .collect(Collectors.toMap(r -> r.getProduct().getId(), r -> r, (r1, r2) -> r1));

        List<OrderResponse> response = orders.stream().map(order -> {
            List<OrderItemResponse> items = order.getOrderItems().stream().map(oi -> {
                Review r = reviewMap.get(oi.getProduct().getId());
                ReviewDto reviewDto = r != null ? new ReviewDto(r.getRating(), r.getComment()) : null;
                
                return OrderItemResponse.builder()
                        .id(oi.getId())
                        .quantity(oi.getQuantity())
                        .price(oi.getPrice())
                        .product(oi.getProduct())
                        .review(reviewDto)
                        .build();
            }).collect(Collectors.toList());

            return OrderResponse.builder()
                    .id(order.getId())
                    .orderDate(order.getOrderDate())
                    .totalPrice(order.getTotalPrice())
                    .status(order.getStatus())
                    .paymentMethod(order.getPaymentMethod())
                    .shippingAddress(order.getShippingAddress())
                    .shippingPhone(order.getShippingPhone())
                    .orderItems(items)
                    .build();
        }).collect(Collectors.toList());

        return ApiResponse.success("Lấy danh sách đơn hàng thành công", response);
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