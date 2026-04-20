class VoucherRequest {
  final String name;
  final double discountAmount;
  final DateTime startDate;
  final DateTime endDate;
  final List<int> productIds;

  VoucherRequest({
    required this.name,
    required this.discountAmount,
    required this.startDate,
    required this.endDate,
    required this.productIds,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'discountAmount': discountAmount,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'productIds': productIds,
    };
  }
}
