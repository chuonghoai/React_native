package com.example.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entities.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<Review> findByUserId(Long userId);
}