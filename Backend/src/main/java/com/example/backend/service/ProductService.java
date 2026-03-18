package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.controller.AuthController;
import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.ProductListResponse;
import com.example.backend.entities.Product;
import com.example.backend.entities.Voucher;
import com.example.backend.repositories.FavoriteRepository;
import com.example.backend.repositories.ProductRepository;
import com.example.backend.repositories.ReviewRepository;

@Service
public class ProductService {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired private ProductRepository productRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private FavoriteRepository favoriteRepository;
    @Autowired private AuthService authService;

    @Transactional(readOnly = true)
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

        long reviewCount = reviewRepository.countByProductId(id);

        boolean isFavorite = false;
        try {
            Long currentUserId = authService.getCurrentUserId();
            isFavorite = favoriteRepository.existsByUserIdAndProductId(currentUserId, id);
        } catch (Exception e) {
        }

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("id", product.getId());
        responseData.put("name", product.getName());
        responseData.put("price", finalPrice);
        responseData.put("originalPrice", product.getPrice());
        responseData.put("description", product.getDescription());
        responseData.put("imageUrl", product.getImageUrl());
        responseData.put("quantity", product.getQuantity());
        responseData.put("category", product.getCategory());
        responseData.put("soldCount", product.getSoldCount()); 
        responseData.put("reviewCount", reviewCount);
        responseData.put("isFavorite", isFavorite);

        return ApiResponse.success("Lấy chi tiết sản phẩm thành công", responseData);
    }
    
    public ApiResponse createProduct(Product product) {
        Product savedProduct = productRepository.save(product);
        return ApiResponse.success("Thêm sản phẩm thành công", savedProduct);
    }

    private List<ProductListResponse> mapToDto(List<Product> products) {
        LocalDateTime now = LocalDateTime.now();
        return products.stream()
            .map(p -> {
                double totalDiscount = p.getVouchers().stream()
                    .filter(v -> !v.getStartDate().isAfter(now) && !v.getEndDate().isBefore(now))
                    .mapToDouble(Voucher::getDiscountAmount)
                    .sum();
                
                double finalPrice = p.getPrice() - totalDiscount;
                if (finalPrice < 0) finalPrice = 0;

                return ProductListResponse.builder()
                    .id(p.getId())
                    .name(p.getName())
                    .price(finalPrice)
                    .imageUrl(p.getImageUrl())
                    .category(p.getCategory())
                    .build();
            })
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApiResponse searchProducts(String keyword) {
        List<Product> products = 
            productRepository
            .findByNameContainingIgnoreCaseOrCategory_NameContainingIgnoreCase(keyword, keyword);
        logger.info("Tìm thấy sản phẩm");
        return ApiResponse.success("Tìm thấy " + products.size() + " kết quả", mapToDto(products));
    }

    @Transactional(readOnly = true)
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

    @Transactional(readOnly = true)
    public ApiResponse getTop10BestSellers() {
        List<Product> products = productRepository.findTop10BestSellers(PageRequest.of(0, 10));
        
        return ApiResponse.success("Lấy top 10 bán chạy thành công", mapToDto(products));
    }

    @Transactional(readOnly = true)
    public ApiResponse getSimilarProducts(Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) return ApiResponse.error("Không tìm thấy sản phẩm");

        List<Product> similarProducts = productRepository
                .findTop10ByCategoryIdAndIdNot(product.getCategory().getId(), id);
                
        return ApiResponse.success("Sản phẩm tương tự", mapToDto(similarProducts));
    }
}