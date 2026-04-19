// ignore_for_file: use_super_parameters, use_build_context_synchronously, deprecated_member_use

import 'package:flutter/material.dart';
import '../../../../shared/ui/otp_verify/otp_verify_screen.dart';
import 'forgot_password_controller.dart';
import 'reset_password_screen.dart';

class VerifyEmailScreen extends StatefulWidget {
  const VerifyEmailScreen({Key? key}) : super(key: key);

  @override
  State<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends State<VerifyEmailScreen> {
  final ForgotPasswordController _controller = ForgotPasswordController();
  final TextEditingController _emailController = TextEditingController();

  final Color amberGold = const Color(0xFFF5A623);
  final Color bgDarker = const Color(0xFFF5F6F8);

  @override
  void dispose() {
    _controller.dispose();
    _emailController.dispose();
    super.dispose();
  }

  // Button handle send OTP (verify email)
  void _handleSendOtp() async {
    FocusScope.of(context).unfocus();
    bool success = await _controller.sendOtp(_emailController.text.trim());

    if (success) {
      if (!mounted) return;
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => OtpVerifyScreen(
            title: "Khôi phục mật khẩu",
            onVerify: (otp) async {
              bool isVerified = await _controller.verifyOtp(otp);

              if (isVerified) {
                if (!mounted) return;
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                    builder: (context) =>
                        ResetPasswordScreen(controller: _controller),
                  ),
                );
              } else {
                throw Exception(_controller.errorMessage);
              }
            },
          ),
        ),
      );
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
                "Quên mật khẩu?",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1C1E21),
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                "Đừng lo lắng! Vui lòng nhập địa chỉ email liên kết với tài khoản Admin của bạn.",
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
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 15,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: AnimatedBuilder(
                  animation: _controller,
                  builder: (context, child) {
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        if (_controller.errorMessage != null) ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFF3B30).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              _controller.errorMessage!,
                              style: const TextStyle(
                                color: Color(0xFFFF3B30),
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                          const SizedBox(height: 20),
                        ],

                        const Text(
                          "Email",
                          style: TextStyle(
                            color: Color(0xFF1C1E21),
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          decoration: InputDecoration(
                            hintText: "Nhập email của bạn",
                            hintStyle: const TextStyle(
                              color: Color(0xFF8E8E93),
                            ),
                            filled: true,
                            fillColor: Colors.white,
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(
                                color: Color(0xFFEAEAEA),
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(
                                color: amberGold,
                                width: 1.5,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 32),

                        ElevatedButton(
                          onPressed: _controller.isLoading
                              ? null
                              : _handleSendOtp,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: amberGold,
                            disabledBackgroundColor: amberGold.withOpacity(0.5),
                            minimumSize: const Size(double.infinity, 54),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(27),
                            ),
                          ),
                          child: _controller.isLoading
                              ? const SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Text(
                                  "Gửi mã xác nhận",
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
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
