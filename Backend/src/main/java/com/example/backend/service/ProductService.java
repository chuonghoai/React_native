package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.ProductListResponse;
import com.example.backend.entities.Product;
import com.example.backend.entities.Voucher;
import com.example.backend.repositories.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public ApiResponse getAllProducts(int page, int size, String sortBy, String order) {
        Sort.Direction direction = order.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        
        PageRequest pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<Product> productPage = productRepository.findAllWithCategory(pageable);
        
        List<ProductListResponse> responseList = mapToDto(productPage.getContent());

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("content", responseList);
        metadata.put("page", productPage.getNumber());
        metadata.put("size", productPage.getSize());
        metadata.put("totalElements", productPage.getTotalElements());
        metadata.put("totalPages", productPage.getTotalPages());

        return ApiResponse.success("Lấy danh sách thành công", metadata);
    }

    @Transactional(readOnly = true)
    public ApiResponse getProductDetail(Long id) {
        Product product = productRepository.findById(id).orElse(null);
        
        if (product == null) {
            return ApiResponse.error("Không tìm thấy sản phẩm với ID: " + id);
        }

        LocalDateTime now = LocalDateTime.now();
        double totalDiscount = product.getVouchers().stream()
                .filter(v -> !v.getStartDate().isAfter(now) && !v.getEndDate().isBefore(now))
                .mapToDouble(Voucher::getDiscountAmount)
                .sum();

        double finalPrice = product.getPrice() - totalDiscount;
        finalPrice = finalPrice < 0 ? 0 : finalPrice;

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("id", product.getId());
        responseData.put("name", product.getName());
        responseData.put("price", finalPrice);
        responseData.put("originalPrice", product.getPrice());
        responseData.put("description", product.getDescription());
        responseData.put("imageUrl", product.getImageUrl());
        responseData.put("quantity", product.getQuantity());
        responseData.put("category", product.getCategory());

        return ApiResponse.success("Lấy chi tiết sản phẩm thành công", responseData);
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
        List<Product> products = 
            productRepository
            .findByNameContainingIgnoreCaseOrCategory_NameContainingIgnoreCase(keyword, keyword);
        return ApiResponse.success("Tìm thấy " + products.size() + " kết quả", mapToDto(products));
    }

    public ApiResponse filterProducts(List<String> categories, int page, int size, String sortBy, String order) {
        Sort.Direction direction = order.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<Product> productPage = productRepository.findByCategory_NameIn(categories, pageable);
        
        List<ProductListResponse> responseList = mapToDto(productPage.getContent());

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("content", responseList);
        metadata.put("page", productPage.getNumber());
        metadata.put("size", productPage.getSize());
        metadata.put("totalElements", productPage.getTotalElements());
        metadata.put("totalPages", productPage.getTotalPages());

        return ApiResponse.success("Lọc thành công", metadata);
    }

    public ApiResponse getTop10BestSellers() {
        List<Product> products = productRepository.findTop10BestSellers(PageRequest.of(0, 10));
        
        return ApiResponse.success("Lấy top 10 bán chạy thành công", mapToDto(products));
    }
}