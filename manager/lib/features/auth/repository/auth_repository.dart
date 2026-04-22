import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';

class AuthRepository {
  final ApiClient _apiClient = ApiClient();

  // Login
  Future<ApiResponse> login(String username, String password) async {
    final response = await _apiClient.client.post(
      '/api/admin/auth/login',
      data: {'username': username, 'password': password},
    );

    return response.data as ApiResponse;
  }
}
