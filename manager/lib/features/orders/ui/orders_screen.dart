// ignore_for_file: use_super_parameters

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:manager/features/orders/models/order_model.dart';
import 'package:manager/features/orders/ui/orders_controller.dart';

class OrdersScreen extends StatefulWidget {
  final String initialStatus;

  const OrdersScreen({Key? key, this.initialStatus = 'CONFIRMED'})
    : super(key: key);

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  final OrdersController _controller = OrdersController();

  @override
  void initState() {
    super.initState();
    _controller.init(widget.initialStatus);
  }

  String _translateStatus(String status) {
    switch (status) {
      case 'ALL':
        return 'Tất cả';
      case 'NEW':
        return 'Chờ xác nhận';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'PREPARING':
        return 'Đang chuẩn bị';
      case 'SHIPPING':
        return 'Đang giao';
      case 'DELIVERED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'REQUEST_CANCEL':
        return 'Chờ hủy';
      default:
        return status;
    }
  }

  String _formatCurrency(double amount) {
    return NumberFormat.currency(locale: 'vi_VN', symbol: 'đ').format(amount);
  }

  String _formatDate(String? isoString) {
    if (isoString == null) return 'N/A';
    try {
      final date = DateTime.parse(isoString).toLocal();
      return DateFormat('dd/MM/yyyy HH:mm').format(date);
    } catch (e) {
      return isoString;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(title: const Text('Danh sách đơn hàng'), elevation: 0),
      body: Column(
        children: [
          _buildStatusSlider(),
          Expanded(
            child: ListenableBuilder(
              listenable: _controller,
              builder: (context, _) {
                if (_controller.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (_controller.errorMessage != null) {
                  return Center(
                    child: Text(
                      _controller.errorMessage!,
                      style: const TextStyle(color: Colors.red),
                    ),
                  );
                }

                if (_controller.orders.isEmpty) {
                  return const Center(child: Text('Không có đơn hàng nào.'));
                }

                return RefreshIndicator(
                  onRefresh: _controller.fetchOrders,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: _controller.orders.length,
                    itemBuilder: (context, index) {
                      final order = _controller.orders[index];
                      return _buildOrderItem(order);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusSlider() {
    return Container(
      height: 50,
      color: Colors.white,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _controller.statuses.length,
        itemBuilder: (context, index) {
          final status = _controller.statuses[index];

          return ListenableBuilder(
            listenable: _controller,
            builder: (context, _) {
              final isSelected = _controller.currentStatus == status;
              return GestureDetector(
                onTap: () => _controller.changeStatus(status),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(
                        color: isSelected ? Colors.blue : Colors.transparent,
                        width: 3,
                      ),
                    ),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    _translateStatus(status),
                    style: TextStyle(
                      fontWeight: isSelected
                          ? FontWeight.bold
                          : FontWeight.normal,
                      color: isSelected ? Colors.blue : Colors.grey[700],
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildOrderItem(OrderModel order) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Đơn hàng #${order.id}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.blue[50],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _translateStatus(order.status),
                    style: const TextStyle(
                      color: Colors.blue,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            _buildRowInfo(
              Icons.calendar_today,
              'Ngày đặt:',
              _formatDate(order.orderDate),
            ),
            _buildRowInfo(
              Icons.location_on_outlined,
              'Địa chỉ:',
              order.shippingAddress ?? 'N/A',
            ),
            _buildRowInfo(
              Icons.phone_outlined,
              'SĐT:',
              order.phoneNumber ?? 'N/A',
            ),
            _buildRowInfo(
              Icons.payment,
              'Thanh toán:',
              order.paymentMethod ?? 'COD',
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Tổng tiền:',
                  style: TextStyle(fontSize: 16, color: Colors.grey),
                ),
                Text(
                  _formatCurrency(order.totalPrice),
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.red,
                  ),
                ),
              ],
            ),

            // Nút Xác nhận chỉ hiện cho đơn hàng NEW
            if (order.status == 'NEW') ...[
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => _controller.confirmOrder(order.id),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                  ),
                  child: const Text(
                    'Xác nhận đơn hàng',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildRowInfo(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: Colors.grey[600]),
          const SizedBox(width: 8),
          Text('$label ', style: TextStyle(color: Colors.grey[700])),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w500),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
