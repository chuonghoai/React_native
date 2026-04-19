import 'package:dio/dio.dart';
import 'package:manager/shared/websocket/websocket_gateway.dart';
import '../../../core/storage/local_storage.dart';
import 'dto/response/login_response_model.dart';
import '../repository/auth_repository.dart';

class AuthService {
  final AuthRepository _repository = AuthRepository();

  // Login
  Future<String?> processLogin(String username, String password) async {
    try {
      final apiResponse = await _repository.login(username, password);

      if (apiResponse.success && apiResponse.data != null) {
        final loginData = LoginResponseModel.fromJson(apiResponse.data);
        await LocalStorage.setToken(loginData.token);
        await LocalStorage.setUser(loginData.user.toJson());
        await WebsocketGateway().connect();

        return null;
      } else {
        return apiResponse.message ?? "Lỗi không xác định từ máy chủ.";
      }
    } on DioException catch (e) {
      return e.error?.toString() ?? "Lỗi kết nối máy chủ.";
    } catch (e) {
      return "Đã xảy ra lỗi hệ thống: $e";
    }
  }
}
