import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';

class ForgotPasswordRepository {
  final ApiClient _apiClient = ApiClient();

  // 1. Gửi email lấy OTP
  Future<ApiResponse> requestForgotPassword(String email) async {
    final response = await _apiClient.client.post(
      '/admin/auth/forgot-password',
      data: {'email': email},
    );
    return response.data as ApiResponse;
  }

  // 2. Xác thực OTP
  Future<ApiResponse> verifyResetOtp(String email, String otp) async {
    final response = await _apiClient.client.post(
      '/admin/auth/verify-reset-otp',
      data: {'email': email, 'otp': otp},
    );
    return response.data as ApiResponse;
  }

  // 3. Đặt lại mật khẩu mới
  Future<ApiResponse> resetPassword(String resetToken, String newPassword) async {
    final response = await _apiClient.client.post(
      '/admin/auth/reset-password',
      data: {'resetToken': resetToken, 'newPassword': newPassword},
    );
    return response.data as ApiResponse;
  }
}