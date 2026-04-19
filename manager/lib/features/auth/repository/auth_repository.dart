import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';

class AuthRepository {
  final ApiClient _apiClient = ApiClient();

  // Login
  Future<ApiResponse> login(String email, String password, bool rememberMe) async {
    final response = await _apiClient.client.post(
      '/admin/auth/login',
      data: {
        'email': email,
        'password': password,
        'rememberMe': rememberMe,
      },
    );
    
    return response.data as ApiResponse;
  }

  // Verify login OTP
  Future<ApiResponse> verifyLoginOtp(String tempToken, String otp) async {
    final response = await _apiClient.client.post(
      '/admin/auth/verify-login-otp',
      data: {'tempToken': tempToken, 'otp': otp},
    );
    return response.data as ApiResponse;
  }
}