import 'package:manager/core/network/api_client.dart';
import 'package:manager/core/network/api_response.dart';
import 'package:manager/features/category/repository/dto/category_request.dart';

class CategoryRepository {
  final ApiClient _apiClient = ApiClient();

  Future<ApiResponse> getAllCategories() async {
    final response = await _apiClient.client.get('/api/admin/categories');
    return response.data as ApiResponse;
  }

  Future<ApiResponse> createCategory(CategoryRequest request) async {
    final response = await _apiClient.client.post(
      '/api/admin/categories',
      data: request.toJson(),
    );
    return response.data as ApiResponse;
  }

  Future<ApiResponse> updateCategory(int id, CategoryRequest request) async {
    final response = await _apiClient.client.patch(
      '/api/admin/categories/$id',
      data: request.toJson(),
    );
    return response.data as ApiResponse;
  }

  Future<ApiResponse> deleteCategory(int id) async {
    final response = await _apiClient.client.delete(
      '/api/admin/categories/$id',
    );
    return response.data as ApiResponse;
  }
}
