package com.example.backend.service.Admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dto.AdminProductRequest;
import com.example.backend.dto.AdminProductResponse;
import com.example.backend.dto.ApiResponse;
import com.example.backend.entities.Category;
import com.example.backend.entities.Product;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.ProductRepository;

@Service
public class AdminProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

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

    public ApiResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        return ApiResponse.success("Lấy thông tin sản phẩm thành công", mapToResponse(product));
    }

    public ApiResponse updateProduct(Long id, AdminProductRequest request) {
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

    public ApiResponse deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        productRepository.delete(product);
        return ApiResponse.success("Xóa sản phẩm thành công", null);
    }
}