package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.JwtUtil;
import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.LoginResponse;
import com.example.backend.dto.UserDto;
import com.example.backend.entities.User;
import com.example.backend.repositories.UserRepository;

@Service
public class AuthAdminService {
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private JavaMailSender mailSender;

    public ApiResponse login(String email, String password) {
        User admin = userRepository.findByEmail(email).orElse(null);
        
        if (admin == null || !passwordEncoder.matches(password, admin.getPassword())) {
            return ApiResponse.error("Sai tài khoản hoặc mật khẩu");
        }
        
        if (!"ADMIN".equals(admin.getRole())) {
            return ApiResponse.error("Tài khoản không có quyền truy cập");
        }

        String token = jwtUtil.generateToken(admin.getId().toString());

        UserDto userDto = UserDto.builder()
                .id(admin.getId())
                .username(admin.getUsername())
                .email(admin.getEmail())
                .build();

        LoginResponse loginResponse = LoginResponse.builder()
                .token(token)
                .user(userDto)
                .build();

        return ApiResponse.success("Đăng nhập thành công", loginResponse);
    }

    public ApiResponse forgotPassword(String email) {
        User admin = userRepository.findByEmail(email).orElse(null);
        if (admin == null || !"ADMIN".equals(admin.getRole())) {
            return ApiResponse.error("Email không tồn tại hoặc không có quyền truy cập");
        }

        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
        admin.setOtpCode(otp);
        admin.setOtpExpiration(LocalDateTime.now().plusMinutes(5));
        userRepository.save(admin);

        sendEmail(email, "Quên mật khẩu Admin", "Mã OTP đặt lại mật khẩu của bạn là: " + otp);
        return ApiResponse.success("Đã gửi OTP đến email.", null);
    }

    public ApiResponse verifyOtp(String email, String otp) {
        User admin = userRepository.findByEmail(email).orElse(null);
        if (admin == null || !"ADMIN".equals(admin.getRole())) {
            return ApiResponse.error("Lỗi hệ thống");
        }

        if (admin.getOtpCode() == null || !otp.equals(admin.getOtpCode()) || LocalDateTime.now().isAfter(admin.getOtpExpiration())) {
            return ApiResponse.error("OTP sai hoặc đã hết hạn");
        }

        return ApiResponse.success("OTP hợp lệ", null);
    }

    public ApiResponse resetPassword(String email, String otp, String newPassword) {
        User admin = userRepository.findByEmail(email).orElse(null);
        if (admin == null || !"ADMIN".equals(admin.getRole())) {
            return ApiResponse.error("Lỗi hệ thống");
        }

        if (admin.getOtpCode() == null || !otp.equals(admin.getOtpCode()) || LocalDateTime.now().isAfter(admin.getOtpExpiration())) {
            return ApiResponse.error("OTP sai hoặc đã hết hạn");
        }

        admin.setPassword(passwordEncoder.encode(newPassword));
        admin.setOtpCode(null);
        admin.setOtpExpiration(null);
        userRepository.save(admin);

        return ApiResponse.success("Đổi mật khẩu thành công.", null);
    }

    private void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
