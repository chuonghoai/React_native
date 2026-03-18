import { authService } from "@/src/services/auth.service";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function OtpRegisterScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(
    typeof params.email === "string" ? params.email : "",
  );
  const [otp, setOtp] = useState("");
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const previewUri =
    localImageUri ||
    avatarUrl ||
    "https://ui-avatars.com/api/?name=Avatar&background=random&size=200";

  async function handlePickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Loi", "Can cap quyen truy cap thu vien anh");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri);
      setAvatarUrl("");
    }
  }

  async function handleVerifyOtp() {
    if (loading) return;

    const cleanEmail = email.trim();
    const cleanOtp = otp.trim();
    const cleanFullname = fullname.trim();
    const cleanPhone = phone.trim();

    if (!cleanEmail || !cleanOtp || !cleanFullname || !cleanPhone) {
      Alert.alert("Loi", "Vui long nhap day du thong tin");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.verifyOtp({
        email: cleanEmail,
        otp: cleanOtp,
        fullname: cleanFullname,
        phone: cleanPhone,
        avatarUrl: avatarUrl.trim() || undefined,
        avatar: localImageUri || undefined,
      });

      if (!res?.success) {
        Alert.alert("Xac thuc that bai", res?.message || "OTP khong hop le");
        return;
      }

      Alert.alert(
        "Xac thuc thanh cong",
        "Vui long dang nhap lai de tiep tuc.",
        [
          {
            text: "Dang nhap",
            onPress: () => router.replace("/(auth)/login"),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert("Loi", error?.message || "Khong the xac thuc OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 justify-center px-6 py-10">
        <Text className="text-3xl font-bold text-center mb-3">
          Xac thuc tai khoan
        </Text>
        <Text className="text-center text-gray-500 mb-8">
          Nhap OTP va hoan thien thong tin cua ban
        </Text>

        <View className="items-center mb-6">
          <Image
            source={{ uri: previewUri }}
            style={{ width: 110, height: 110, borderRadius: 999 }}
            contentFit="cover"
          />
          <TouchableOpacity
            className="mt-3 px-4 py-2 rounded-lg bg-gray-100"
            onPress={handlePickAvatar}
            disabled={loading}
          >
            <Text className="text-gray-700 font-medium">
              Chon avatar tu dien thoai
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="border rounded-lg px-4 py-3 mb-4"
        />

        <TextInput
          placeholder="Ma OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          className="border rounded-lg px-4 py-3 mb-4"
        />

        <TextInput
          placeholder="Fullname"
          value={fullname}
          onChangeText={setFullname}
          className="border rounded-lg px-4 py-3 mb-4"
        />

        <TextInput
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          className="border rounded-lg px-4 py-3 mb-6"
        />

        <TouchableOpacity
          className={`py-3 rounded-lg mb-4 ${loading ? "bg-blue-300" : "bg-blue-600"}`}
          onPress={handleVerifyOtp}
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold">
            {loading ? "Dang xac thuc..." : "Xac thuc OTP"}
          </Text>
        </TouchableOpacity>

        <Link href="/(auth)/login" className="text-center text-blue-600">
          Quay lai dang nhap
        </Link>
      </View>
    </ScrollView>
  );
}
