import 'package:manager/features/home/repository/dashboard_repository.dart';

class DashboardService {
  final DashboardRepository _repository;

  DashboardService(this._repository);

  Future<Map<String, int>> getOrderStats() async {
    try {
      final response = await _repository.getOrderStatistics();
      if (response.success && response.data != null) {
        return Map<String, int>.from(response.data);
      }
      throw Exception(response.message ?? 'Lỗi lấy thống kê đơn hàng');
    } catch (e) {
      rethrow;
    }
  }

  Future<double> getRevenue(int month, int year) async {
    try {
      final response = await _repository.getRevenue(month, year);
      if (response.success && response.data != null) {
        return (response.data['revenue'] as num?)?.toDouble() ?? 0.0;
      }
      throw Exception(response.message ?? 'Lỗi lấy thống kê doanh thu');
    } catch (e) {
      rethrow;
    }
  }

  Future<int> getTotalUsers() async {
    try {
      final response = await _repository.getTotalUsers();
      if (response.success && response.data != null) {
        return (response.data['totalUsers'] as num?)?.toInt() ?? 0;
      }
      throw Exception(response.message ?? 'Lỗi lấy tổng số người dùng');
    } catch (e) {
      rethrow;
    }
  }
}