import 'package:manager/features/home/repository/product_repository.dart';
import 'package:manager/shared/models/product_model.dart';

class ProductService {
  final ProductRepository _repository = ProductRepository();

  Future<List<ProductModel>> getProducts({int page = 0, int size = 20}) async {
    try {
      final response = await _repository.getProducts(page: page, size: size);
      if (response.success && response.data != null) {
        final List<dynamic> content = response.data['content'] ?? [];
        return content.map((json) => ProductModel.fromJson(json)).toList();
      }
      throw Exception(response.message ?? 'Lỗi lấy danh sách sản phẩm');
    } catch (e) {
      rethrow;
    }
  }

  Future<List<ProductModel>> getLowStockWarning({int threshold = 10}) async {
    try {
      final response = await _repository.getLowStockWarning(
        threshold: threshold,
      );
      if (response.success && response.data != null) {
        final List<dynamic> list = response.data as List<dynamic>;
        return list.map((json) => ProductModel.fromJson(json)).toList();
      }
      throw Exception(response.message ?? 'Lỗi lấy cảnh báo hết hàng');
    } catch (e) {
      rethrow;
    }
  }
}
