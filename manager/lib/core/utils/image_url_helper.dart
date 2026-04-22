import '../network/api_client.dart';

class ImageUrlHelper {
  static String? buildUrl(String? path) {
    if (path == null || path.isEmpty) return null;
    if (path.startsWith('http')) return path;

    final baseUrl = ApiClient().client.options.baseUrl;
    final base = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    final fullPath = path.startsWith('/') ? path : '/$path';
    return '$base$fullPath';
  }
}
