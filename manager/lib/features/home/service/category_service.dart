import 'package:manager/features/home/repository/category_repository.dart';
import 'package:manager/shared/models/product_model.dart';

class CategoryService {
  final CategoryRepository _repository = CategoryRepository();

  Future<List<CategoryModel>> getAllCategories() async {
    try {
      final response = await _repository.getAllCategories();
      if (response.success && response.data != null) {
        final List<dynamic> list = response.data as List<dynamic>;
        return list.map((json) => CategoryModel.fromJson(json)).toList();
      }
      throw Exception(response.message ?? 'Lỗi lấy danh sách danh mục');
    } catch (e) {
      rethrow;
    }
  }
}
