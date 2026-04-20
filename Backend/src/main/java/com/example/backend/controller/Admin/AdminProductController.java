package com.example.backend.controller.Admin;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.AdminProductRequest;
import com.example.backend.dto.AdminProductResponse;
import com.example.backend.dto.ApiResponse;
import com.example.backend.entities.Product;
import com.example.backend.entities.Voucher;
import com.example.backend.repositories.ProductRepository;
import com.example.backend.service.Admin.AdminProductService;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin
public class AdminProductController {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private AdminProductService adminProductService;

    @GetMapping
    public ApiResponse getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "40") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String order) {
        try {
            Sort.Direction direction = order.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
            PageRequest pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

            Page<Product> productPage = productRepository.findAllWithCategory(pageable);

            List<AdminProductResponse> responseList = mapToAdminDto(productPage.getContent());

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("content", responseList);
            metadata.put("page", productPage.getNumber());
            metadata.put("size", productPage.getSize());
            metadata.put("totalElements", productPage.getTotalElements());
            metadata.put("totalPages", productPage.getTotalPages());

            return ApiResponse.success("Lấy danh sách sản phẩm thành công", metadata);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi: " + e.getMessage());
        }
    }

    @PostMapping
    public ApiResponse createProduct(@RequestBody AdminProductRequest request) {
        return adminProductService.createProduct(request);
    }

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ApiResponse createProductWithImage(
            @RequestPart("product") String productJson,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        return adminProductService.createProductWithImage(productJson, image);
    }

    @GetMapping("/{id}")
    public ApiResponse getProductDetail(@PathVariable Long id) {
        return adminProductService.getProductById(id);
    }

    @PatchMapping("/{id}")
    public ApiResponse updateProduct(
            @PathVariable Long id,
            @RequestBody AdminProductRequest request) {
        try {
            return adminProductService.updateProduct(id, request);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse deleteProduct(@PathVariable Long id) {
        return adminProductService.deleteProduct(id);
    }

    @PostMapping(value = "/{id}/image", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ApiResponse uploadProductImage(
            @PathVariable Long id,
            @RequestPart("image") MultipartFile image) throws IOException {
        return adminProductService.uploadImage(id, image);
    }

    private List<AdminProductResponse> mapToAdminDto(List<Product> products) {
        LocalDateTime now = LocalDateTime.now();
        return products.stream()
                .map(p -> {
                    double totalDiscount = p.getVouchers() != null
                            ? p.getVouchers().stream()
                                    .filter(v -> !v.getStartDate().isAfter(now) && !v.getEndDate().isBefore(now))
                                    .mapToDouble(Voucher::getDiscountAmount)
                                    .sum()
                            : 0.0;

                    double finalPrice = p.getPrice() - totalDiscount;
                    if (finalPrice < 0)
                        finalPrice = 0;

                    return AdminProductResponse.builder()
                            .id(p.getId())
                            .name(p.getName())
                            .price(finalPrice)
                            .imageUrl(p.getImageUrl())
                            .description(p.getDescription())
                            .quantity(p.getQuantity())
                            .soldCount(p.getSoldCount())
                            .category(p.getCategory())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
