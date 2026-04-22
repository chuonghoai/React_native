import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';

class ForgotPasswordRepository {
  final ApiClient _apiClient = ApiClient();

  // 1. Gửi email lấy OTP
  Future<ApiResponse> requestForgotPassword(String email) async {
    final response = await _apiClient.client.post(
      '/api/admin/auth/forgot-password',
      data: {'email': email},
    );
    return response.data as ApiResponse;
  }

  // 2. Xác thực OTP
  Future<ApiResponse> verifyResetOtp(String email, String otp) async {
    final response = await _apiClient.client.post(
      '/api/admin/auth/verify-otp',
      data: {'email': email, 'otp': otp},
    );
    return response.data as ApiResponse;
  }

  // 3. Đặt lại mật khẩu mới
  Future<ApiResponse> resetPassword(String email, String otp, String newPassword) async {
    final response = await _apiClient.client.post(
      '/api/admin/auth/reset-password',
      data: {'email': email, 'otp': otp, 'newPassword': newPassword},
    );
    return response.data as ApiResponse;
  }
}