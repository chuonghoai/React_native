// ignore_for_file: use_super_parameters

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:manager/features/voucher/ui/enum/voucher_purpose.dart';
import 'package:manager/features/voucher/ui/voucher_detail_screen.dart';
import 'voucher_controller.dart';
import '../models/voucher_model.dart';

class VoucherScreen extends StatefulWidget {
  const VoucherScreen({Key? key}) : super(key: key);

  @override
  State<VoucherScreen> createState() => _VoucherScreenState();
}

class _VoucherScreenState extends State<VoucherScreen> {
  final VoucherController _controller = VoucherController();
  final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: '₫');
  final dateFormat = DateFormat('dd/MM/yyyy');

  @override
  void initState() {
    super.initState();
    _controller.fetchVouchers();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Quản lý Khuyến mãi',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.orangeAccent,
        foregroundColor: Colors.white,
      ),
      body: ListenableBuilder(
        listenable: _controller,
        builder: (context, _) {
          if (_controller.isLoading && _controller.vouchers.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (_controller.errorMessage != null &&
              _controller.vouchers.isEmpty) {
            return Center(child: Text('Lỗi: ${_controller.errorMessage}'));
          }

          return RefreshIndicator(
            onRefresh: _controller.fetchVouchers,
            child: _controller.vouchers.isEmpty
                ? const Center(child: Text('Chưa có mã giảm giá nào'))
                : ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: _controller.vouchers.length,
                    itemBuilder: (context, index) {
                      return _buildVoucherCard(_controller.vouchers[index]);
                    },
                  ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) =>
                  VoucherDetailScreen(purpose: VoucherPurpose.add),
            ),
          );
        },
        backgroundColor: Colors.orangeAccent,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildVoucherCard(VoucherModel voucher) {
    final bool isExpired = voucher.endDate.isBefore(DateTime.now());

    return Card(
      elevation: 3,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => VoucherDetailScreen(
                voucherId: voucher.id,
                purpose: VoucherPurpose.view,
              ),
            ),
          );
        },
        borderRadius: BorderRadius.circular(15),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isExpired ? Colors.grey[400] : Colors.orange[50],
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(15),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.confirmation_number,
                    color: isExpired ? Colors.grey[700] : Colors.orange,
                    size: 30,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      voucher.name,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: isExpired
                            ? Colors.grey[800]
                            : Colors.orange[900],
                      ),
                    ),
                  ),
                  if (isExpired)
                    const Text(
                      'HẾT HẠN',
                      style: TextStyle(
                        color: Colors.red,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Mức giảm:',
                        style: TextStyle(color: Colors.grey),
                      ),
                      Text(
                        currencyFormat.format(voucher.discountAmount),
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.redAccent,
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 24),
                  Row(
                    children: [
                      const Icon(
                        Icons.date_range,
                        size: 16,
                        color: Colors.grey,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Áp dụng: ${dateFormat.format(voucher.startDate)} - ${dateFormat.format(voucher.endDate)}',
                        style: const TextStyle(fontSize: 14),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton.icon(
                        onPressed: () => _controller.removeVoucher(voucher.id!),
                        icon: const Icon(
                          Icons.delete_outline,
                          color: Colors.red,
                        ),
                        label: const Text(
                          'Xóa',
                          style: TextStyle(color: Colors.red),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => VoucherDetailScreen(
                                voucherId: voucher.id,
                                purpose: VoucherPurpose.edit,
                              ),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blueAccent,
                        ),
                        child: const Text(
                          'Chỉnh sửa',
                          style: TextStyle(color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
