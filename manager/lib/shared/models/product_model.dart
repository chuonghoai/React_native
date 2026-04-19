class CategoryModel {
  final int id;
  final String name;

  CategoryModel({required this.id, required this.name});

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {'id': id, 'name': name};
}

class ProductModel {
  final int? id;
  final String name;
  final double price;
  final String? description;
  final String? imageUrl;
  final int quantity;
  final int? soldCount;
  final CategoryModel? category;

  ProductModel({
    this.id,
    required this.name,
    required this.price,
    this.description,
    this.imageUrl,
    required this.quantity,
    this.soldCount,
    this.category,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'],
      name: json['name'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      description: json['description'],
      imageUrl: json['imageUrl'],
      quantity: json['quantity'] ?? 0,
      soldCount: json['soldCount'],
      category: json['category'] != null 
          ? CategoryModel.fromJson(json['category']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'price': price,
      'description': description,
      'imageUrl': imageUrl,
      'quantity': quantity,
      'soldCount': soldCount,
      'category': category?.toJson(),
    };
  }
}