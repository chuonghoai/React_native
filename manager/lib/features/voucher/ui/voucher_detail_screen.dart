// ignore_for_file: use_super_parameters, unnecessary_underscores, curly_braces_in_flow_control_structures

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:manager/features/home/service/product_service.dart';
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
  final ProductService _productService = ProductService();

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _amountController = TextEditingController();
  final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: '₫');
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildSectionTitle(
                      'Sản phẩm áp dụng (${_appliedProducts.length})',
                    ),
                    if (!isReadOnly)
                      TextButton.icon(
                        onPressed: _showProductSelectionBottomSheet,
                        icon: const Icon(
                          Icons.add_circle_outline,
                          color: Colors.orangeAccent,
                        ),
                        label: const Text(
                          'Chọn sản phẩm',
                          style: TextStyle(color: Colors.orangeAccent),
                        ),
                      ),
                  ],
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

  void _showProductSelectionBottomSheet() async {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return FutureBuilder<List<ProductModel>>(
          future: _productService.getProducts(page: 0, size: 50),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const SizedBox(
                height: 300,
                child: Center(child: CircularProgressIndicator()),
              );
            }
            if (snapshot.hasError) {
              return const SizedBox(
                height: 300,
                child: Center(child: Text('Lỗi khi tải sản phẩm')),
              );
            }

            final allProducts = snapshot.data ?? [];

            return StatefulBuilder(
              builder: (context, setModalState) {
                return Container(
                  height: MediaQuery.of(context).size.height * 0.7,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: Column(
                    children: [
                      const Text(
                        'Chọn sản phẩm áp dụng',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 10),
                      const Divider(),
                      Expanded(
                        child: ListView.builder(
                          itemCount: allProducts.length,
                          itemBuilder: (context, index) {
                            final product = allProducts[index];
                            final isSelected = _appliedProducts.any(
                              (p) => p.id == product.id,
                            );

                            return CheckboxListTile(
                              secondary: CircleAvatar(
                                backgroundImage: NetworkImage(
                                  product.imageUrl ?? '',
                                ),
                                onBackgroundImageError: (_, __) =>
                                    const Icon(Icons.image),
                              ),
                              title: Text(
                                product.name,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              subtitle: Text(
                                currencyFormat.format(product.price),
                              ),
                              value: isSelected,
                              activeColor: Colors.orangeAccent,
                              onChanged: (val) {
                                setModalState(() {
                                  if (val == true) {
                                    _appliedProducts.add(product);
                                  } else {
                                    _appliedProducts.removeWhere(
                                      (p) => p.id == product.id,
                                    );
                                  }
                                });
                                setState(() {});
                              },
                            );
                          },
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () => Navigator.pop(context),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.orangeAccent,
                            ),
                            child: const Text(
                              'XÁC NHẬN',
                              style: TextStyle(color: Colors.white),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            );
          },
        );
      },
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
