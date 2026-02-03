package com.example.backend.dto;

import com.example.backend.entities.Category;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDiscountResponse extends ProductListResponse {
    private Double priceAfterDiscount;
    private Double totalDiscountAmount;

    public ProductDiscountResponse(Long id, String name, Double price, String imageUrl, Category category, Double totalDiscountAmount) {
        super(id, name, price, imageUrl, category);
        this.totalDiscountAmount = totalDiscountAmount;
        
        double finalPrice = price - totalDiscountAmount;
        this.priceAfterDiscount = finalPrice < 0 ? 0 : finalPrice;
    }
}