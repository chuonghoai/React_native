class OtpVerifyService {
  String? validateOtpFormat(String otp) {
    if (otp.isEmpty) return "Vui lòng nhập mã OTP";
    if (otp.length < 6) return "Mã OTP phải bao gồm 6 chữ số";
    
    if (!RegExp(r'^[0-9]+$').hasMatch(otp)) {
      return "Mã OTP chỉ được chứa các chữ số";
    }
    return null;
  }
}