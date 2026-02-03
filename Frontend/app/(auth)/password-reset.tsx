import { authController } from "@/src/controllers/auth.controller";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function PasswordResetScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = useMemo(() => (params.email ?? "").toString(), [params.email]);

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onReset() {
    if (loading) return;
    setLoading(true);

    try {
      const res = await authController.resetPassword({
        email,
        otp,
        newPassword,
      });

      if (!res.ok) {
        Alert.alert("Lỗi", res.message);
        return;
      }

      Alert.alert(
        "Thành công",
        "Cập nhật mật khẩu thành công, vui lòng đăng nhập lại."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold text-center mb-3">Nhập OTP</Text>
      <Text className="text-center text-gray-500 mb-8">
        OTP đã được gửi tới:{" "}
        <Text className="font-semibold text-gray-700">{email}</Text>
      </Text>

      <TextInput
        placeholder="OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        className="border rounded-lg px-4 py-3 mb-4"
      />

      <TextInput
        placeholder="Mật khẩu mới"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        className="border rounded-lg px-4 py-3 mb-6"
      />

      <TouchableOpacity
        className={`py-3 rounded-lg ${loading ? "bg-green-300" : "bg-green-600"}`}
        onPress={onReset}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold">
          {loading ? "Đang cập nhật..." : "Reset Password"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
