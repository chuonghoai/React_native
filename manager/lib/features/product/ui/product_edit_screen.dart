// ignore_for_file: use_super_parameters, deprecated_member_use

import 'package:flutter/material.dart';
import 'package:manager/features/product/ui/product_controller.dart';
import 'package:manager/shared/models/product_model.dart';

class ProductEditScreen extends StatefulWidget {
  final ProductModel product;

  const ProductEditScreen({Key? key, required this.product}) : super(key: key);

  @override
  State<ProductEditScreen> createState() => _ProductEditScreenState();
}

class _ProductEditScreenState extends State<ProductEditScreen> {
  final ProductController _controller = ProductController();
  late TextEditingController _nameController;
  late TextEditingController _priceController;
  late TextEditingController _descController;
  late TextEditingController _stockController;
  CategoryModel? _selectedCategory;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.product.name);
    _priceController = TextEditingController(
      text: widget.product.price.toString(),
    );
    _descController = TextEditingController(text: widget.product.description);
    _stockController = TextEditingController(
      text: widget.product.quantity.toString(),
    );
    _selectedCategory = widget.product.category;
    _controller.fetchCategories();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Chỉnh sửa sản phẩm')),
      body: ListenableBuilder(
        listenable: _controller,
        builder: (context, _) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                GestureDetector(
                  onTap: _controller.pickImage,
                  child: Container(
                    height: 150,
                    width: 150,
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: _controller.selectedImage != null
                        ? Image.file(
                            _controller.selectedImage!,
                            fit: BoxFit.cover,
                          )
                        : (widget.product.imageUrl != null
                              ? Image.network(
                                  widget.product.imageUrl!,
                                  fit: BoxFit.cover,
                                )
                              : const Icon(Icons.add_a_photo, size: 50)),
                  ),
                ),
                const SizedBox(height: 24),

                Card(
                  color: Colors.blue[50],
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.inventory_2,
                          color: Colors.blue,
                          size: 30,
                        ),
                        const SizedBox(width: 16),
                        const Expanded(
                          child: Text(
                            'Số lượng tồn kho',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        SizedBox(
                          width: 80,
                          child: TextField(
                            controller: _stockController,
                            keyboardType: TextInputType.number,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.blue,
                            ),
                            decoration: const InputDecoration(
                              border: OutlineInputBorder(),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                TextField(
                  controller: _nameController,
                  decoration: const InputDecoration(labelText: 'Tên sản phẩm'),
                ),
                TextField(
                  controller: _priceController,
                  decoration: const InputDecoration(labelText: 'Giá bán (VNĐ)'),
                  keyboardType: TextInputType.number,
                ),

                DropdownButtonFormField<CategoryModel>(
                  value:
                      _controller.categories.any(
                        (c) => c.id == _selectedCategory?.id,
                      )
                      ? _controller.categories.firstWhere(
                          (c) => c.id == _selectedCategory?.id,
                        )
                      : null,
                  decoration: const InputDecoration(labelText: 'Danh mục'),
                  items: _controller.categories.map((c) {
                    return DropdownMenuItem(value: c, child: Text(c.name));
                  }).toList(),
                  onChanged: (val) => setState(() => _selectedCategory = val),
                ),

                TextField(
                  controller: _descController,
                  decoration: const InputDecoration(labelText: 'Mô tả'),
                  maxLines: 3,
                ),

                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _controller.isLoading ? null : _handleSave,
                    child: _controller.isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text('LƯU THAY ĐỔI'),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _handleSave() async {
    final updatedProduct = ProductModel(
      id: widget.product.id,
      name: _nameController.text,
      price: double.tryParse(_priceController.text) ?? 0.0,
      quantity: int.tryParse(_stockController.text) ?? 0,
      description: _descController.text,
      category: _selectedCategory,
      imageUrl: widget.product.imageUrl,
    );

    final success = await _controller.updateProduct(updatedProduct);
    if (success && mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Đã cập nhật sản phẩm')));
      Navigator.pop(context);
    }
  }
}
