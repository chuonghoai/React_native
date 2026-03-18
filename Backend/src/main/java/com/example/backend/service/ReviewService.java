package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
    @Autowired private SimpMessagingTemplate messagingTemplate;

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

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Lỗi xác thực người dùng"));
        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

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

        ReviewResponse reviewResponse = mapToReviewResponse(review);
        messagingTemplate.convertAndSend("/topic/reviews/product/" + request.getProductId(), reviewResponse);

        return ApiResponse.success(
            "Đánh giá thành công! Bạn được cộng " + POINTS_PER_REVIEW + " điểm tích lũy.",
            reviewResponse
        );
    }

    public ApiResponse getProductReviews(Long productId, int page, int size) {
        Page<Review> reviewPage = reviewRepository.findByProductIdOrderByCreatedAtDesc(
            productId,
            PageRequest.of(page, size)
        );

        List<ReviewResponse> responseList = reviewPage.getContent().stream()
            .map(this::mapToReviewResponse)
            .collect(Collectors.toList());

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("content", responseList);
        metadata.put("page", reviewPage.getNumber());
        metadata.put("totalPages", reviewPage.getTotalPages());
        metadata.put("totalElements", reviewPage.getTotalElements());

        return ApiResponse.success("Lấy danh sách đánh giá thành công", metadata);
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        return ReviewResponse.builder()
            .id(review.getId())
            .fullname(review.getUser().getFullname() != null
                ? review.getUser().getFullname()
                : review.getUser().getUsername())
            .avatarUrl(review.getUser().getAvatarUrl())
            .rating(review.getRating())
            .comment(review.getComment())
            .createdAt(review.getCreatedAt())
            .build();
    }
}
