// ignore_for_file: file_names

import 'package:flutter/material.dart';
import '../../service/forgot_password_service.dart';

class ForgotPasswordController extends ChangeNotifier {
  final ForgotPasswordService _service = ForgotPasswordService();

  bool isLoading = false;
  String? errorMessage;
  String email = '';
  String resetToken = '';

  // Verify email button: send OTP
  Future<bool> sendOtp(String inputEmail) async {
    if (inputEmail.isEmpty) {
      errorMessage = "Vui lòng nhập email tài khoản của bạn.";
      notifyListeners();
      return false;
    }

    isLoading = true;
    errorMessage = null;
    notifyListeners();

    final error = await _service.processForgotPassword(inputEmail);

    isLoading = false;
    if (error == null) {
      email = inputEmail;
      notifyListeners();
      return true;
    } else {
      errorMessage = error;
      notifyListeners();
      return false;
    }
  }

  // Verify OTP butotn
  Future<bool> verifyOtp(String otp) async {
    try {
      // Service sẽ quăng Exception nếu lỗi, trả về token nếu thành công
      final token = await _service.processVerifyResetOtp(email, otp);
      
      resetToken = token; // Lưu lại resetToken để dùng cho bước đổi mật khẩu
      return true;
    } catch (e) {
      errorMessage = e.toString().replaceAll("Exception: ", "");
      notifyListeners();
      return false;
    }
  }

  // Reset password button
  Future<bool> resetPassword(String newPassword, String confirmPassword) async {
    if (newPassword.isEmpty || confirmPassword.isEmpty) {
      errorMessage = "Vui lòng nhập đầy đủ thông tin.";
      notifyListeners();
      return false;
    }
    if (newPassword != confirmPassword) {
      errorMessage = "Mật khẩu xác nhận không khớp.";
      notifyListeners();
      return false;
    }

    isLoading = true;
    errorMessage = null;
    notifyListeners();

    final error = await _service.processResetPassword(resetToken, newPassword);

    isLoading = false;
    if (error == null) {
      notifyListeners();
      return true;
    } else {
      errorMessage = error;
      notifyListeners();
      return false;
    }
  }
}