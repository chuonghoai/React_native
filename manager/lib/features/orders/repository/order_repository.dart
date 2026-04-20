import 'package:manager/core/network/api_client.dart';
import 'package:manager/core/network/api_response.dart';

class OrderRepository {
  final ApiClient _apiClient = ApiClient();

  Future<ApiResponse> getOrdersByStatus(String status) async {
    final response = await _apiClient.client.get('/api/admin/orders/$status');
    return response.data as ApiResponse;
  }
}
