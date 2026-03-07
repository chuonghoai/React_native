package com.example.backend.dto;
import java.util.List;

import lombok.Data;

@Data
public class OrderRequest {
    private String address;
    private String phone;
    private String paymentMethod;
    private List<String> couponCodes;
    private Integer rewardPointsUsed;
}