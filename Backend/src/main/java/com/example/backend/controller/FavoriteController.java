package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ApiResponse;
import com.example.backend.service.FavoriteService;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin
public class FavoriteController {
    @Autowired private FavoriteService favoriteService;

    @PostMapping("/toggle/{productId}")
    public ApiResponse toggleFavorite(@PathVariable Long productId) {
        return favoriteService.toggleFavorite(productId);
    }

    @GetMapping
    public ApiResponse getMyFavorites() {
        return favoriteService.getMyFavorites();
    }
}