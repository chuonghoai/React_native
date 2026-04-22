class CategoryModel {
  final int id;
  final String name;

  CategoryModel({required this.id, required this.name});

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(id: json['id'] ?? 0, name: json['name'] ?? '');
  }

  Map<String, dynamic> toJson() => {'id': id, 'name': name};
}

class ReviewModel {
  final int id;
  final String fullname;
  final String avatarUrl;
  final int rating;
  final String comment;
  final DateTime createdAt;

  ReviewModel({
    required this.id,
    required this.fullname,
    required this.avatarUrl,
    required this.rating,
    required this.comment,
    required this.createdAt,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: json['id'] ?? 0,
      fullname: json['fullname'] ?? '',
      avatarUrl: json['avatarUrl'] ?? '',
      rating: json['rating'] ?? 0,
      comment: json['comment'] ?? '',
      createdAt: DateTime.parse(json['createdAt'] ?? ''),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'fullname': fullname,
    'avatarUrl': avatarUrl,
    'rating': rating,
    'comment': comment,
    'createdAt': createdAt.toIso8601String(),
  };
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
  final List<ReviewModel>? reviews;

  ProductModel({
    this.id,
    required this.name,
    required this.price,
    this.description,
    this.imageUrl,
    required this.quantity,
    this.soldCount,
    this.category,
    this.reviews,
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
      reviews: json['reviews'] != null
          ? (json['reviews'] as List<dynamic>)
                .map((e) => ReviewModel.fromJson(e as Map<String, dynamic>))
                .toList()
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
      'reviews': reviews?.map((e) => e.toJson()).toList(),
    };
  }
}
