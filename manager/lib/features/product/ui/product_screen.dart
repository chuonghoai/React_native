// ignore_for_file: use_super_parameters

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:manager/features/product/ui/product_controller.dart';

class ProductScreen extends StatefulWidget {
  final int productId;
  const ProductScreen({Key? key, required this.productId}) : super(key: key);

  @override
  State<ProductScreen> createState() => _ProductScreenState();
}

class _ProductScreenState extends State<ProductScreen> {
  final ProductController _controller = ProductController();

  @override
  void initState() {
    super.initState();
    _controller.fetchProductDetail(widget.productId);
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: _controller,
      builder: (context, _) {
        final p = _controller.currentProduct;

        return Scaffold(
          appBar: AppBar(
            title: const Text('Chi tiết sản phẩm'),
            actions: [
              if (p != null)
                IconButton(
                  icon: const Icon(Icons.edit),
                  onPressed: () => Navigator.pushNamed(
                    context,
                    '/product-edit',
                    arguments: p,
                  ),
                ),
            ],
          ),
          body: _controller.isLoading
              ? const Center(child: CircularProgressIndicator())
              : p == null
              ? const Center(child: Text('Không tìm thấy sản phẩm'))
              : SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        height: 300,
                        width: double.infinity,
                        color: Colors.grey[200],
                        child: p.imageUrl != null
                            ? Image.network(p.imageUrl!, fit: BoxFit.cover)
                            : const Icon(
                                Icons.image,
                                size: 100,
                                color: Colors.grey,
                              ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              p.name,
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              NumberFormat.currency(
                                locale: 'vi_VN',
                                symbol: 'đ',
                              ).format(p.price),
                              style: const TextStyle(
                                fontSize: 20,
                                color: Colors.red,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const Divider(height: 32),
                            _buildInfoRow(
                              Icons.shopping_bag_outlined,
                              'Đã bán:',
                              '${p.soldCount ?? 0}',
                            ),
                            _buildInfoRow(
                              Icons.inventory_2_outlined,
                              'Tồn kho:',
                              '${p.quantity}',
                              isHighlight: true,
                            ),
                            _buildInfoRow(
                              Icons.category_outlined,
                              'Danh mục:',
                              p.category?.name ?? 'Chưa phân loại',
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'Mô tả sản phẩm',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              p.description ?? 'Không có mô tả',
                              style: const TextStyle(
                                fontSize: 16,
                                color: Colors.black87,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
        );
      },
    );
  }

  Widget _buildInfoRow(
    IconData icon,
    String label,
    String value, {
    bool isHighlight = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(fontSize: 16, color: Colors.grey)),
          const SizedBox(width: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isHighlight ? Colors.blue : Colors.black,
            ),
          ),
        ],
      ),
    );
  }
}
