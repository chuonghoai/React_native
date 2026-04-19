package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminProductRequest {
    private String name;
    private Double price;
    private Double originalPrice;
    private String description;
    private String imageUrl;
    private Long quantity;
    private Long categoryId;
}