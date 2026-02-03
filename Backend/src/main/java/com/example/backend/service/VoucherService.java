package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.ProductDiscountResponse;
import com.example.backend.entities.Product;
import com.example.backend.repositories.ProductRepository;

@Service
public class VoucherService {

    @Autowired
    private ProductRepository productRepository;

    public ApiResponse getDiscountedProducts(int page, int size, String sortBy, String order) {
        LocalDateTime now = LocalDateTime.now();
        Page<Object[]> resultPage;

        if ("priceAfterDiscount".equals(sortBy)) {
            PageRequest pageable = PageRequest.of(page, size);
            
            if ("desc".equalsIgnoreCase(order)) {
                 resultPage = productRepository.findDiscountedProductsSortedByPriceDesc(now, pageable);
            } else {
                 resultPage = productRepository.findDiscountedProductsSortedByPriceAsc(now, pageable);
            }
        } else {
            Sort.Direction direction = order.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
            PageRequest pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            resultPage = productRepository.findProductsWithTotalDiscount(now, pageable);
        }

        List<ProductDiscountResponse> responseList = new ArrayList<>();

        for (Object[] row : resultPage.getContent()) {
            Product p = (Product) row[0];
            Double totalDiscount = (Double) row[1];

            responseList.add(new ProductDiscountResponse(
                p.getId(),
                p.getName(),
                p.getPrice(),
                p.getImageUrl(),
                p.getCategory(),
                totalDiscount
            ));
        }

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("content", responseList);
        metadata.put("page", resultPage.getNumber());
        metadata.put("size", resultPage.getSize());
        metadata.put("totalElements", resultPage.getTotalElements());
        metadata.put("totalPages", resultPage.getTotalPages());

        return ApiResponse.success("Lấy danh sách sản phẩm giảm giá thành công", metadata);
    }
}