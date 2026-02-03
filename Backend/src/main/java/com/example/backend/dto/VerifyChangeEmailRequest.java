package com.example.backend.dto;

import lombok.Data;

@Data
public class VerifyChangeEmailRequest {
    private String newEmail;
    private String otp;
}