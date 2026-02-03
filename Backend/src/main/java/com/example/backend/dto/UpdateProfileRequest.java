package com.example.backend.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String fullname;
    private String phone;
    private String avatarUrl;
}