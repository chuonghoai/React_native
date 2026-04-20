import '../models/category_model.dart';
import '../repository/category_repository.dart';
import '../repository/dto/category_request.dart';

class AdminCategoryService {
  final CategoryRepository _repository = CategoryRepository();

  Future<List<CategoryModel>> getCategories() async {
    try {
      final response = await _repository.getAllCategories();
      if (response.success && response.data != null) {
        final List<dynamic> list = response.data;
        return list.map((item) => CategoryModel.fromJson(item)).toList();
      }
      throw Exception(response.message ?? 'Không thể tải danh mục');
    } catch (e) {
      rethrow;
    }
  }

  Future<bool> createCategory(CategoryRequest request) async {
    try {
      final response = await _repository.createCategory(request);
      if (response.success) {
        return true;
      }
      throw Exception(response.message ?? 'Lỗi khi tạo danh mục');
    } catch (e) {
      rethrow;
    }
  }

  Future<bool> updateCategory(int id, CategoryRequest request) async {
    try {
      final response = await _repository.updateCategory(id, request);
      if (response.success) {
        return true;
      }
      throw Exception(response.message ?? 'Lỗi khi cập nhật danh mục');
    } catch (e) {
      rethrow;
    }
  }

  Future<bool> deleteCategory(int id) async {
    try {
      final response = await _repository.deleteCategory(id);
      if (response.success) {
        return true;
      }
      throw Exception(response.message ?? 'Lỗi khi xóa danh mục');
    } catch (e) {
      rethrow;
    }
  }
}
