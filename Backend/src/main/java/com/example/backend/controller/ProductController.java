package com.example.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ApiResponse;
import com.example.backend.entities.Product;
import com.example.backend.service.ProductService;

@RestController
@RequestMapping("/products")
@CrossOrigin
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ApiResponse getAllProducts() {
        try {
            return productService.getAllProducts();
        } catch (Exception e) {
            return ApiResponse.error("Lỗi: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ApiResponse getProductDetail(@PathVariable Long id) {
        try {
            return productService.getProductDetail(id);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi: " + e.getMessage());
        }
    }
    
    @PostMapping
    public ApiResponse createProduct(@RequestBody Product product) {
         try {
            return productService.createProduct(product);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi: " + e.getMessage());
        }
    }

    @GetMapping("/search/{keyword}")
    public ApiResponse searchProducts(@PathVariable String keyword) {
        try {
            return productService.searchProducts(keyword);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi tìm kiếm: " + e.getMessage());
        }
    }

    @GetMapping("/category/{categories}")
    public ApiResponse filterProducts(@PathVariable List<String> categories) {
        try {
            return productService.filterProducts(categories);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi lọc: " + e.getMessage());
        }
    }
}