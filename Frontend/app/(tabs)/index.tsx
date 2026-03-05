import { authController } from "@/src/controllers/auth.controller";
import { homeController } from "@/src/controllers/home.controller";
import { userController } from "@/src/controllers/user.controller";
import type { UserData } from "@/src/models/user.model";
import { userLocal } from "@/src/storage/user.local";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [me, setMe] = useState<UserData | null>(null);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const cached = await userLocal.get();
    if (cached) {
      setMe(cached);
    }

    try {
      const res = await homeController.loadMe();
      
      if (res.ok && res.data) {
        console.log("Server User Data:", res.data);
        
        setMe(res.data);
      }
    } catch (error) {
      console.error("Load me error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function onLogout() {
     Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đồng ý",
        style: "destructive",
        onPress: async () => {
          await authController.logout();
        },
      },
    ]);
  }
  
  if (loading && !me) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
        }
      >

        {/* User infomation */}
        <View className="bg-white pb-6 pt-4 rounded-b-3xl shadow-sm items-center mb-6">
          {/* Avartar */}
          <View className="relative mb-4">
            <Image
              source={{
                uri: me?.avatarUrl || `https://ui-avatars.com/api/?name=${me?.fullname || "User"}&background=random&size=200`,
              }}
              className="w-28 h-28 rounded-full border-4 border-gray-100 bg-gray-200"
            />
          </View>

          {/* Full name */}
          <Text className="text-2xl font-bold text-gray-800 mb-1">
            {me?.fullname || "Chưa cập nhật tên"}
          </Text>
          
          {/* Username */}
          <Text className="text-gray-500 font-medium mb-4">
            @{me?.username}
          </Text>

          {/* SDT, email and reward points */}
          <View className="flex-row gap-2 mb-6">
            <View className="flex-row items-center bg-blue-50 px-3 py-1 rounded-full">
              <Ionicons name="call" size={14} color="#2563EB" />
              <Text className="ml-1 text-blue-700 text-xs font-semibold">
                {me?.phone || "Chưa có SĐT"}
              </Text>
            </View>
            <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full">
              <Ionicons name="mail" size={14} color="#4B5563" />
              <Text className="ml-1 text-gray-600 text-xs">
                {me?.email || "Chưa có Email"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center bg-yellow-50 px-4 py-1.5 rounded-full mb-6 border border-yellow-200">
            <MaterialCommunityIcons name="crown" size={18} color="#D97706" />
            <Text className="ml-1.5 text-yellow-700 font-bold text-sm">
              Điểm tích lũy: {me?.rewardPoints || 0}
            </Text>
          </View>
          
          {/* Edit profile button */}
          <TouchableOpacity
            onPress={() => setShowEditProfile(true)}
            className="bg-black px-6 py-2.5 rounded-full flex-row items-center"
          >
            <Ionicons name="create-outline" size={18} color="white" />
            <Text className="text-white font-semibold ml-2">Sửa hồ sơ</Text>
          </TouchableOpacity>
        </View>

        {/* User's cart/order */}
        <View className="px-4 mb-6">
          <View className="flex-row gap-3">
            {/* Cart button */}
            <TouchableOpacity
              className="flex-1 bg-white p-4 rounded-2xl shadow-sm items-center border border-gray-100"
              onPress={() => router.push("/cart/cart")} 
            >
              <View className="bg-blue-50 p-3 rounded-full mb-2">
                <Ionicons name="cart" size={24} color="#2563EB" />
              </View>
              <Text className="font-bold text-gray-700">Giỏ hàng</Text>
            </TouchableOpacity>

            {/* Orders button */}
            <TouchableOpacity
              className="flex-1 bg-white p-4 rounded-2xl shadow-sm items-center border border-gray-100"
              onPress={() => router.push("/orders/orders")}
            >
              <View className="bg-orange-50 p-3 rounded-full mb-2">
                <Ionicons name="receipt" size={24} color="#F97316" />
              </View>
              <Text className="font-bold text-gray-700">Đơn hàng</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User function */}
        <View className="px-4">
          <Text className="text-gray-500 font-bold mb-3 uppercase text-xs ml-2">
            Cài đặt tài khoản
          </Text>
          
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {/* Change password button */}
            <TouchableOpacity
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={() => setShowPasswordModal(true)}
            >
              <View className="bg-orange-100 p-2 rounded-xl mr-3">
                <Ionicons name="key" size={20} color="orange" />
              </View>
              <Text className="flex-1 text-gray-700 font-medium">Đổi mật khẩu</Text>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            {/* Change email button */}
            <TouchableOpacity
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={() => setShowEmailModal(true)}
            >
              <View className="bg-purple-100 p-2 rounded-xl mr-3">
                <Ionicons name="mail" size={20} color="purple" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-medium">Đổi Email</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            {/* Logout button */}
            <TouchableOpacity
              className="flex-row items-center p-4"
              onPress={onLogout}
            >
              <View className="bg-red-100 p-2 rounded-xl mr-3">
                <Ionicons name="log-out" size={20} color="#DC2626" />
              </View>
              <Text className="flex-1 text-red-600 font-medium">Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        currentUser={me}
        onSuccess={loadData}
      />

      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <ChangeEmailModal
        visible={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        currentEmail={me?.email || ""}
      />
    </View>
  );
}

