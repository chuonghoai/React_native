import 'package:manager/core/network/api_client.dart';
import 'package:manager/core/network/api_response.dart';

class CategoryRepository {
  final ApiClient _apiClient = new ApiClient();

  Future<ApiResponse> getAllCategories() async {
    final response = await _apiClient.client.get('/api/admin/categories');
    return response.data as ApiResponse;
  }
}
