import 'package:flutter/material.dart';
import 'package:manager/features/orders/models/order_model.dart';
import 'package:manager/features/orders/service/order_service.dart';

class OrdersController extends ChangeNotifier {
  final OrderService _orderService = OrderService();

  bool isLoading = true;
  String? errorMessage;
  List<OrderModel> orders = [];

  final List<String> statuses = [
    'ALL',
    'NEW',
    'CONFIRMED',
    'PREPARING',
    'SHIPPING',
    'DELIVERED',
    'REQUEST_CANCEL',
    'CANCELLED',
  ];

  late String currentStatus;

  void init(String initialStatus) {
    currentStatus = initialStatus;
    fetchOrders();
  }

  void changeStatus(String status) {
    if (currentStatus == status) return;
    currentStatus = status;
    fetchOrders();
  }

  Future<void> fetchOrders() async {
    try {
      isLoading = true;
      errorMessage = null;
      notifyListeners();

      orders = await _orderService.getOrdersByStatus(currentStatus);
    } catch (e) {
      errorMessage = e.toString();
      orders = [];
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> confirmOrder(int orderId) async {
    // TODO:
  }
}
