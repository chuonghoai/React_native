// ignore_for_file: unused_import

import 'package:dio/dio.dart';
import '../repository/forgot_password_repository.dart';

class ForgotPasswordService {
  final ForgotPasswordRepository _repository = ForgotPasswordRepository();

  // Trả về null nếu thành công, trả về String nếu lỗi
  Future<String?> processForgotPassword(String email) async {
    try {
      final apiResponse = await _repository.requestForgotPassword(email);
      if (apiResponse.success) return null;
      return apiResponse.message ?? "Lỗi không xác định";
    } on DioException catch (e) {
      return e.error?.toString() ?? "Lỗi kết nối máy chủ";
    } catch (e) {
      return "Đã xảy ra lỗi hệ thống: $e";
    }
  }

  // Trả về resetToken (String) nếu thành công, Ném lỗi (Exception) nếu thất bại
  Future<String> processVerifyResetOtp(String email, String otp) async {
    try {
      final apiResponse = await _repository.verifyResetOtp(email, otp);
      if (apiResponse.success && apiResponse.data != null) {
        return apiResponse.data['resetToken']; // Trích xuất data
      }
      throw Exception(apiResponse.message ?? "Mã OTP không hợp lệ");
    } on DioException catch (e) {
      throw Exception(e.error?.toString() ?? "Lỗi kết nối máy chủ");
    } catch (e) {
      throw Exception("Đã xảy ra lỗi hệ thống: $e");
    }
  }

  // Trả về null nếu thành công, trả về String nếu lỗi
  Future<String?> processResetPassword(
    String resetToken,
    String newPassword,
  ) async {
    try {
      final apiResponse = await _repository.resetPassword(
        resetToken,
        newPassword,
      );
      if (apiResponse.success) return null;
      return apiResponse.message ?? "Đặt lại mật khẩu thất bại";
    } on DioException catch (e) {
      return e.error?.toString() ?? "Lỗi kết nối máy chủ";
    } catch (e) {
      return "Đã xảy ra lỗi hệ thống: $e";
    }
  }
}
