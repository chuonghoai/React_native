import '../models/voucher_model.dart';
import '../repository/dto/voucher_request.dart';
import '../repository/voucher_repository.dart';

class AdminVoucherService {
  final VoucherRepository _repository = VoucherRepository();

  Future<List<VoucherModel>> getAllVouchers() async {
    try {
      final response = await _repository.getAllVouchers();
      if (response.success && response.data != null) {
        final List<dynamic> list = response.data;
        return list.map((item) => VoucherModel.fromJson(item)).toList();
      }
      throw Exception(response.message ?? 'Không thể tải danh sách voucher');
    } catch (e) {
      rethrow;
    }
  }

  Future<VoucherModel> getVoucherById(int id) async {
    try {
      final response = await _repository.getVoucherById(id);
      if (response.success && response.data != null) {
        return VoucherModel.fromJson(response.data);
      }
      throw Exception(response.message ?? 'Không tìm thấy voucher');
    } catch (e) {
      rethrow;
    }
  }

  Future<bool> createVoucher(VoucherRequest request) async {
    try {
      final response = await _repository.createVoucher(request);
      return response.success;
    } catch (e) {
      rethrow;
    }
  }

  Future<bool> updateVoucher(int id, VoucherRequest request) async {
    try {
      final response = await _repository.updateVoucher(id, request);
      return response.success;
    } catch (e) {
      rethrow;
    }
  }

  Future<bool> deleteVoucher(int id) async {
    try {
      final response = await _repository.deleteVoucher(id);
      return response.success;
    } catch (e) {
      rethrow;
    }
  }
}
