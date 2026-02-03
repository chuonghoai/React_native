package com.example.backend.dto;

import com.example.backend.entities.Category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductListResponse {
    private Long id;
    private String name;
    private Double price;
    private String imageUrl;
    private Category category;
}