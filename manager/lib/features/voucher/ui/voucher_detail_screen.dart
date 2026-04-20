// ignore_for_file: use_super_parameters, unnecessary_underscores, curly_braces_in_flow_control_structures

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:manager/features/voucher/ui/enum/voucher_purpose.dart';
import 'voucher_controller.dart';
import '../repository/dto/voucher_request.dart';
import '../../../shared/models/product_model.dart';

class VoucherDetailScreen extends StatefulWidget {
  final int? voucherId;
  final VoucherPurpose purpose;

  const VoucherDetailScreen({Key? key, this.voucherId, required this.purpose})
    : super(key: key);

  @override
  State<VoucherDetailScreen> createState() => _VoucherDetailScreenState();
}

class _VoucherDetailScreenState extends State<VoucherDetailScreen> {
  late VoucherPurpose _currentPurpose;
  final VoucherController _controller = VoucherController();

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _amountController = TextEditingController();
  DateTime _startDate = DateTime.now();
  DateTime _endDate = DateTime.now().add(const Duration(days: 7));
  List<ProductModel> _appliedProducts = [];

  @override
  void initState() {
    super.initState();
    _currentPurpose = widget.purpose;
    if (_currentPurpose != VoucherPurpose.add && widget.voucherId != null) {
      _loadVoucherData();
    }
  }

  void _loadVoucherData() async {
    await _controller.getVoucherDetail(widget.voucherId!);
    final voucher = _controller.voucher;
    if (voucher != null) {
      setState(() {
        _nameController.text = voucher.name;
        _amountController.text = voucher.discountAmount.toString();
        _startDate = voucher.startDate;
        _endDate = voucher.endDate;
        _appliedProducts = voucher.products ?? [];
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    bool isReadOnly = _currentPurpose == VoucherPurpose.view;

    return Scaffold(
      appBar: AppBar(
        title: Text(_getTitle()),
        backgroundColor: Colors.orangeAccent,
        actions: [
          if (isReadOnly)
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () =>
                  setState(() => _currentPurpose = VoucherPurpose.edit),
            ),
        ],
      ),
      body: ListenableBuilder(
        listenable: _controller,
        builder: (context, _) {
          if (_controller.isLoading)
            return const Center(child: CircularProgressIndicator());

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSectionTitle('Thông tin cơ bản'),
                const SizedBox(height: 12),
                TextField(
                  controller: _nameController,
                  enabled: !isReadOnly,
                  decoration: const InputDecoration(
                    labelText: 'Tên Voucher',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _amountController,
                  enabled: !isReadOnly,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Mức giảm (VNĐ)',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),

                _buildDateTile(
                  'Ngày bắt đầu',
                  _startDate,
                  !isReadOnly,
                  (date) => setState(() => _startDate = date),
                ),
                _buildDateTile(
                  'Ngày kết thúc',
                  _endDate,
                  !isReadOnly,
                  (date) => setState(() => _endDate = date),
                ),

                const Divider(height: 40),
                _buildSectionTitle(
                  'Sản phẩm áp dụng (${_appliedProducts.length})',
                ),
                const SizedBox(height: 12),

                _appliedProducts.isEmpty
                    ? const Text('Chưa có sản phẩm nào được áp dụng.')
                    : ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _appliedProducts.length,
                        itemBuilder: (context, index) =>
                            _buildProductItem(_appliedProducts[index]),
                      ),

                const SizedBox(height: 32),
                if (!isReadOnly)
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _handleSave,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.orangeAccent,
                      ),
                      child: const Text(
                        'LƯU THÔNG TIN',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: Colors.orange,
      ),
    );
  }

  Widget _buildDateTile(
    String label,
    DateTime date,
    bool enabled,
    Function(DateTime) onSelect,
  ) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(label),
      subtitle: Text(DateFormat('dd/MM/yyyy HH:mm').format(date)),
      trailing: enabled ? const Icon(Icons.calendar_month) : null,
      onTap: enabled
          ? () async {
              final picked = await showDatePicker(
                context: context,
                initialDate: date,
                firstDate: DateTime(2020),
                lastDate: DateTime(2030),
              );
              if (picked != null) onSelect(picked);
            }
          : null,
    );
  }

  Widget _buildProductItem(ProductModel product) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Image.network(
          product.imageUrl ?? '',
          width: 50,
          height: 50,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => const Icon(Icons.image),
        ),
        title: Text(
          product.name,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(
          'Giá: ${NumberFormat.currency(locale: 'vi_VN', symbol: '₫').format(product.price)}',
        ),
        trailing: _currentPurpose != VoucherPurpose.view
            ? IconButton(
                icon: const Icon(Icons.remove_circle, color: Colors.red),
                onPressed: () {
                  setState(
                    () =>
                        _appliedProducts.removeWhere((p) => p.id == product.id),
                  );
                },
              )
            : null,
      ),
    );
  }

  String _getTitle() {
    switch (_currentPurpose) {
      case VoucherPurpose.add:
        return 'Thêm Voucher';
      case VoucherPurpose.edit:
        return 'Chỉnh sửa Voucher';
      case VoucherPurpose.view:
        return 'Chi tiết Voucher';
    }
  }

  void _handleSave() async {
    final request = VoucherRequest(
      name: _nameController.text,
      discountAmount: double.tryParse(_amountController.text) ?? 0,
      startDate: _startDate,
      endDate: _endDate,
      productIds: _appliedProducts.map((p) => p.id!).toList(),
    );

    bool success;
    if (_currentPurpose == VoucherPurpose.add) {
      success = await _controller.addVoucher(request);
    } else {
      success = await _controller.updateVoucher(widget.voucherId!, request);
    }

    if (mounted && success) {
      Navigator.pop(context, true);
    }
  }
}
