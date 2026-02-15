import { cartController } from "@/src/controllers/cart.controller";
import { orderController } from "@/src/controllers/order.controller";
import { Cart } from "@/src/models/cart.model";
import { userLocal } from "@/src/storage/user.local";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CheckoutScreen() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    const cartRes = await cartController.getMyCart();
    if (cartRes.ok) setCart(cartRes.data);

    const user = await userLocal.get();
    if (user?.phone) setPhone(user.phone);
    
    setLoading(false);
  };

  const handlePlaceOrder = async () => {
    if (!address.trim()) return Alert.alert("Lỗi", "Vui lòng nhập địa chỉ giao hàng");
    if (!phone.trim()) return Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
    if (!cart || cart.cartItems.length === 0) return Alert.alert("Lỗi", "Giỏ hàng trống");

    setSubmitting(true);
    const res = await orderController.create({
      address,
      phone,
      paymentMethod: "COD"
    });
    setSubmitting(false);

    if (res.ok) {
      Alert.alert("Thành công", "Đặt hàng thành công!", [
        { text: "Xem đơn hàng", onPress: () => router.replace("/orders/orders") }
      ]);
    } else {
      Alert.alert("Lỗi", res.message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const totalPrice = cart?.cartItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0) || 0;

  if (loading) {
    return <ActivityIndicator size="large" color="#2563EB" className="flex-1 justify-center items-center bg-gray-50" />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-4 border-b border-gray-100 flex-row items-center shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
             <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Thanh toán</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Shipping info */}
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
            <View className="flex-row items-center mb-3">
                <Ionicons name="location" size={20} color="#2563EB" />
                <Text className="text-lg font-bold ml-2">Thông tin nhận hàng</Text>
            </View>
            
            <Text className="text-gray-600 mb-1 font-medium">Số điện thoại</Text>
            <TextInput 
                value={phone}
                onChangeText={setPhone}
                placeholder="Nhập số điện thoại..."
                keyboardType="phone-pad"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 mb-3"
            />

            <Text className="text-gray-600 mb-1 font-medium">Địa chỉ giao hàng</Text>
            <TextInput 
                value={address}
                onChangeText={setAddress}
                placeholder="Số nhà, tên đường, phường, quận..."
                multiline
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 min-h-[80px]"
                textAlignVertical="top"
            />
        </View>

        {/* List product */}
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
            <Text className="text-lg font-bold mb-3">Sản phẩm ({cart?.cartItems.length || 0})</Text>
            {cart?.cartItems.map((item) => (
                <View key={item.id} className="flex-row items-center mb-3 pb-3 border-b border-gray-50">
                    <Image source={{ uri: item.product.imageUrl }} className="w-16 h-16 rounded-md bg-gray-200" />
                    <View className="flex-1 ml-3">
                        <Text className="font-bold text-gray-800" numberOfLines={1}>{item.product.name}</Text>
                        <View className="flex-row justify-between items-center mt-1">
                            <Text className="text-red-600 font-bold">{formatCurrency(item.product.price)}</Text>
                            <Text className="text-gray-500">x{item.quantity}</Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>

        {/* Payment method */}
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
                <Ionicons name="cash" size={24} color="#10B981" />
                <Text className="text-base font-bold ml-2">Thanh toán khi nhận hàng</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
        </View>
      </ScrollView>

      {/* Checkout button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 shadow-lg pb-8">
        <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-600 text-base">Tổng thanh toán:</Text>
            <Text className="text-2xl font-bold text-red-600">{formatCurrency(totalPrice)}</Text>
        </View>
        <TouchableOpacity 
            className={`py-4 rounded-xl items-center shadow-sm ${submitting ? 'bg-blue-400' : 'bg-blue-600'}`}
            onPress={handlePlaceOrder}
            disabled={submitting}
        >
            <Text className="text-white font-bold text-lg">{submitting ? "Đang xử lý..." : "Đặt hàng"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}