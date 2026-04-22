// ignore_for_file: file_names

import 'package:flutter/material.dart';
import '../../service/forgot_password_service.dart';

class ForgotPasswordController extends ChangeNotifier {
  final ForgotPasswordService _service = ForgotPasswordService();

  bool isLoading = false;
  String? errorMessage;
  String email = '';
  String resetOtp = '';

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
      final isSuccess = await _service.processVerifyResetOtp(email, otp);
      if (isSuccess) {
        resetOtp = otp; 
        return true;
      }
      return false;
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

    final error = await _service.processResetPassword(email, resetOtp, newPassword);

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