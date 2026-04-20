package com.example.backend.service.Admin;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;


import com.example.backend.dto.AdminProductRequest;
import com.example.backend.dto.AdminProductResponse;
import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.ReviewResponse;
import com.example.backend.entities.Category;
import com.example.backend.entities.Product;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.ProductRepository;
import com.example.backend.repositories.ReviewRepository;

import java.util.List;
import java.util.stream.Collectors;


@Service
public class AdminProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ObjectMapper objectMapper;



    private AdminProductResponse mapToResponse(Product product) {
        AdminProductResponse response = new AdminProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setPrice(product.getPrice());
        response.setDescription(product.getDescription());
        response.setImageUrl(product.getImageUrl());
        response.setQuantity(product.getQuantity());
        response.setSoldCount(product.getSoldCount());
        response.setCategory(product.getCategory());
        List<ReviewResponse> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(product.getId())
                .stream()
                .map(review -> ReviewResponse.builder()
                        .id(review.getId())
                        .fullname(review.getUser() != null ? review.getUser().getFullname() : "Anonymous")
                        .avatarUrl(review.getUser() != null ? review.getUser().getAvatarUrl() : null)
                        .rating(review.getRating())
                        .comment(review.getComment())
                        .createdAt(review.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        response.setReviews(reviews);

        return response;
    }

    public ApiResponse createProduct(AdminProductRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());
        product.setQuantity(request.getQuantity());
        product.setSoldCount(0L);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
            product.setCategory(category);
        }

        Product savedProduct = productRepository.save(product);
        return ApiResponse.success("Tạo sản phẩm thành công", mapToResponse(savedProduct));
    }

    public ApiResponse createProductWithImage(String productJson, MultipartFile image) throws IOException {
        AdminProductRequest request = objectMapper.readValue(productJson, AdminProductRequest.class);
        
        if (image != null && !image.isEmpty()) {
            String imageUrl = handleSaveImage(image);
            request.setImageUrl(imageUrl);
        }
        
        return createProduct(request);
    }

    private String handleSaveImage(MultipartFile image) throws IOException {
        String uploadDir = "uploads/";
        File dir = new File(uploadDir);
        if (!dir.exists())
            dir.mkdirs();

        String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
        Path filePath = Paths.get(uploadDir + fileName);
        Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + fileName;
    }


    public ApiResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        return ApiResponse.success("Lấy thông tin sản phẩm thành công", mapToResponse(product));
    }

    public ApiResponse updateProduct(Long id, AdminProductRequest request)
            throws IOException {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        if (request.getName() != null)
            product.setName(request.getName());
        if (request.getPrice() != null)
            product.setPrice(request.getPrice());
        if (request.getDescription() != null)
            product.setDescription(request.getDescription());
        if (request.getImageUrl() != null)
            product.setImageUrl(request.getImageUrl());
        if (request.getQuantity() != null)
            product.setQuantity(request.getQuantity());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
            product.setCategory(category);
        }

        Product updatedProduct = productRepository.save(product);
        return ApiResponse.success("Cập nhật sản phẩm thành công", mapToResponse(updatedProduct));
    }

    public ApiResponse uploadImage(Long id, MultipartFile image) throws IOException {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        String imageUrl = handleSaveImage(image);
        product.setImageUrl(imageUrl);
        productRepository.save(product);

        return ApiResponse.success("Upload ảnh thành công", imageUrl);
    }

    public ApiResponse deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        productRepository.delete(product);
        return ApiResponse.success("Xóa sản phẩm thành công", null);
    }
}