// ignore_for_file: use_build_context_synchronously, use_super_parameters

import 'package:flutter/material.dart';
import 'category_controller.dart';
import '../models/category_model.dart';

class CategoryScreen extends StatefulWidget {
  const CategoryScreen({Key? key}) : super(key: key);

  @override
  State<CategoryScreen> createState() => _CategoryScreenState();
}

class _CategoryScreenState extends State<CategoryScreen> {
  final CategoryController _controller = CategoryController();
  final TextEditingController _addController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _controller.fetchCategories();
  }

  @override
  void dispose() {
    _addController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Quản lý danh mục',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.blueAccent,
        foregroundColor: Colors.white,
      ),
      body: ListenableBuilder(
        listenable: _controller,
        builder: (context, _) {
          if (_controller.isLoading && _controller.categories.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (_controller.errorMessage != null &&
              _controller.categories.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Lỗi: ${_controller.errorMessage}',
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _controller.fetchCategories,
                    child: const Text('Thử lại'),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: _controller.fetchCategories,
            child: _controller.categories.isEmpty
                ? const Center(child: Text('Chưa có danh mục nào'))
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _controller.categories.length,
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final category = _controller.categories[index];
                      return _buildCategoryItem(category);
                    },
                  ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddCategoryDialog,
        backgroundColor: Colors.blueAccent,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildCategoryItem(CategoryModel category) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: CircleAvatar(
          backgroundColor: Colors.blue[50],
          child: const Icon(Icons.folder_open, color: Colors.blueAccent),
        ),
        title: Text(
          category.name,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        trailing: const Icon(Icons.more_horiz, color: Colors.grey),
        onTap: () => _showCategoryOptions(category),
      ),
    );
  }

  void _showCategoryOptions(CategoryModel category) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Tùy chọn: ${category.name}',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 10),
              ListTile(
                leading: const Icon(Icons.edit, color: Colors.blue),
                title: const Text('Sửa tên danh mục'),
                onTap: () {
                  Navigator.pop(context);
                  _showEditCategoryDialog(category);
                },
              ),
              ListTile(
                leading: const Icon(Icons.delete_forever, color: Colors.red),
                title: const Text(
                  'Xóa danh mục',
                  style: TextStyle(color: Colors.red),
                ),
                onTap: () {
                  Navigator.pop(context);
                  _showDeleteConfirmation(category);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _showDeleteConfirmation(CategoryModel category) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xác nhận xóa'),
        content: Text('Bạn có chắc chắn muốn xóa danh mục "${category.name}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              if (category.id != null) {
                final success = await _controller.deleteCategory(category.id!);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        success
                            ? 'Đã xóa danh mục'
                            : (_controller.errorMessage ?? 'Lỗi khi xóa'),
                      ),
                      backgroundColor: success ? Colors.green : Colors.red,
                    ),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Xóa', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showAddCategoryDialog() {
    _addController.clear();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Thêm danh mục mới'),
        content: TextField(
          controller: _addController,
          decoration: const InputDecoration(
            hintText: 'Nhập tên danh mục...',
            border: OutlineInputBorder(),
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              final name = _addController.text.trim();
              if (name.isNotEmpty) {
                Navigator.pop(context);
                final success = await _controller.addCategory(name);
                if (mounted && !success) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(_controller.errorMessage ?? 'Lỗi khi thêm'),
                    ),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.blueAccent),
            child: const Text('Thêm', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showEditCategoryDialog(CategoryModel category) {
    _addController.text = category.name;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sửa tên danh mục'),
        content: TextField(
          controller: _addController,
          decoration: const InputDecoration(
            hintText: 'Nhập tên mới...',
            border: OutlineInputBorder(),
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              final newName = _addController.text.trim();
              if (newName.isNotEmpty && newName != category.name) {
                Navigator.pop(context);
                final success = await _controller.editCategory(
                  category.id!,
                  newName,
                );
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        success
                            ? 'Cập nhật thành công'
                            : (_controller.errorMessage ?? 'Lỗi khi sửa'),
                      ),
                      backgroundColor: success ? Colors.green : Colors.red,
                    ),
                  );
                }
              } else {
                Navigator.pop(context);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.blueAccent),
            child: const Text(
              'Cập nhật',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}
