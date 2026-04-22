// ignore_for_file: deprecated_member_use, use_build_context_synchronously, use_super_parameters

import 'package:flutter/material.dart';
import 'package:manager/features/auth/ui/forgotPassword/verify_email_screen.dart';
import 'login_controller.dart';
import '../../../../main.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // Color design
  final Color amberGold = const Color(0xFFF5A623);
  final Color darkAmber = const Color(0xFFD48806);
  final Color textMain = const Color(0xFF1C1E21);
  final Color textSub = const Color(0xFF8E8E93);
  final Color bgDarker = const Color(0xFFF5F6F8);
  final Color borderColor = const Color(0xFFEAEAEA);

  // Controller init
  final LoginController _controller = LoginController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  // Handle: Login
  void _handleLogin() async {
    FocusScope.of(context).unfocus();
    bool success = await _controller.login(
      _emailController.text.trim(),
      _passwordController.text,
    );

    if (success) {
      if (!mounted) return;
      navigatorKey.currentState?.pushNamedAndRemoveUntil(
        '/home',
        (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgDarker,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // LOGO
              Text(
                "ECommerce Admin",
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.w900,
                  fontStyle: FontStyle.italic,
                  letterSpacing: -1.5,
                  color: darkAmber,
                  shadows: [
                    Shadow(
                      color: darkAmber.withOpacity(0.3),
                      offset: const Offset(0, 4),
                      blurRadius: 10,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Text(
                "Hệ thống quản trị nội bộ",
                style: TextStyle(
                  fontSize: 15,
                  color: textSub,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 40),

              // Login Card
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
                        // Error message
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

                        // Input Email
                        Text(
                          "Email",
                          style: TextStyle(
                            color: textMain,
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          decoration: InputDecoration(
                            hintText: "Nhập email admin",
                            hintStyle: TextStyle(color: textSub),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 14,
                            ),
                            filled: true,
                            fillColor: Colors.white,
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(color: borderColor),
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
                        const SizedBox(height: 20),

                        // Input password
                        Text(
                          "Mật khẩu",
                          style: TextStyle(
                            color: textMain,
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _passwordController,
                          obscureText: true,
                          decoration: InputDecoration(
                            hintText: "Nhập mật khẩu",
                            hintStyle: TextStyle(color: textSub),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 14,
                            ),
                            filled: true,
                            fillColor: Colors.white,
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(color: borderColor),
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
                        const SizedBox(height: 12),

                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            // Forgot password?
                            TextButton(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) =>
                                        const VerifyEmailScreen(),
                                  ),
                                );
                              },
                              style: TextButton.styleFrom(
                                padding: EdgeInsets.zero,
                                minimumSize: Size.zero,
                                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              ),
                              child: Text(
                                "Quên mật khẩu?",
                                style: TextStyle(
                                  color: amberGold,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 32),

                        // Login Button
                        ElevatedButton(
                          onPressed: _controller.isLoading
                              ? null
                              : _handleLogin,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: amberGold,
                            disabledBackgroundColor: amberGold.withOpacity(0.5),
                            elevation: 4,
                            shadowColor: amberGold.withOpacity(0.4),
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
                                  "Tiếp tục",
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
