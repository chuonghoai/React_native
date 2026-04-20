import 'package:flutter/material.dart';
import 'package:manager/features/voucher/models/voucher_model.dart';
import 'package:manager/features/voucher/repository/dto/voucher_request.dart';
import 'package:manager/features/voucher/services/voucher_service.dart';

class VoucherController extends ChangeNotifier {
  final AdminVoucherService _service = AdminVoucherService();

  List<VoucherModel> vouchers = [];
  bool isLoading = false;
  String? errorMessage;

  Future<void> fetchVouchers() async {
    try {
      isLoading = true;
      errorMessage = null;
      notifyListeners();

      vouchers = await _service.getAllVouchers();
    } catch (e) {
      errorMessage = e.toString();
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> addVoucher(VoucherRequest request) async {
    try {
      isLoading = true;
      notifyListeners();
      final success = await _service.createVoucher(request);
      if (success) await fetchVouchers();
      return success;
    } catch (e) {
      errorMessage = e.toString();
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> removeVoucher(int id) async {
    try {
      final success = await _service.deleteVoucher(id);
      if (success) {
        vouchers.removeWhere((v) => v.id == id);
        notifyListeners();
      }
      return success;
    } catch (e) {
      errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
}
