import 'package:manager/features/orders/models/order_detail_model.dart';
import 'package:manager/features/orders/models/order_model.dart';
import 'package:manager/features/orders/repository/order_repository.dart';

class OrderService {
  final OrderRepository _repository = OrderRepository();

  Future<List<OrderModel>> getOrdersByStatus(String status) async {
    try {
      final response = await _repository.getOrdersByStatus(status);

      if (response.success && response.data != null) {
        final List<dynamic> data = response.data as List<dynamic>;
        return data.map((json) => OrderModel.fromJson(json)).toList();
      }

      throw Exception(response.message ?? 'Lỗi khi tải danh sách đơn hàng');
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateOrderStatus(int orderId, String newStatus) async {
    try {
      final response = await _repository.updateOrderStatus(orderId, newStatus);
      if (!response.success) {
        throw Exception(response.message ?? 'Không thể cập nhật trạng thái');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<OrderDetailModel> getOrderDetail(int orderId) async {
    try {
      final response = await _repository.getOrderDetail(orderId);
      if (response.success && response.data != null) {
        return OrderDetailModel.fromJson(response.data as Map<String, dynamic>);
      }
      throw Exception(response.message ?? 'Lỗi khi tải chi tiết đơn hàng');
    } catch (e) {
      rethrow;
    }
  }
}
