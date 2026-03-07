package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.CartRequest;
import com.example.backend.service.CartService;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    @Autowired private CartService cartService;

    @GetMapping
    public ApiResponse getCart() {
        return cartService.getCartResponse();
    }

    @PostMapping("/add")
    public ApiResponse addToCart(@RequestBody CartRequest request) {
        return cartService.addToCart(request.getProductId(), request.getQuantity());
    }
    
    @PostMapping("/remove")
    public ApiResponse removeFromCart(@RequestBody CartRequest request) {
        return cartService.removeFromCart(request.getProductId());
    }

    @PostMapping("/update")
    public ApiResponse updateQuantity(@RequestBody CartRequest request) {
        return cartService.updateQuantity(request.getProductId(), request.getQuantity());
    }
}