package com.example.backend.dto;

import java.util.List;

import com.example.backend.entities.Category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminProductResponse {
    private Long id;
    private String name;
    private Double price;
    private String imageUrl;
    private String description;
    private Long quantity;
    private Long soldCount;
    private Category category;
    private List<ReviewResponse> reviews;
}
