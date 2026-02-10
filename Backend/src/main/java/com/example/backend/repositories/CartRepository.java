package com.example.backend.repositories;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entities.Cart;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUserId(Long userId);
}