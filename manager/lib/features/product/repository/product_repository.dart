import 'dart:convert';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:http_parser/http_parser.dart';
import 'package:manager/core/network/api_client.dart';
import 'package:manager/core/network/api_response.dart';

class ProductRepository {
  final ApiClient _apiClient = ApiClient();

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

  Future<ApiResponse> uploadImage(int id, File imageFile) async {
    final formData = FormData.fromMap({
      'image': await MultipartFile.fromFile(
        imageFile.path,
        filename: imageFile.path.split('/').last,
      ),
    });

    final response = await _apiClient.client.post(
      '/api/admin/products/$id/image',
      data: formData,
    );
    return response.data as ApiResponse;
  }

  Future<ApiResponse> deleteProduct(int id) async {
    final response = await _apiClient.client.delete('/api/admin/products/$id');
    return response.data as ApiResponse;
  }
}
