package com.example.backend.dto;
import lombok.Data;

@Data
public class OrderRequest {
    private String address;
    private String phone;
    private String paymentMethod;
}