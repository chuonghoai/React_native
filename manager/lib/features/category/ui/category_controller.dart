import 'package:flutter/material.dart';
import '../models/category_model.dart';
import '../service/category_service.dart';
import '../repository/dto/category_request.dart';

class CategoryController extends ChangeNotifier {
  final AdminCategoryService _service = AdminCategoryService();

  List<CategoryModel> categories = [];
  bool isLoading = false;
  String? errorMessage;

  /// Get all categories
  Future<void> fetchCategories() async {
    try {
      isLoading = true;
      errorMessage = null;
      notifyListeners();

      categories = await _service.getCategories();
    } catch (e) {
      errorMessage = e.toString();
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  /// Create new category
  Future<bool> addCategory(String name) async {
    if (name.trim().isEmpty) return false;

    try {
      isLoading = true;
      notifyListeners();

      final request = CategoryRequest(name: name.trim());
      final success = await _service.createCategory(request);

      if (success) {
        await fetchCategories();
      }
      return success;
    } catch (e) {
      errorMessage = e.toString();
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  /// Edit category
  Future<bool> editCategory(int id, String newName) async {
    if (newName.trim().isEmpty) return false;

    try {
      isLoading = true;
      notifyListeners();

      final request = CategoryRequest(name: newName.trim());
      final success = await _service.updateCategory(id, request);

      if (success) {
        await fetchCategories();
      }
      return success;
    } catch (e) {
      errorMessage = e.toString();
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  /// Delete category
  Future<bool> deleteCategory(int id) async {
    try {
      isLoading = true;
      notifyListeners();

      final success = await _service.deleteCategory(id);

      if (success) {
        await fetchCategories();
      }
      return success;
    } catch (e) {
      errorMessage = e.toString();
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}
