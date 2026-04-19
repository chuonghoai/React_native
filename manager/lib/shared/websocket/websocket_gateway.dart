// ignore_for_file: library_prefixes, avoid_print, prefer_interpolation_to_compose_strings

import 'dart:async';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import '../../core/storage/local_storage.dart';
import '../../core/network/api_client.dart';

class WebsocketGateway {
  // Singleton pattern
  static final WebsocketGateway _instance = WebsocketGateway._internal();
  factory WebsocketGateway() => _instance;
  WebsocketGateway._internal();

  StompClient? stompClient;

  List<String> onlineUsers = [];

  // Start connect websocket
  Future<void> connect() async {
    if (stompClient != null && stompClient!.isActive) return;

    final token = await LocalStorage.getToken();
    if (token == null) return;

    final String baseUrl = ApiClient().client.options.baseUrl;
    final String socketUrl = baseUrl.replaceFirst(RegExp(r'^http'), 'ws') + '/ws';

    stompClient = StompClient(
      config: StompConfig(
        url: socketUrl,
        onConnect: _onConnect,
        onWebSocketError: (dynamic error) => print('❌ [WebSocket] Lỗi kết nối Socket: $error'),
        onStompError: (dynamic error) => print('❌ [WebSocket] Lỗi STOMP: ${error.message}'),
        onDisconnect: (frame) => print('🔌 [WebSocket] Đã ngắt kết nối'),
        stompConnectHeaders: {'Authorization': 'Bearer $token'},
        webSocketConnectHeaders: {'Authorization': 'Bearer $token'},
      ),
    );

    stompClient!.activate();
  }

  void _onConnect(StompFrame frame) {
    print('🌐 [WebSocket] Đã kết nối STOMP thành công!');
    _registerGlobalListeners();
  }

  // Listen global events
  void _registerGlobalListeners() {
    if (stompClient == null) return;

    // stompClient!.subscribe(
    //   destination: '/topic/bidding',
    //   callback: (frame) {
    //     print('Tin nhắn từ hệ thống: ${frame.body}');
    //   },
    // );
  }

  /// Helper: Check user online
  bool isUserOnline(String userId) {
    return onlineUsers.contains(userId);
  }

  // Disconnect websocket
  void disconnect() {
    if (stompClient != null) {
      stompClient!.deactivate();
      stompClient = null;
      print('🔌 [WebSocket] Đã dọn dẹp và ngắt Socket an toàn');
    }
  }
}
