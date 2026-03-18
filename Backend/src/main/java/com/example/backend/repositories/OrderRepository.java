package com.example.backend.repositories;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.dto.CashFlowStat;
import com.example.backend.entities.Order;
import com.example.backend.enums.OrderStatus;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);
    List<Order> findByStatus(OrderStatus status);

    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END " +
           "FROM Order o JOIN o.orderItems oi " +
           "WHERE o.user.id = :userId " +
           "AND o.status = 'DELIVERED' " +
           "AND oi.product.id = :productId")
    boolean hasUserPurchasedProduct(@Param("userId") Long userId, @Param("productId") Long productId);

    @Query("SELECT COUNT(o) FROM Order o JOIN o.appliedCoupons c " +
           "WHERE o.user.id = :userId " +
           "AND c.id = :couponId " +
           "AND o.status != 'CANCELLED'")
    long countCouponUsageByUser(@Param("userId") Long userId, @Param("couponId") Long couponId);

    @Query("SELECT new com.example.backend.dto.CashFlowStat(CAST(o.status AS string), SUM(o.totalPrice), COUNT(o)) " +
           "FROM Order o WHERE o.user.id = :userId " +
           "GROUP BY o.status")
    List<CashFlowStat> getCashFlowStatistics(@Param("userId") Long userId);
}