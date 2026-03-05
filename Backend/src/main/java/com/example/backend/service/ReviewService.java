package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.ReviewRequest;
import com.example.backend.dto.ReviewResponse;
import com.example.backend.entities.Product;
import com.example.backend.entities.Review;
import com.example.backend.entities.User;
import com.example.backend.repositories.OrderRepository;
import com.example.backend.repositories.ProductRepository;
import com.example.backend.repositories.ReviewRepository;
import com.example.backend.repositories.UserRepository;

@Service
public class ReviewService {

    @Autowired private ReviewRepository reviewRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private AuthService authService;

    private static final int POINTS_PER_REVIEW = 100; 

    @Transactional
    public ApiResponse addReview(ReviewRequest request) {
        Long userId = authService.getCurrentUserId();

        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            return ApiResponse.error("Số sao đánh giá không hợp lệ (1-5).");
        }

        if (!orderRepository.hasUserPurchasedProduct(userId, request.getProductId())) {
            return ApiResponse.error("Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng thành công.");
        }

        if (reviewRepository.existsByUserIdAndProductId(userId, request.getProductId())) {
            return ApiResponse.error("Bạn đã đánh giá sản phẩm này rồi.");
        }

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Lỗi xác thực người dùng"));
        Product product = productRepository.findById(request.getProductId()).orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        Review review = Review.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .createdAt(LocalDateTime.now())
                .user(user)
                .product(product)
                .build();
        reviewRepository.save(review);

        int currentPoints = user.getRewardPoints() != null ? user.getRewardPoints() : 0;
        user.setRewardPoints(currentPoints + POINTS_PER_REVIEW);
        userRepository.save(user);

        return ApiResponse.success("Đánh giá thành công! Bạn được cộng " + POINTS_PER_REVIEW + " điểm tích lũy.", null);
    }

    public ApiResponse getProductReviews(Long productId) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        
        List<ReviewResponse> responseList = reviews.stream().map(r -> 
            ReviewResponse.builder()
                .id(r.getId())
                .fullname(r.getUser().getFullname() != null ? r.getUser().getFullname() : r.getUser().getUsername())
                .avatarUrl(r.getUser().getAvatarUrl())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build()
        ).collect(Collectors.toList());

        return ApiResponse.success("Lấy danh sách đánh giá thành công", responseList);
    }
}