function EditProfileModal({ visible, onClose, currentUser, onSuccess }: any) {
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && currentUser) {
      setFullname(currentUser.fullname || "");
      setPhone(currentUser.phone || "");
      setAvatarUrl(currentUser.avatarUrl || "");
      setLocalImageUri(null);
    }
  }, [visible, currentUser]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri);
    }
  };

  async function handleSave() {
    setLoading(true);
    let finalAvatarUrl = avatarUrl;

    if (localImageUri) {
      const uploadRes = await userController.uploadAvatarImage(localImageUri);
      if (uploadRes.ok && uploadRes.url) {
        finalAvatarUrl = uploadRes.url;
      } else {
        Alert.alert("Lỗi tải ảnh", uploadRes.message);
        setLoading(false);
        return;
      }
    }

    const res = await userController.updateProfile({ 
      fullname, 
      phone, 
      avatarUrl: finalAvatarUrl 
    });
    
    setLoading(false);

    if (res.ok) {
      Alert.alert("Thành công", "Đã cập nhật hồ sơ");
      onSuccess();
      onClose();
    } else {
      Alert.alert("Lỗi", res.message);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-gray-50">
        <View className="bg-white px-4 py-4 flex-row justify-between items-center border-b border-gray-200 shadow-sm">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-blue-600 text-lg">Hủy</Text>
          </TouchableOpacity>
          <Text className="font-bold text-lg">Sửa hồ sơ</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            <Text className={`text-lg font-bold ${loading ? "text-gray-400" : "text-blue-600"}`}>
              {loading ? "Đang lưu..." : "Lưu"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="p-4">
          {/* AVATAR */}
          <View className="items-center mb-6 mt-4">
            <TouchableOpacity onPress={pickImage} className="items-center relative">
              <Image
                source={{ uri: localImageUri || avatarUrl || currentUser?.avatarUrl || "https://ui-avatars.com/api/?name=User" }}
                className="w-24 h-24 rounded-full border-2 border-gray-200 mb-2"
              />
              <View className="absolute bottom-2 right-0 bg-blue-600 p-1.5 rounded-full border-2 border-white">
                <Ionicons name="camera" size={14} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* PROFILE */}
          <View className="bg-white rounded-xl px-4 py-2 border border-gray-200">
            <View className="py-3 border-b border-gray-100 flex-row items-center">
              <Text className="w-24 text-gray-500">Username</Text>
              <Text className="flex-1 text-gray-400 font-medium">@{currentUser?.username}</Text>
              <Ionicons name="lock-closed" size={14} color="#9CA3AF" />
            </View>

            <View className="py-3 border-b border-gray-100 flex-row items-center">
              <Text className="w-24 text-gray-900 font-medium">Họ tên</Text>
              <TextInput 
                value={fullname}
                onChangeText={setFullname}
                placeholder="Nhập họ tên"
                className="flex-1 text-blue-600 font-medium"
              />
            </View>

            <View className="py-3 flex-row items-center">
              <Text className="w-24 text-gray-900 font-medium">Số ĐT</Text>
              <TextInput 
                value={phone}
                onChangeText={setPhone}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                className="flex-1 text-blue-600 font-medium"
              />
            </View>
          </View>
          
          <Text className="text-gray-400 text-xs text-center mt-4">
            Username không thể thay đổi vì lý do định danh.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

function ChangePasswordModal({ visible, onClose }: any) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!oldPassword || !newPassword) return Alert.alert("Lỗi", "Vui lòng nhập đủ thông tin");
    setLoading(true);
    const res = await userController.changePassword({ oldPassword, newPassword });
    setLoading(false);
    if (res.ok) {
      Alert.alert("Thành công", "Đổi mật khẩu thành công");
      setOldPassword("");
      setNewPassword("");
      onClose();
    } else {
      Alert.alert("Lỗi", res.message);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-3xl p-6 h-[70%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold">Đổi mật khẩu</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={30} color="#E5E7EB" /></TouchableOpacity>
          </View>
          <View className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
             <TextInput placeholder="Mật khẩu cũ" secureTextEntry value={oldPassword} onChangeText={setOldPassword} className="py-2" />
          </View>
          <View className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
             <TextInput placeholder="Mật khẩu mới" secureTextEntry value={newPassword} onChangeText={setNewPassword} className="py-2" />
          </View>
          <TouchableOpacity onPress={handleSubmit} disabled={loading} className="bg-blue-600 py-4 rounded-xl items-center">
            <Text className="text-white font-bold text-lg">{loading ? "Đang xử lý..." : "Xác nhận đổi"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function ChangeEmailModal({ visible, onClose, currentEmail }: any) {
  const [step, setStep] = useState<1 | 2>(1);
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (visible) { setStep(1); setNewEmail(""); setOtp(""); } }, [visible]);

  async function handleSendOtp() {
    if (!newEmail || newEmail === currentEmail) return Alert.alert("Lỗi", "Email không hợp lệ");
    setLoading(true);
    const res = await userController.requestChangeEmail(newEmail);
    setLoading(false);
    if (res.ok) { setStep(2); Alert.alert("Kiểm tra email", `Đã gửi OTP tới ${newEmail}`); } 
    else Alert.alert("Lỗi", res.message);
  }

  async function handleVerify() {
    if (!otp) return Alert.alert("Lỗi", "Nhập OTP");
    setLoading(true);
    const res = await userController.verifyChangeEmail({ newEmail, otp });
    setLoading(false);
    if (res.ok) { Alert.alert("Thành công", "Email đã được thay đổi!"); onClose(); } 
    else Alert.alert("Lỗi", res.message);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-3xl p-6 h-[70%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold">{step === 1 ? "Nhập Email mới" : "Xác thực OTP"}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={30} color="#E5E7EB" /></TouchableOpacity>
          </View>

          {step === 1 ? (
            <>
              <Text className="text-gray-500 mb-4">Email hiện tại: {currentEmail}</Text>
              <TextInput placeholder="Email mới..." value={newEmail} onChangeText={setNewEmail} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6" autoCapitalize="none" keyboardType="email-address" />
              <TouchableOpacity onPress={handleSendOtp} disabled={loading} className="bg-blue-600 py-4 rounded-xl items-center"><Text className="text-white font-bold text-lg">{loading ? "Đang gửi..." : "Tiếp tục"}</Text></TouchableOpacity>
            </>
          ) : (
            <>
              <Text className="text-center text-gray-500 mb-4">Nhập mã 6 số gửi về <Text className="font-bold text-black">{newEmail}</Text></Text>
              <TextInput placeholder="OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6 text-center text-2xl tracking-widest font-bold" />
              <TouchableOpacity onPress={handleVerify} disabled={loading} className="bg-green-600 py-4 rounded-xl items-center"><Text className="text-white font-bold text-lg">{loading ? "Xác thực..." : "Hoàn tất"}</Text></TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}