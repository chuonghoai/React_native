import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:manager/features/home/service/category_service.dart';
import 'package:manager/features/product/service/product_service.dart';
import 'package:manager/shared/models/product_model.dart';

class ProductController extends ChangeNotifier {
  final AdminProductService _productService = AdminProductService();
  final CategoryService _categoryService = CategoryService();

  // States
  bool isLoading = false;
  String? errorMessage;
  ProductModel? currentProduct;
  List<CategoryModel> categories = [];
  File? selectedImage;

  final ImagePicker _picker = ImagePicker();

  Future<void> fetchProductDetail(int id) async {
    try {
      isLoading = true;
      errorMessage = null;
      notifyListeners();

      currentProduct = await _productService.getProductDetail(id);
    } catch (e) {
      errorMessage = e.toString();
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchCategories() async {
    try {
      categories = await _categoryService.getAllCategories();
      notifyListeners();
    } catch (e) {
      print("Lỗi tải danh mục: $e");
    }
  }

  Future<void> pickImage() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      selectedImage = File(image.path);
      notifyListeners();
    }
  }

  Future<bool> updateProduct(ProductModel updatedModel) async {
    try {
      isLoading = true;
      notifyListeners();

      final result = await _productService.updateProduct(updatedModel);
      currentProduct = result;
      return true;
    } catch (e) {
      errorMessage = e.toString();
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}
