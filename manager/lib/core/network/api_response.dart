class ApiResponse<T> {
  final bool success;
  final String? message;
  final T? data;
  final ApiError? error;

  ApiResponse({
    required this.success,
    this.message,
    this.data,
    this.error,
  });

  factory ApiResponse.fromJson(Map<String, dynamic> json) {
    ApiError? parsedError;
    if (json['error'] != null) {
      if (json['error'] is String) {
        // Trường hợp Spring tự trả về: "error": "Unauthorized", "status": 401
        parsedError = ApiError(
          code: json['status']?.toString() ?? 'SPRING_ERROR',
          message: json['error'],
        );
      } else if (json['error'] is Map) {
        parsedError = ApiError.fromJson(json['error']);
      }
    }

    return ApiResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? parsedError?.message,
      data: json['data'],
      error: parsedError,
    );
  }
}

class ApiError {
  final String code;
  final String message;

  ApiError({required this.code, required this.message});

  factory ApiError.fromJson(Map<String, dynamic> json) {
    return ApiError(
      code: json['code'] ?? 'UNKNOWN_ERROR',
      message: json['message'] ?? 'Đã xảy ra lỗi không xác định',
    );
  }
}