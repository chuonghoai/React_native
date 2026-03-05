package com.example.backend.dto;

import com.example.backend.entities.Product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemResponse {
    private Long id;
    private Integer quantity;
    private Double price;
    private Product product;
    private ReviewDto review;
}