package com.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Username không được để trống")
    private String username;

    private String password;

    @Email(message = "Email không đúng định dạng")
    private String email;
}