import 'package:flutter/material.dart';
import 'otp_verify_service.dart';

class OtpVerifyController extends ChangeNotifier {
  final OtpVerifyService _service = OtpVerifyService();
  final Future<void> Function(String) onVerifyCallback;

  bool isLoading = false;
  String? errorMessage;

  OtpVerifyController({required this.onVerifyCallback});

  Future<void> submitOtp(String otpCode) async {
    final error = _service.validateOtpFormat(otpCode);
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
}
