import { authController } from "@/src/controllers/auth.controller";
import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function OtpSendScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSendOtp() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await authController.sendForgotOtp(email);
      if (!res.ok) Alert.alert("Lỗi", res.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold text-center mb-3">Reset Password</Text>
      <Text className="text-center text-gray-500 mb-8">
        Nhập email để nhận mã OTP
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        className="border rounded-lg px-4 py-3 mb-4"
      />

      <TouchableOpacity
        className={`py-3 rounded-lg mb-4 ${loading ? "bg-blue-300" : "bg-blue-600"}`}
        onPress={onSendOtp}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold">
          {loading ? "Đang gửi..." : "Gửi mã OTP"}
        </Text>
      </TouchableOpacity>

      <Link href="/(auth)/login" className="text-center text-blue-600">
        Quay lại đăng nhập
      </Link>
    </View>
  );
}
