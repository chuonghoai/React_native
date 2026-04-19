import 'package:manager/core/network/api_client.dart';
import 'package:manager/core/network/api_response.dart';

class ProductRepository {
  final ApiClient _apiClient = ApiClient();

  Future<ApiResponse> getProducts({int page = 0, int size = 20}) async {
    final response = await _apiClient.client.get(
      '/api/admin/products',
      queryParameters: {'page': page, 'size': size},
    );
    return response.data as ApiResponse;
  }

  Future<ApiResponse> getLowStockWarning({int threshold = 10}) async {
    final response = await _apiClient.client.get(
      '/api/admin/dashboard/low-stock',
      queryParameters: {'threshold': threshold},
    );
    return response.data as ApiResponse;
  }
}
