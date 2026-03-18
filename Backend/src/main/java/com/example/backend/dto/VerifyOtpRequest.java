package com.example.backend.dto;

import lombok.Data;

@Data
public class VerifyOtpRequest {
    private String email;
    private String otp;
    private String fullname;
    private String phone;
    private String avatarUrl;
}
