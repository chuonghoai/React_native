package com.example.backend.controller.Admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.ForgotPasswordRequest;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.ResetPasswordRequest;
import com.example.backend.dto.VerifyOtpRequest;
import com.example.backend.service.AuthAdminService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/auth")
@CrossOrigin
public class AdminAuthController {

    @Autowired
    private AuthAdminService authAdminService;

    @PostMapping("/login")
    public ApiResponse login(@Valid @RequestBody LoginRequest request) {
        System.out.println("Login request: " + request.getUsername() + " " + request.getPassword());
        return authAdminService.login(request.getUsername(), request.getPassword());
    }

    @PostMapping("/forgot-password")
    public ApiResponse forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return authAdminService.forgotPassword(request.getEmail());
    }

    @PostMapping("/verify-otp")
    public ApiResponse verifyOtp(@RequestBody VerifyOtpRequest request) {
        return authAdminService.verifyOtp(request.getEmail(), request.getOtp());
    }

    @PostMapping("/reset-password")
    public ApiResponse resetPassword(@RequestBody ResetPasswordRequest request) {
        return authAdminService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
    }
}
