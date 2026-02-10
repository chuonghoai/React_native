package com.example.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public ApiResponse getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "40") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String order
    ) {
        try {
            return productService.getAllProducts(page, size, sortBy, order); 
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
    public ApiResponse filterProducts(
            @PathVariable List<String> categories,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String order
    ) {
        try {
            return productService.filterProducts(categories, page, size, sortBy, order);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi lọc: " + e.getMessage());
        }
    }

    @GetMapping("/best-sellers")
    public ApiResponse getBestSellers() {
        try {
            return productService.getTop10BestSellers();
        } catch (Exception e) {
            return ApiResponse.error("Lỗi: " + e.getMessage());
        }
    }
}