package com.example.backend.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.backend.entities.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingIgnoreCaseOrCategory_NameContainingIgnoreCase(String name, String categoryName);
    List<Product> findByCategory_NameIn(List<String> categories);

    @Query("SELECT p FROM OrderItem oi JOIN oi.product p " +
           "GROUP BY p.id, p.name, p.price, p.imageUrl, p.description, p.quantity, p.category " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Product> findTop10BestSellers(org.springframework.data.domain.Pageable pageable);

    @Query(
        value = "SELECT p FROM Product p JOIN FETCH p.category",
        countQuery = "SELECT COUNT(p) FROM Product p"
    )
    Page<Product> findAllWithCategory(Pageable pageable);
}