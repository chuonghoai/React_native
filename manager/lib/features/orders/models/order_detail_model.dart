class OrderItem {
  final int id;
  final int quantity;
  final double price;
  final String productName;
  final String productImageUrl;

  OrderItem({
    required this.id,
    required this.quantity,
    required this.price,
    required this.productName,
    required this.productImageUrl,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'] ?? 0,
      quantity: json['quantity'] ?? 0,
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      productName: json['productName'] ?? '',
      productImageUrl: json['productImageUrl'] ?? '',
    );
  }
}

class OrderDetailModel {
  final int id;
  final double totalPrice;
  final String status;
  final String? paymentMethod;
  final String? orderDate;
  final String? shippingAddress;
  final String? shippingPhone;
  final String? buyerName;
  final String? buyerEmail;
  final List<OrderItem> items;

  OrderDetailModel({
    required this.id,
    required this.totalPrice,
    required this.status,
    this.paymentMethod,
    this.orderDate,
    this.shippingAddress,
    this.shippingPhone,
    this.buyerName,
    this.buyerEmail,
    required this.items,
  });

  factory OrderDetailModel.fromJson(Map<String, dynamic> json) {
    return OrderDetailModel(
      id: json['id'] ?? 0,
      totalPrice: (json['totalPrice'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] ?? 'UNKNOWN',
      paymentMethod: json['paymentMethod'],
      orderDate: json['orderDate'],
      shippingAddress: json['shippingAddress'],
      shippingPhone: json['shippingPhone'],
      buyerName: json['buyerName'],
      buyerEmail: json['buyerEmail'],
      items:
          (json['items'] as List<dynamic>?)
              ?.map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}
