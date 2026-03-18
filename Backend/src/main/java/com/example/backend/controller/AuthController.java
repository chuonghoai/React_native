package com.example.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.ForgotPasswordRequest;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.dto.ResetPasswordRequest;
import com.example.backend.dto.VerifyOtpRequest;
import com.example.backend.service.AuthService;
import com.example.backend.service.RateLimitingService;

import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired private AuthService authService;
    @Autowired private RateLimitingService rateLimitingService;

    // API 1: Đăng ký
    @PostMapping("/register")
    public ApiResponse register(@Valid @RequestBody RegisterRequest request) {
        logger.info("Dang ky tai khoan: " + request.getEmail());
        System.out.println("Dang ky tai khoan: " + request.getEmail());
        try {
            return authService.register(request.getUsername(), request.getPassword(), request.getEmail());
        } catch (Exception e) {
            return ApiResponse.error("Lỗi Server: " + e.getMessage());
        }
    }

    // API 2: Kích hoạt OTP
    @PostMapping("/verify-otp")
    public ApiResponse verifyOtp(@RequestBody VerifyOtpRequest request) {
        try {
            return authService.verifyAccount(request);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi Server: " + e.getMessage());
        }
    }

    // API 3: Đăng nhập
    @PostMapping("/login")
    public ApiResponse login(@RequestBody LoginRequest request, HttpServletRequest servletRequest) { 
        String clientIp = servletRequest.getRemoteAddr();
        Bucket bucket = rateLimitingService.resolveBucket(clientIp);
        logger.info("Nhan yeu cau dang nhap: " + request.getUsername() + " - " + request.getPassword());

        if (bucket.tryConsume(1)) {
            try {
                return authService.login(request.getUsername(), request.getPassword());
            } catch (Exception e) {
                return ApiResponse.error("Lỗi: " + e.getMessage());
            }
        } else {
            return ApiResponse.error("Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.");
        }
    }

    // API 4: Quên mật khẩu
    @PostMapping("/forgot-password")
    public ApiResponse forgotPassword(@RequestBody ForgotPasswordRequest request) { 
        return authService.forgotPassword(request.getEmail());
    }

    // API 5: Reset mật khẩu
    @PostMapping("/reset-password")
    public ApiResponse resetPassword(@RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
    }

    // API 6: Đăng xuất
    @PostMapping("/logout")
    public ApiResponse logout() {
        return ApiResponse.success("Đăng xuất thành công", null);
    }

    // API 7: Đổi tên
    @PostMapping("/fullname")
    public ApiResponse changeFullname(@RequestBody String fullname, Long userId) {
        try {
            return authService.changeFullname(userId, fullname);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi: " + e.getMessage());
        }
    }

    // API 8: Load user data
    @GetMapping("/me/get")
    public ApiResponse getMethodName() {
        try {
            return authService.getMe();
        } catch (Exception e) {
            return ApiResponse.error("Lỗi: "+ e.getMessage());
        }
    }
}
