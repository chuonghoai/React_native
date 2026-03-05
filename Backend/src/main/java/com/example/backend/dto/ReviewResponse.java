package com.example.backend.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private String fullname;
    private String avatarUrl;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}