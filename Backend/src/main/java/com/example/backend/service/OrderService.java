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
import com.example.backend.entities.Coupon;
import com.example.backend.entities.Order;
import com.example.backend.entities.OrderItem;
import com.example.backend.entities.Product;
import com.example.backend.entities.Review;
import com.example.backend.entities.User;
import com.example.backend.enums.DiscountType;
import com.example.backend.enums.OrderStatus;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.repositories.CartRepository;
import com.example.backend.repositories.CouponRepository;
import com.example.backend.repositories.OrderRepository;
import com.example.backend.repositories.ProductRepository;
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
    @Autowired private ProductRepository productRepository;
    @Autowired private CouponRepository couponRepository;

    @Transactional
    public ApiResponse createOrder(OrderRequest request) {
        Long userId = authService.getCurrentUserId();
        User user = userRepository.findById(userId).orElseThrow();
        Cart cart = cartService.getMyCart();

        if (cart.getCartItems().isEmpty()) {
            return ApiResponse.error("Giỏ hàng trống");
        }

        LocalDateTime now = LocalDateTime.now();
        double cartTotal = 0.0;

        for (CartItem item : cart.getCartItems()) {
            Product product = item.getProduct();
            
            double productVoucherDiscount = product.getVouchers().stream()
                .filter(v -> !v.getStartDate().isAfter(now) && !v.getEndDate().isBefore(now))
                .mapToDouble(com.example.backend.entities.Voucher::getDiscountAmount)
                .sum();
            
            double actualProductPrice = product.getPrice() - productVoucherDiscount;
            if (actualProductPrice < 0) actualProductPrice = 0;
            
            cartTotal += (actualProductPrice * item.getQuantity());
        }

        double totalDiscount = 0.0;
        List<Coupon> validCoupons = new ArrayList<>();

        if (request.getCouponCodes() != null && !request.getCouponCodes().isEmpty()) {
            for (String code : request.getCouponCodes()) {
                Coupon coupon = couponRepository.findByCode(code).orElse(null);
                
                if (coupon == null) {
                    return ApiResponse.error("Mã giảm giá " + code + " không tồn tại.");
                }
                if (!coupon.getIsActive() || now.isBefore(coupon.getStartDate()) || now.isAfter(coupon.getEndDate())) {
                    return ApiResponse.error("Mã giảm giá " + code + " không hợp lệ hoặc đã hết hạn.");
                }

                long userUsedCount = orderRepository.countCouponUsageByUser(userId, coupon.getId());
                if (userUsedCount >= coupon.getUsageLimitPerUser()) {
                    return ApiResponse.error("Bạn đã hết lượt sử dụng mã " + code);
                }

                if (coupon.getUsageLimit() > 0 && coupon.getUsedCount() >= coupon.getUsageLimit()) {
                    return ApiResponse.error("Mã giảm giá " + code + " đã được sử dụng hết.");
                }

                if (cartTotal < coupon.getMinOrderValue()) {
                    return ApiResponse.error("Đơn hàng chưa đạt giá trị tối thiểu (" + coupon.getMinOrderValue() + "đ) để dùng mã " + code);
                }

                double discountForThisCoupon = 0.0;
                if (coupon.getDiscountType() == DiscountType.FIXED_AMOUNT) {
                    discountForThisCoupon = coupon.getDiscountValue();
                } else if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
                    discountForThisCoupon = cartTotal * (coupon.getDiscountValue() / 100.0);
                    if (coupon.getMaxDiscountAmount() != null && discountForThisCoupon > coupon.getMaxDiscountAmount()) {
                        discountForThisCoupon = coupon.getMaxDiscountAmount();
                    }
                }

                totalDiscount += discountForThisCoupon;
                validCoupons.add(coupon);
            }
        }

        if (totalDiscount > cartTotal) {
            totalDiscount = cartTotal;
        }

        int pointsToUse = request.getRewardPointsUsed() != null ? request.getRewardPointsUsed() : 0;
        if (pointsToUse > 0) {
            int userPoints = user.getRewardPoints() != null ? user.getRewardPoints() : 0;
            if (pointsToUse > userPoints) {
                return ApiResponse.error("Bạn không có đủ điểm tích lũy.");
            }
            
            double remainingTotal = cartTotal - totalDiscount;
            
            if (remainingTotal <= 0) {
                pointsToUse = 0;
            } else if (pointsToUse > remainingTotal) {
                pointsToUse = (int) remainingTotal;
            }
            
            totalDiscount += pointsToUse;
            user.setRewardPoints(userPoints - pointsToUse);
            userRepository.save(user); 
        }

        double finalPrice = cartTotal - totalDiscount;

        Order order = Order.builder()
                .user(user)
                .orderDate(now)
                .status(OrderStatus.NEW)
                .paymentMethod(PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()))
                .shippingAddress(request.getAddress())
                .shippingPhone(request.getPhone())
                .totalPrice(finalPrice)
                .totalDiscount(totalDiscount)
                .rewardPointsUsed(pointsToUse)
                .appliedCoupons(validCoupons)
                .orderItems(new ArrayList<>())
                .build();

        for (CartItem ci : cart.getCartItems()) {
            Product product = ci.getProduct();
            
            double productVoucherDiscount = product.getVouchers().stream()
                .filter(v -> !v.getStartDate().isAfter(now) && !v.getEndDate().isBefore(now))
                .mapToDouble(com.example.backend.entities.Voucher::getDiscountAmount)
                .sum();
            double actualProductPrice = product.getPrice() - productVoucherDiscount;
            if (actualProductPrice < 0) actualProductPrice = 0;

            OrderItem oi = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(ci.getQuantity())
                    .price(actualProductPrice) 
                    .build();
            order.getOrderItems().add(oi);
        }

        orderRepository.save(order);

        for (Coupon c : validCoupons) {
            c.setUsedCount(c.getUsedCount() + 1);
        }
        if (!validCoupons.isEmpty()) {
            couponRepository.saveAll(validCoupons);
        }

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

    @Transactional
    public ApiResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (newStatus == OrderStatus.DELIVERED && order.getStatus() != OrderStatus.DELIVERED) {
            for (OrderItem item : order.getOrderItems()) {
                Product p = item.getProduct();
                Long currentSold = p.getSoldCount() != null ? p.getSoldCount() : 0L;
                p.setSoldCount(currentSold + item.getQuantity());
                p.setQuantity(p.getQuantity() - item.getQuantity());
                
                productRepository.save(p);
            }
        }

        order.setStatus(newStatus);
        orderRepository.save(order);
        return ApiResponse.success("Cập nhật trạng thái thành công", null);
    }
}