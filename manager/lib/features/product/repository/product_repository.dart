import 'package:manager/core/network/api_client.dart';
import 'package:manager/core/network/api_response.dart';

class ProductRepository {
  final ApiClient _apiClient;

  ProductRepository(this._apiClient);

  Future<ApiResponse> createProduct(Map<String, dynamic> data) async {
    final response = await _apiClient.client.post(
      '/api/admin/products',
      data: data,
    );
    return response.data as ApiResponse;
  }

  Future<ApiResponse> getProductById(int id) async {
    final response = await _apiClient.client.get('/api/admin/products/$id');
    return response.data as ApiResponse;
  }

  Future<ApiResponse> updateProduct(int id, Map<String, dynamic> data) async {
    final response = await _apiClient.client.patch(
      '/api/admin/products/$id',
      data: data,
    );
    return response.data as ApiResponse;
  }

  Future<ApiResponse> deleteProduct(int id) async {
    final response = await _apiClient.client.delete('/api/admin/products/$id');
    return response.data as ApiResponse;
  }
}