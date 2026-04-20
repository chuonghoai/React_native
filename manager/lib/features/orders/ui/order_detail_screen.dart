// ignore_for_file: use_super_parameters, unnecessary_to_list_in_spreads

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:manager/features/orders/models/order_detail_model.dart';
import 'package:manager/features/orders/ui/orders_controller.dart';

class OrderDetailScreen extends StatefulWidget {
  final int orderId;

  const OrderDetailScreen({Key? key, required this.orderId}) : super(key: key);

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  final OrdersController _controller = OrdersController();

  @override
  void initState() {
    super.initState();
    _controller.getOrderDetail(widget.orderId);
  }

  Map<String, String>? _getNextStatusInfo(String currentStatus) {
    switch (currentStatus) {
      case 'NEW':
        return {
          'status': 'CONFIRMED',
          'text': 'Xác nhận đơn hàng',
          'color': 'green',
        };
      case 'CONFIRMED':
        return {
          'status': 'PREPARING',
          'text': 'Bắt đầu chuẩn bị hàng',
          'color': 'purple',
        };
      case 'PREPARING':
        return {
          'status': 'SHIPPING',
          'text': 'Giao cho đơn vị vận chuyển',
          'color': 'cyan',
        };
      case 'SHIPPING':
        return {
          'status': 'DELIVERED',
          'text': 'Xác nhận đã giao hàng',
          'color': 'blue',
        };
      case 'REQUEST_CANCEL':
        return {
          'status': 'CANCELLED',
          'text': 'Xác nhận hủy đơn hàng',
          'color': 'red',
        };
      default:
        return null;
    }
  }

  String _formatCurrency(double amount) {
    return NumberFormat.currency(locale: 'vi_VN', symbol: 'đ').format(amount);
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: _controller,
      builder: (context, _) {
        final order = _controller.orderDetail;

        return Scaffold(
          backgroundColor: Colors.grey[100],
          appBar: AppBar(
            title: Text('Đơn hàng #${widget.orderId}'),
            elevation: 0,
          ),
          body: _controller.isLoading
              ? const Center(child: CircularProgressIndicator())
              : order == null
              ? const Center(child: Text('Không tìm thấy thông tin đơn hàng'))
              : Column(
                  children: [
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildStatusBanner(order.status),
                            const SizedBox(height: 16),
                            _buildInfoSection(
                              title: 'Thông tin người mua',
                              icon: Icons.person_outline,
                              content: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Họ tên: ${order.buyerName ?? 'N/A'}',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text('Email: ${order.buyerName ?? 'N/A'}'),
                                  Text(
                                    'Số điện thoại: ${order.shippingPhone ?? 'N/A'}',
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                            _buildInfoSection(
                              title: 'Địa chỉ giao hàng',
                              icon: Icons.location_on_outlined,
                              content: Text(order.shippingAddress ?? 'N/A'),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'Danh sách sản phẩm',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            ...order.items
                                .map((item) => _buildProductItem(item))
                                .toList(),
                            const SizedBox(height: 16),
                            _buildPriceSummary(order.totalPrice),
                          ],
                        ),
                      ),
                    ),
                    _buildBottomAction(order.status),
                  ],
                ),
        );
      },
    );
  }

  Widget _buildStatusBanner(String status) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.blue[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.blue.shade200),
      ),
      child: Row(
        children: [
          const Icon(Icons.info_outline, color: Colors.blue),
          const SizedBox(width: 8),
          const Text(
            'Trạng thái hiện tại: ',
            style: TextStyle(color: Colors.blue),
          ),
          Text(
            status,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.blue,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoSection({
    required String title,
    required IconData icon,
    required Widget content,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 20, color: Colors.grey),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  color: Colors.grey,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const Divider(),
          content,
        ],
      ),
    );
  }

  Widget _buildProductItem(OrderItem item) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: ListTile(
        leading: Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: Colors.grey[200],
            borderRadius: BorderRadius.circular(4),
          ),
          child: item.productImageUrl.isNotEmpty
              ? Image.network(item.productImageUrl, fit: BoxFit.cover)
              : const Icon(Icons.image),
        ),
        title: Text(
          item.productName,
          style: const TextStyle(fontWeight: FontWeight.w500),
        ),
        subtitle: Text('Số lượng: ${item.quantity}'),
        trailing: Text(
          _formatCurrency(item.price),
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Widget _buildPriceSummary(double total) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'Tổng cộng thanh toán',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          Text(
            _formatCurrency(total),
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.red,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomAction(String currentStatus) {
    final nextInfo = _getNextStatusInfo(currentStatus);
    if (nextInfo == null) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 4,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: () async {
              final success = await _controller.updateOrderStatus(
                widget.orderId,
                nextInfo['status']!,
              );
              if (success && mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      'Đã cập nhật trạng thái đơn hàng: ${nextInfo['status']}',
                    ),
                  ),
                );
                _controller.getOrderDetail(widget.orderId);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: _getColor(nextInfo['color']!),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text(
              nextInfo['text']!.toUpperCase(),
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Color _getColor(String name) {
    switch (name) {
      case 'green':
        return Colors.green;
      case 'purple':
        return Colors.purple;
      case 'cyan':
        return Colors.cyan;
      case 'blue':
        return Colors.blue;
      case 'red':
        return Colors.red;
      default:
        return Colors.blue;
    }
  }
}
