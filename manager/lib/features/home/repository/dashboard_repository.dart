import 'package:manager/core/network/api_client.dart';
import 'package:manager/core/network/api_response.dart';

class DashboardRepository {
  final ApiClient _apiClient;

  DashboardRepository(this._apiClient);

  Future<ApiResponse> getOrderStatistics() async {
    final response = await _apiClient.client.get(
      '/api/admin/dashboard/order-stats',
    );
    return response.data as ApiResponse;
  }

  Future<ApiResponse> getRevenue(int month, int year) async {
    final response = await _apiClient.client.get(
      '/api/admin/dashboard/revenue',
      queryParameters: {'month': month, 'year': year},
    );
    return response.data as ApiResponse;
  }

  Future<ApiResponse> getTotalUsers() async {
    final response = await _apiClient.client.get(
      '/api/admin/dashboard/total-users',
    );
    return response.data as ApiResponse;
  }
}
