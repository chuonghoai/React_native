package com.example.backend.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entities.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingIgnoreCaseOrCategory_NameContainingIgnoreCase(String name, String categoryName);

    @Query("SELECT p FROM Product p WHERE p.category.name IN :categories")
    Page<Product> findByCategory_NameIn(@Param("categories") List<String> categories, Pageable pageable);

    @Query("SELECT p FROM OrderItem oi JOIN oi.product p " +
           "GROUP BY p.id, p.name, p.price, p.imageUrl, p.description, p.quantity, p.category " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Product> findTop10BestSellers(Pageable pageable);

    @Query(
        value = "SELECT p FROM Product p JOIN FETCH p.category",
        countQuery = "SELECT COUNT(p) FROM Product p"
    )
    Page<Product> findAllWithCategory(Pageable pageable);

    @Query("SELECT p, SUM(v.discountAmount) " +
           "FROM Product p JOIN p.vouchers v " +
           "WHERE v.startDate <= :now AND v.endDate >= :now " +
           "GROUP BY p")
    Page<Object[]> findProductsWithTotalDiscount(LocalDateTime now, Pageable pageable);

    @Query("SELECT p, SUM(v.discountAmount) " +
           "FROM Product p JOIN p.vouchers v " +
           "WHERE v.startDate <= :now AND v.endDate >= :now " +
           "GROUP BY p " +
           "ORDER BY (p.price - SUM(v.discountAmount)) ASC")
    Page<Object[]> findDiscountedProductsSortedByPriceAsc(LocalDateTime now, Pageable pageable);

    @Query("SELECT p, SUM(v.discountAmount) " +
           "FROM Product p JOIN p.vouchers v " +
           "WHERE v.startDate <= :now AND v.endDate >= :now " +
           "GROUP BY p " +
           "ORDER BY (p.price - SUM(v.discountAmount)) DESC")
    Page<Object[]> findDiscountedProductsSortedByPriceDesc(LocalDateTime now, Pageable pageable);
}