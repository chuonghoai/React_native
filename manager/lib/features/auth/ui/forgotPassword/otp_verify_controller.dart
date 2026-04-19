import 'package:flutter/material.dart';

class OtpVerifyController extends ChangeNotifier {
  final Future<void> Function(String) onVerifyCallback;

  bool isLoading = false;
  String? errorMessage;

  OtpVerifyController({required this.onVerifyCallback});

  Future<void> submitOtp(String otpCode) async {
    final error = _validateOtpFormat(otpCode);
    if (error != null) {
      errorMessage = error;
      notifyListeners();
      return;
    }

    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      await onVerifyCallback(otpCode);
    } catch (e) {
      errorMessage = e.toString().replaceAll("Exception: ", "");
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  String? _validateOtpFormat(String otp) {
    if (otp.isEmpty) return "Vui lòng nhập mã OTP";
    if (otp.length < 6) return "Mã OTP phải bao gồm 6 chữ số";
    
    if (!RegExp(r'^[0-9]+$').hasMatch(otp)) {
      return "Mã OTP chỉ được chứa các chữ số";
    }
    return null;
  }
}
