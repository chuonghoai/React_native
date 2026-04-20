import 'package:manager/shared/models/product_model.dart';

class VoucherModel {
  final int? id;
  final String name;
  final double discountAmount;
  final DateTime startDate;
  final DateTime endDate;
  final List<ProductModel>? products;

  VoucherModel({
    this.id,
    required this.name,
    required this.discountAmount,
    required this.startDate,
    required this.endDate,
    this.products,
  });

  factory VoucherModel.fromJson(Map<String, dynamic> json) {
    return VoucherModel(
      id: json['id'] as int?,
      name: json['name'] as String? ?? '',
      discountAmount: (json['discountAmount'] as num?)?.toDouble() ?? 0.0,
      startDate: json['startDate'] != null
          ? DateTime.parse(json['startDate'])
          : DateTime.now(),
      endDate: json['endDate'] != null
          ? DateTime.parse(json['endDate'])
          : DateTime.now(),
      products: json['products'] != null
          ? (json['products'] as List)
              .map((p) => ProductModel.fromJson(p))
              .toList()
          : null,
    );
  }
}
