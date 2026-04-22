import 'package:manager/core/network/api_client.dart';
import 'package:manager/core/network/api_response.dart';
import 'package:manager/features/voucher/repository/dto/voucher_request.dart';

class VoucherRepository {
  final ApiClient _apiClient = ApiClient();

  Future<ApiResponse> getAllVouchers() async {
    final response = await _apiClient.client.get('/api/admin/vouchers');
    return response.data as ApiResponse;
  }

  Future<ApiResponse> getVoucherById(int id) async {
    final response = await _apiClient.client.get('/api/admin/vouchers/$id');
    return response.data as ApiResponse;
  }

  Future<ApiResponse> createVoucher(VoucherRequest request) async {
    final response = await _apiClient.client.post(
      '/api/admin/vouchers',
      data: request.toJson(),
    );
    return response.data as ApiResponse;
  }

  Future<ApiResponse> updateVoucher(int id, VoucherRequest request) async {
    final response = await _apiClient.client.patch(
      '/api/admin/vouchers/$id',
      data: request.toJson(),
    );
    return response.data as ApiResponse;
  }

  Future<ApiResponse> deleteVoucher(int id) async {
    final response = await _apiClient.client.delete('/api/admin/vouchers/$id');
    return response.data as ApiResponse;
  }
}
