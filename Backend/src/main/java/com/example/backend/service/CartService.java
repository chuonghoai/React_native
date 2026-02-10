package com.example.backend.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.ApiResponse;
import com.example.backend.entities.Cart;
import com.example.backend.entities.CartItem;
import com.example.backend.entities.Product;
import com.example.backend.entities.User;
import com.example.backend.repositories.CartRepository;
import com.example.backend.repositories.ProductRepository;
import com.example.backend.repositories.UserRepository;

@Service
public class CartService {
    @Autowired private CartRepository cartRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private AuthService authService;

    public Cart getMyCart() {
        Long userId = authService.getCurrentUserId();
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElseThrow();
                    Cart newCart = Cart.builder().user(user).build();
                    return cartRepository.save(newCart);
                });
    }

    @Transactional
    public ApiResponse addToCart(Long productId, Integer quantity) {
        Cart cart = getMyCart();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        Optional<CartItem> existingItem = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .build();
            cart.addItem(newItem);
        }
        
        cartRepository.save(cart);
        return ApiResponse.success("Đã thêm vào giỏ", null);
    }
    
    @Transactional
    public ApiResponse removeFromCart(Long productId) {
        Cart cart = getMyCart();
        cart.getCartItems().removeIf(item -> item.getProduct().getId().equals(productId));
        cartRepository.save(cart);
        return ApiResponse.success("Đã xóa sản phẩm", null);
    }
    
    @Transactional
    public ApiResponse updateQuantity(Long productId, Integer quantity) {
        Cart cart = getMyCart();
         cart.getCartItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst()
                .ifPresent(item -> item.setQuantity(quantity));
        cartRepository.save(cart);
        return ApiResponse.success("Cập nhật số lượng thành công", null);
    }
}