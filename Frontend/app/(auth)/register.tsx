import { authController } from "@/src/controllers/auth.controller";
import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold text-center mb-8">Đăng ký</Text>

      <TextInput
        placeholder="Tài khoản"
        value={username}
        onChangeText={setUsername}
        className="border rounded-lg px-4 py-3 mb-4"
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        className="border rounded-lg px-4 py-3 mb-4"
      />

      <TextInput
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="border rounded-lg px-4 py-3 mb-6"
      />

      <TouchableOpacity
        className="bg-green-600 py-3 rounded-lg mb-4"
        onPress={async () => {
          const result = await authController.register({ username, email, password });
          if (!result.ok) {
            Alert.alert("Lỗi", result.message);
          }
        }}
      >
        <Text className="text-white text-center font-semibold">
          Đăng ký
        </Text>
      </TouchableOpacity>

      <Link href="/(auth)/login" className="text-center text-blue-600">
        Quay lại đăng nhập
      </Link>
    </View>
  );
}
