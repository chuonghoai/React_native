// ignore_for_file: use_super_parameters, deprecated_member_use

import 'package:flutter/material.dart';
import 'otp_verify_controller.dart';

class OtpVerifyScreen extends StatefulWidget {
  final String title;
  final Future<void> Function(String otp) onVerify;

  const OtpVerifyScreen({Key? key, required this.title, required this.onVerify})
    : super(key: key);

  @override
  State<OtpVerifyScreen> createState() => _OtpVerifyScreenState();
}

class _OtpVerifyScreenState extends State<OtpVerifyScreen> {
  late final OtpVerifyController _controller;
  final TextEditingController _otpInputController = TextEditingController();

  final Color amberGold = const Color(0xFFF5A623);
  final Color textMain = const Color(0xFF1C1E21);
  final Color textSub = const Color(0xFF8E8E93);

  @override
  void initState() {
    super.initState();
    _controller = OtpVerifyController(onVerifyCallback: widget.onVerify);
  }

  @override
  void dispose() {
    _controller.dispose();
    _otpInputController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F6F8),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: textMain),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                widget.title,
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: textMain,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                "Mã xác minh gồm 6 chữ số đã được gửi đến email của bạn.",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 15, color: textSub),
              ),
              const SizedBox(height: 40),

              // OTP card
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

                        // Input OTP
                        TextField(
                          controller: _otpInputController,
                          maxLength: 6,
                          keyboardType: TextInputType.number,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 32,
                            letterSpacing: 24,
                            fontWeight: FontWeight.bold,
                            color: textMain,
                          ),
                          decoration: InputDecoration(
                            counterText: "",
                            hintText: "------",
                            hintStyle: const TextStyle(
                              color: Color(0xFFEAEAEA),
                              letterSpacing: 24,
                            ),
                            filled: true,
                            fillColor: Colors.white,
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(
                                color: Color(0xFFEAEAEA),
                                width: 1.5,
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(
                                color: amberGold,
                                width: 2,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 32),

                        // Submit button
                        ElevatedButton(
                          onPressed: _controller.isLoading
                              ? null
                              : () => _controller.submitOtp(
                                  _otpInputController.text.trim(),
                                ),
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
                                  "Xác nhận",
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
