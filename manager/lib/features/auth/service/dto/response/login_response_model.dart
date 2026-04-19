class LoginResponseModel {
  final String token;
  final UserModel user;

  LoginResponseModel({required this.token, required this.user});

  factory LoginResponseModel.fromJson(Map<String, dynamic> json) {
    return LoginResponseModel(
      token: json['token'] ?? '',
      user: UserModel.fromJson(json['user']),
    );
  }
}

class UserModel {
  final String id;
  final String username;
  final String email;

  UserModel({required this.id, required this.username, required this.email});

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      username: json['username'] ?? '',
      email: json['email'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'username': username, 'email': email};
  }
}
