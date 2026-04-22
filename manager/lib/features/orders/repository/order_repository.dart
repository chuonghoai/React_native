import 'package:manager/core/network/api_client.dart';
import 'package:manager/core/network/api_response.dart';

class OrderRepository {
  final ApiClient _apiClient = ApiClient();

  Future<ApiResponse> getOrdersByStatus(String status) async {
    final response = await _apiClient.client.get('/api/admin/orders/$status');
    return response.data as ApiResponse;
  }

  Future<ApiResponse> updateOrderStatus(int orderId, String newStatus) async {
    final response = await _apiClient.client.patch(
      '/api/admin/orders/$orderId/status',
      data: {'status': newStatus},
    );
    return response.data as ApiResponse;
  }

  Future<ApiResponse> getOrderDetail(int orderId) async {
    final response = await _apiClient.client.get(
      '/api/admin/orders/detail/$orderId',
    );
    return response.data as ApiResponse;
  }
}
