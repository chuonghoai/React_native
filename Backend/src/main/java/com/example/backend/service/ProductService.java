package com.example.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.ProductListResponse;
import com.example.backend.entities.Product;
import com.example.backend.repositories.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public ApiResponse getAllProducts() {
        List<Product> products = productRepository.findAll();
        
        List<ProductListResponse> responseList = products.stream()
            .map(p -> ProductListResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .price(p.getPrice())
                .imageUrl(p.getImageUrl())
                .category(p.getCategory())
                .build())
            .collect(Collectors.toList());

        return ApiResponse.success("Lấy danh sách sản phẩm thành công", responseList);
    }

    public ApiResponse getProductDetail(Long id) {
        Product product = productRepository.findById(id).orElse(null);
        
        if (product == null) {
            return ApiResponse.error("Không tìm thấy sản phẩm với ID: " + id);
        }

        return ApiResponse.success("Lấy chi tiết sản phẩm thành công", product);
    }
    
    public ApiResponse createProduct(Product product) {
        Product savedProduct = productRepository.save(product);
        return ApiResponse.success("Thêm sản phẩm thành công", savedProduct);
    }

    private List<ProductListResponse> mapToDto(List<Product> products) {
        return products.stream()
            .map(p -> ProductListResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .price(p.getPrice())
                .imageUrl(p.getImageUrl())
                .category(p.getCategory())
                .build())
            .collect(Collectors.toList());
    }

    public ApiResponse searchProducts(String keyword) {
        List<Product> products = productRepository.findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(keyword, keyword);
        return ApiResponse.success("Tìm thấy " + products.size() + " kết quả", mapToDto(products));
    }

    public ApiResponse filterProducts(List<String> categories) {
        List<Product> products = productRepository.findByCategoryIn(categories);
        return ApiResponse.success("Lọc thành công", mapToDto(products));
    }
}