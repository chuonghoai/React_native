import { authController } from "@/src/controllers/auth.controller";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (loading) return;

    if (!username || !email || !password) {
      Alert.alert("Loi", "Vui long dien day du thong tin");
      return;
    }

    setLoading(true);
    try {
      const response = await authController.register({
        username,
        password,
        email,
      });

      if (response.ok) {
        router.push(`./otp-register?email=${encodeURIComponent(email.trim())}`);
        return;
      }

      Alert.alert("Dang ky that bai", response.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold text-center mb-8">Dang ky</Text>

      <TextInput
        placeholder="Tai khoan"
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
        placeholder="Mat khau"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="border rounded-lg px-4 py-3 mb-6"
      />

      <TouchableOpacity
        className={`py-3 rounded-lg mb-4 ${loading ? "bg-green-300" : "bg-green-600"}`}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold">
          {loading ? "Dang xu ly..." : "Dang ky"}
        </Text>
      </TouchableOpacity>

      <Link href="/(auth)/login" className="text-center text-blue-600">
        Quay lai dang nhap
      </Link>
    </View>
  );
}
