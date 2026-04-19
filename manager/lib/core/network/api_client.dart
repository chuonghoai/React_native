// ignore_for_file: avoid_print, use_build_context_synchronously

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../storage/local_storage.dart';
import 'api_response.dart';
import '../../main.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  late Dio dio;

  factory ApiClient() {
    return _instance;
  }

  ApiClient._internal() {
    BaseOptions options = BaseOptions(
      baseUrl: 'http://10.0.2.2:8087',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    );

    dio = Dio(options);

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await LocalStorage.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },

        /// Success
        onResponse: (response, handler) {
          if (response.data is Map<String, dynamic>) {
            final apiResponse = ApiResponse.fromJson(response.data);

            response.data = apiResponse;
          }
          return handler.next(response);
        },

        /// Error
        onError: (DioException e, handler) async {
          String errorMessage = 'Lỗi kết nối máy chủ';
          String errorCode = 'UNKNOWN_ERROR';

          if (e.response?.data != null &&
              e.response?.data is Map<String, dynamic>) {
            final errorResponse = ApiResponse.fromJson(e.response!.data);
            if (errorResponse.error != null) {
              errorMessage = errorResponse.error!.message;
              errorCode = errorResponse.error!.code;
            } else if (errorResponse.message != null) {
              errorMessage = errorResponse.message!;
            }
          }

          if (e.response?.statusCode == 401 &&
              errorCode != 'INVALID_CREDENTIALS') {
            print(
              "Token hết hạn hoặc không hợp lệ. Xóa token và đá ra Login...",
            );

            await LocalStorage.clearAll();

            final context = navigatorKey.currentContext;
            if (context != null) {
              showDialog(
                context: context,
                barrierDismissible: false,
                builder: (BuildContext ctx) {
                  return AlertDialog(
                    title: const Text("Hết phiên đăng nhập"),
                    content: const Text(
                      "Phiên đăng nhập của bạn đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.",
                    ),
                    actions: [
                      TextButton(
                        onPressed: () {
                          Navigator.of(ctx).pop();
                          navigatorKey.currentState?.pushNamedAndRemoveUntil(
                            '/login',
                            (route) => false,
                          );
                        },
                        child: const Text("Đồng ý"),
                      ),
                    ],
                  );
                },
              );
            }
          }

          final customError = DioException(
            requestOptions: e.requestOptions,
            response: e.response,
            type: e.type,
            error: errorMessage,
          );

          return handler.next(customError);
        },
      ),
    );
  }

  Dio get client => dio;
}
