package com.example.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entities.Voucher;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
}