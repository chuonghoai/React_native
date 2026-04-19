class LoginResponseModel {
  final String tempToken;

  LoginResponseModel({
    required this.tempToken,
  });

  factory LoginResponseModel.fromJson(Map<String, dynamic> json) {
    return LoginResponseModel(
      tempToken: json['tempToken'] ?? '',
    );
  }
}