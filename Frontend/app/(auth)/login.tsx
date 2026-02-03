import { authController } from "@/src/controllers/auth.controller";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    if (loading) return;
    setLoading(true);

    try {
      const result = await authController.login({ username, password });
      if (!result.ok) {
        Alert.alert("Lỗi", result.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold text-center mb-8">Login</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        className="border rounded-lg px-4 py-3 mb-4"
      />

      <View className="border rounded-lg mb-6 flex-row items-center px-4">
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={hidePassword}
          autoCapitalize="none"
          className="flex-1 py-3"
        />

        <TouchableOpacity
          onPress={() => setHidePassword((v) => !v)}
          className="pl-3 py-3"
          accessibilityLabel={hidePassword ? "Show password" : "Hide password"}
        >
          <MaterialCommunityIcons
            name={hidePassword ? "eye-off-outline" : "eye-outline"}
            size={22}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className={`py-3 rounded-lg mb-4 ${loading ? "bg-blue-300" : "bg-blue-600"}`}
        onPress={onLogin}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold">
          {loading ? "Đang đăng nhập..." : "Login"}
        </Text>
      </TouchableOpacity>

      <View className="flex-row justify-between">
        <Link href="/(auth)/register" className="text-blue-600">
          Register
        </Link>
        <Link href="/(auth)/otp-send" className="text-blue-600">
          Forgot password?
        </Link>
      </View>
    </View>
  );
}
