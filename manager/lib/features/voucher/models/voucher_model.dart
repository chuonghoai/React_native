class VoucherModel {
  final int? id;
  final String name;
  final double discountAmount;
  final DateTime startDate;
  final DateTime endDate;

  VoucherModel({
    this.id,
    required this.name,
    required this.discountAmount,
    required this.startDate,
    required this.endDate,
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
    );
  }
}
