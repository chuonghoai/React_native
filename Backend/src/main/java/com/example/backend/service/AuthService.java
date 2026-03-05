package com.example.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.JwtUtil;
import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.ChangePasswordRequest;
import com.example.backend.dto.LoginResponse;
import com.example.backend.dto.UpdateProfileRequest;
import com.example.backend.dto.UserDto;
import com.example.backend.dto.UserMeResponse;
import com.example.backend.dto.VerifyChangeEmailRequest;
import com.example.backend.entities.Category;
import com.example.backend.entities.User;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.UserRepository;


@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private JavaMailSender mailSender;

    public ApiResponse register(String username, String password, String email) {
        if (userRepository.existsByUsername(username)) return ApiResponse.error("Username đã tồn tại");
        if (userRepository.existsByEmail(email)) return ApiResponse.error("Email đã tồn tại");

        String otp = String.valueOf(new Random().nextInt(900000) + 100000);

        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .email(email)
                .otpCode(otp)
                .otpExpiration(LocalDateTime.now().plusMinutes(5))
                .role("CLIENT")
                .fullname(username)
                .phone("")
                .avatarUrl("")
                .build();

        userRepository.save(user);
        sendEmail(email, "Mã kích hoạt tài khoản", "Mã OTP của bạn là: " + otp);

        return ApiResponse.success("Đăng ký thành công. Vui lòng kiểm tra email để lấy OTP.", null);
    }

    public ApiResponse verifyAccount(String email, String otp) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ApiResponse.error("Email không tồn tại");

        if (!user.getOtpCode().equals(otp) || LocalDateTime.now().isAfter(user.getOtpExpiration())) {
            return ApiResponse.error("OTP không đúng hoặc đã hết hạn");
        }

        user.setOtpCode(null);
        userRepository.save(user);
        
        return ApiResponse.success("Kích hoạt tài khoản thành công!", null);
    }

    public ApiResponse login(String username, String password) {
        User user = userRepository.findByUsername(username).orElse(null);
        
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ApiResponse.error("Sai tài khoản hoặc mật khẩu");
        }

        String token = jwtUtil.generateToken(user.getId().toString());

        UserDto userDto = UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build();

        LoginResponse loginResponse = LoginResponse.builder()
                .token(token)
                .user(userDto)
                .build();

        return ApiResponse.success("Đăng nhập thành công", loginResponse);
    }

    public ApiResponse forgotPassword(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ApiResponse.error("Email không tồn tại trong hệ thống");

        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
        user.setOtpCode(otp);
        user.setOtpExpiration(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        sendEmail(email, "Quên mật khẩu", "Mã OTP đặt lại mật khẩu: " + otp);
        return ApiResponse.success("Đã gửi OTP đến email.", null);
    }

    public ApiResponse resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ApiResponse.error("Lỗi hệ thống");

        if (!otp.equals(user.getOtpCode()) || LocalDateTime.now().isAfter(user.getOtpExpiration())) {
            return ApiResponse.error("OTP sai hoặc hết hạn");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtpCode(null);
        userRepository.save(user);

        return ApiResponse.success("Đổi mật khẩu thành công. Hãy đăng nhập lại.", null);
    }

    private void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    public ApiResponse changeFullname(Long userId, String changedName) {
        User user = userRepository.findById(userId).orElse(null);
        
        user.setFullname(changedName);
        userRepository.save(user);

        return ApiResponse.success("Cập nhật thành công", null);
    }

    public ApiResponse getMe() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("Chưa đăng nhập");
        }

        String userIdStr = auth.getName(); 
        Long userId;
        
        try {
            userId = Long.parseLong(userIdStr);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Token lỗi: ID không hợp lệ");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        List<Category> listCategories = categoryRepository.findAll();

        UserMeResponse userMe = UserMeResponse.builder()
            .id(user.getId())
            .email(user.getEmail())
            .fullname(user.getFullname())
            .username(user.getUsername())
            .role(user.getRole())
            .phone(user.getPhone())
            .avatarUrl(user.getAvatarUrl())
            .rewardPoints(user.getRewardPoints())
            .categories(listCategories)
            .build();

        return ApiResponse.success("Lấy thông tin thành công", userMe);
    }

    public Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("Chưa đăng nhập");
        }
        return Long.parseLong(auth.getName());
    }

    public ApiResponse updateProfile(UpdateProfileRequest request) {
        Long userId = getCurrentUserId();
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (request.getFullname() != null) user.setFullname(request.getFullname());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());

        userRepository.save(user);
        return ApiResponse.success("Cập nhật thông tin thành công", null);
    }

    public ApiResponse changePassword(ChangePasswordRequest request) {
        Long userId = getCurrentUserId();
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return ApiResponse.error("Mật khẩu cũ không đúng");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ApiResponse.success("Đổi mật khẩu thành công", null);
    }

    public ApiResponse requestChangeEmail(String newEmail) {
        Long userId = getCurrentUserId();
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (userRepository.existsByEmail(newEmail)) {
            return ApiResponse.error("Email này đã được sử dụng bởi tài khoản khác");
        }

        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
        
        user.setTempEmail(newEmail);
        user.setOtpCode(otp);
        user.setOtpExpiration(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        sendEmail(newEmail, "Xác thực đổi Email", "Mã OTP xác thực đổi email của bạn là: " + otp);

        return ApiResponse.success("Đã gửi OTP đến email mới. Vui lòng xác thực.", null);
    }

    public ApiResponse verifyChangeEmail(VerifyChangeEmailRequest request) {
        Long userId = getCurrentUserId();
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (user.getTempEmail() == null || !user.getTempEmail().equals(request.getNewEmail())) {
            return ApiResponse.error("Yêu cầu không hợp lệ");
        }

        if (!request.getOtp().equals(user.getOtpCode()) || LocalDateTime.now().isAfter(user.getOtpExpiration())) {
            return ApiResponse.error("OTP sai hoặc đã hết hạn");
        }

        user.setEmail(user.getTempEmail());
        
        user.setTempEmail(null);
        user.setOtpCode(null);
        userRepository.save(user);

        return ApiResponse.success("Đổi Email thành công!", null);
    }

    public ApiResponse uploadAvatar(MultipartFile file) {
        if (file.isEmpty()) {
            return ApiResponse.error("File trống");
        }

        try {
            Path uploadPath = Paths.get("uploads/");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFileName = file.getOriginalFilename();
            String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            String fileName = "avatar_" + System.currentTimeMillis() + fileExtension;

            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "http://10.0.2.2:8087/uploads/" + fileName;

            return ApiResponse.success("Upload thành công", fileUrl);

        } catch (IOException e) {
            throw new RuntimeException("Không thể lưu file ảnh", e);
        }
    }
}