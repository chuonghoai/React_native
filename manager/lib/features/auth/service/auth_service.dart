import 'package:dio/dio.dart';
import '../../../core/storage/local_storage.dart';
import 'dto/response/login_response_model.dart';
import '../repository/auth_repository.dart';

class AuthService {
  final AuthRepository _repository = AuthRepository();

  // Login
  Future<String?> processLogin(
    String email,
    String password,
    bool rememberMe,
  ) async {
    try {
      final apiResponse = await _repository.login(email, password, rememberMe);

      if (apiResponse.success && apiResponse.data != null) {
        final loginData = LoginResponseModel.fromJson(apiResponse.data);

        await LocalStorage.setToken(loginData.tempToken);

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

  // Verify login OTP
  Future<String?> processVerifyLoginOtp(String otp) async {
    try {
      final tempToken = await LocalStorage.getToken();
      if (tempToken == null || tempToken.isEmpty) {
        return "Phiên đăng nhập bị lỗi hoặc đã hết hạn. Vui lòng đăng nhập lại.";
      }
      final apiResponse = await _repository.verifyLoginOtp(tempToken, otp);

      if (apiResponse.success && apiResponse.data != null) {
        final data = apiResponse.data;
        await LocalStorage.setToken(data['accessToken']);
        await LocalStorage.setRefreshToken(data['refreshToken']);
        await LocalStorage.setUser(data['user']);

        // await WebsocketGateway().connect();

        return null;
      } else {
        return apiResponse.message ?? "Mã OTP không hợp lệ";
      }
    } on DioException catch (e) {
      return e.error?.toString() ?? "Lỗi kết nối máy chủ";
    } catch (e) {
      return "Đã xảy ra lỗi: $e";
    }
  }
}
