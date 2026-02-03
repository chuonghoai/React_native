package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.ChangePasswordRequest;
import com.example.backend.dto.ForgotPasswordRequest;
import com.example.backend.dto.UpdateProfileRequest;
import com.example.backend.dto.VerifyChangeEmailRequest;
import com.example.backend.service.AuthService;

@RestController
@RequestMapping("/api/user")
@CrossOrigin
public class UserController {
    
    @Autowired private AuthService authService;

    @PostMapping("/update-profile")
    public ApiResponse updateProfile(@RequestBody UpdateProfileRequest request) {
        try {
            return authService.updateProfile(request);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi: " + e.getMessage());
        }
    }

    @PostMapping("/change-password")
    public ApiResponse changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            return authService.changePassword(request);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi: " + e.getMessage());
        }
    }

    @PostMapping("/request-change-email")
    public ApiResponse requestChangeEmail(@RequestBody ForgotPasswordRequest request) {
        try {
            return authService.requestChangeEmail(request.getEmail());
        } catch (Exception e) {
            return ApiResponse.error("Lỗi: " + e.getMessage());
        }
    }

    @PostMapping("/verify-change-email")
    public ApiResponse verifyChangeEmail(@RequestBody VerifyChangeEmailRequest request) {
        try {
            return authService.verifyChangeEmail(request);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi: " + e.getMessage());
        }
    }
}