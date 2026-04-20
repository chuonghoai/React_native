package com.example.backend.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

@Data
public class VoucherRequest {
    private String name;
    private Double discountAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private List<Long> productIds;
}