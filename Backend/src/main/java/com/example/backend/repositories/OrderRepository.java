package com.example.backend.repositories;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entities.Order;
import com.example.backend.enums.OrderStatus;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);
    List<Order> findByStatus(OrderStatus status);
}