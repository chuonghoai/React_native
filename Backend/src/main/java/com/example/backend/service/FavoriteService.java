package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.ProductListResponse;
import com.example.backend.entities.Favorite;
import com.example.backend.entities.Product;
import com.example.backend.entities.User;
import com.example.backend.repositories.FavoriteRepository;
import com.example.backend.repositories.ProductRepository;
import com.example.backend.repositories.UserRepository;

@Service
public class FavoriteService {

    @Autowired private FavoriteRepository favoriteRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private AuthService authService;

    @Transactional
    public ApiResponse toggleFavorite(Long productId) {
        Long userId = authService.getCurrentUserId();
        
        if (favoriteRepository.existsByUserIdAndProductId(userId, productId)) {
            favoriteRepository.deleteByUserIdAndProductId(userId, productId);
            return ApiResponse.success("Đã bỏ yêu thích", false);
        } else {
            User user = userRepository.findById(userId).orElseThrow();
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
            
            Favorite fav = Favorite.builder()
                    .user(user).product(product).createdAt(LocalDateTime.now()).build();
            favoriteRepository.save(fav);
            return ApiResponse.success("Đã thêm vào yêu thích", true);
        }
    }

    public ApiResponse getMyFavorites() {
        Long userId = authService.getCurrentUserId();
        List<Favorite> favorites = favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        List<ProductListResponse> response = favorites.stream().map(f -> {
            Product p = f.getProduct();
            return new ProductListResponse(p.getId(), p.getName(), p.getPrice(), p.getImageUrl(), p.getCategory());
        }).collect(Collectors.toList());

        return ApiResponse.success("Danh sách yêu thích", response);
    }
}