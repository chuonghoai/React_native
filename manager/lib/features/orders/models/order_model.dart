class OrderModel {
  final int id;
  final double totalPrice;
  final String status;
  final String? paymentMethod;
  final String? orderDate;
  final String? shippingAddress;
  final String? shippingPhone;

  OrderModel({
    required this.id,
    required this.totalPrice,
    required this.status,
    this.paymentMethod,
    this.orderDate,
    this.shippingAddress,
    this.shippingPhone,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'] ?? 0,
      totalPrice: (json['totalPrice'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] ?? 'UNKNOWN',
      paymentMethod: json['paymentMethod'],
      orderDate: json['orderDate'],
      shippingAddress: json['shippingAddress'],
      shippingPhone: json['shippingPhone'],
    );
  }
}
