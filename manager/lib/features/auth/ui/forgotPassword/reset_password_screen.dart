// ignore_for_file: deprecated_member_use, use_super_parameters

import 'package:flutter/material.dart';
import 'forgot_password_controller.dart';

class ResetPasswordScreen extends StatefulWidget {
  final ForgotPasswordController controller;

  const ResetPasswordScreen({Key? key, required this.controller}) : super(key: key);

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmController = TextEditingController();

  final Color amberGold = const Color(0xFFF5A623);
  final Color bgDarker = const Color(0xFFF5F6F8);

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  void _handleReset() async {
    FocusScope.of(context).unfocus();
    bool success = await widget.controller.resetPassword(
      _passwordController.text,
      _confirmController.text,
    );

    if (success) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại."),
          backgroundColor: Color(0xFF34C759),
        ),
      );
      Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgDarker,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFF1C1E21)),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                "Tạo mật khẩu mới",
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF1C1E21)),
              ),
              const SizedBox(height: 12),
              const Text(
                "Mật khẩu mới của bạn phải khác với mật khẩu đã sử dụng trước đó.",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 15, color: Color(0xFF8E8E93)),
              ),
              const SizedBox(height: 40),

              Container(
                padding: const EdgeInsets.all(24.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 15, offset: const Offset(0, 5)),
                  ],
                ),
                child: AnimatedBuilder(
                  animation: widget.controller,
                  builder: (context, child) {
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        if (widget.controller.errorMessage != null) ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFF3B30).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              widget.controller.errorMessage!,
                              style: const TextStyle(color: Color(0xFFFF3B30), fontSize: 14, fontWeight: FontWeight.w500),
                              textAlign: TextAlign.center,
                            ),
                          ),
                          const SizedBox(height: 20),
                        ],

                        const Text("Mật khẩu mới", style: TextStyle(color: Color(0xFF1C1E21), fontWeight: FontWeight.w600, fontSize: 14)),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _passwordController,
                          obscureText: true,
                          decoration: InputDecoration(
                            hintText: "Nhập mật khẩu mới",
                            hintStyle: const TextStyle(color: Color(0xFF8E8E93)),
                            filled: true,
                            fillColor: Colors.white,
                            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFEAEAEA))),
                            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: amberGold, width: 1.5)),
                          ),
                        ),
                        const SizedBox(height: 20),

                        const Text("Xác nhận mật khẩu", style: TextStyle(color: Color(0xFF1C1E21), fontWeight: FontWeight.w600, fontSize: 14)),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _confirmController,
                          obscureText: true,
                          decoration: InputDecoration(
                            hintText: "Nhập lại mật khẩu mới",
                            hintStyle: const TextStyle(color: Color(0xFF8E8E93)),
                            filled: true,
                            fillColor: Colors.white,
                            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFEAEAEA))),
                            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: amberGold, width: 1.5)),
                          ),
                        ),
                        const SizedBox(height: 32),

                        ElevatedButton(
                          onPressed: widget.controller.isLoading ? null : _handleReset,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: amberGold,
                            disabledBackgroundColor: amberGold.withOpacity(0.5),
                            minimumSize: const Size(double.infinity, 54),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(27)),
                          ),
                          child: widget.controller.isLoading
                              ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                              : const Text("Đổi mật khẩu", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}