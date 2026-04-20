import 'dart:io';

import 'package:manager/features/product/repository/product_repository.dart';
import 'package:manager/shared/models/product_model.dart';

class AdminProductService {
  final ProductRepository _repository = ProductRepository();

  Map<String, dynamic> _prepareRequestData(ProductModel product) {
    final Map<String, dynamic> data = product.toJson();
    if (product.category != null) {
      data['categoryId'] = product.category!.id;
    }
    data.remove('category');
    return data;
  }

  Future<ProductModel> createProduct(ProductModel product) async {
    try {
      final requestData = _prepareRequestData(product);
      final response = await _repository.createProduct(requestData);

      if (response.success && response.data != null) {
        return ProductModel.fromJson(response.data);
      }
      throw Exception(response.message ?? 'Lỗi khi tạo sản phẩm');
    } catch (e) {
      rethrow;
    }
  }

  Future<ProductModel> getProductDetail(int id) async {
    try {
      final response = await _repository.getProductById(id);

      if (response.success && response.data != null) {
        return ProductModel.fromJson(response.data);
      }
      throw Exception(response.message ?? 'Không tìm thấy sản phẩm');
    } catch (e) {
      rethrow;
    }
  }

  Future<ProductModel> updateProduct(ProductModel product) async {
    if (product.id == null) throw Exception('ID sản phẩm không hợp lệ');

    try {
      final requestData = _prepareRequestData(product);
      final response = await _repository.updateProduct(
        product.id!,
        requestData,
      );

      if (response.success && response.data != null) {
        return ProductModel.fromJson(response.data);
      }
      throw Exception(response.message ?? 'Lỗi khi cập nhật sản phẩm');
    } catch (e) {
      rethrow;
    }
  }

  Future<String> uploadImage(int id, File imageFile) async {
    try {
      final response = await _repository.uploadImage(id, imageFile);
      if (response.success && response.data != null) {
        return response.data as String;
      }
      throw Exception(response.message ?? 'Lỗi khi upload ảnh');
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteProduct(int id) async {
    try {
      final response = await _repository.deleteProduct(id);
      if (!response.success) {
        throw Exception(response.message ?? 'Lỗi khi xóa sản phẩm');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<bool> createProductWithImage(ProductModel product, File? image) async {
    try {
      final Map<String, dynamic> data = {
        'name': product.name,
        'price': product.price.toString(),
        'quantity': product.quantity.toString(),
        'description': product.description ?? '',
        'categoryId': product.category!.id.toString(),
      };

      final response = await _repository.createProductWithImage(data, image);

      if (response.success) {
        return true;
      } else {
        throw Exception(response.message ?? 'Lỗi không xác định từ server');
      }
    } catch (e) {
      rethrow;
    }
  }
}
